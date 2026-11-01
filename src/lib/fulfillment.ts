import "server-only";
import type Stripe from "stripe";
import { stripe } from "./stripe";
import { getProduct, formatEur } from "./products";
import { salon, siteUrl, voucherValidUntil } from "./config";
import { renderVouchersPdf, voucherCode, type VoucherInfo } from "./voucher";
import { sendEmail, esc } from "./email";
import { sendCapi, capiAllowed, buildFbc } from "./meta-capi";

export const purchaseEventId = (sessionId: string) => `purchase_${sessionId}`;

/**
 * Spracuje zaplatenú objednávku: Conversions API Purchase, PDF poukážky, e-maily, n8n.
 * Je bezpečné volať ju viackrát (Stripe webhook opakuje doručenie) – kódy sú deterministické
 * a po úspechu sa na platbu zapíše príznak, ktorý ďalšie spracovanie preskočí.
 */
export async function fulfillCheckout(sessionId: string) {
  const s = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "payment_intent"],
  });
  if (s.payment_status !== "paid") {
    console.log(`[fulfill] ${sessionId} ešte nie je zaplatená (${s.payment_status})`);
    return;
  }
  const pi = s.payment_intent as Stripe.PaymentIntent | null;
  if (pi?.metadata?.fulfilled === "1") {
    console.log(`[fulfill] ${sessionId} už spracovaná`);
    return;
  }

  const md = s.metadata ?? {};
  const product = getProduct(md.product_id ?? "");
  const qty = s.line_items?.data[0]?.quantity ?? 1;
  const amount = (s.amount_total ?? 0) / 100;
  const customer = s.customer_details;
  const recipient = s.custom_fields?.find((f) => f.key === "obdarovany")?.text?.value ?? undefined;
  const productName = product?.name ?? s.line_items?.data[0]?.description ?? "Darčeková poukážka";
  const unitLabel = formatEur((s.amount_total ?? 0) / qty);

  // 1) Conversions API: Purchase so skutočnou sumou. Rovnaké event_id posiela ďakovacia stránka.
  const consent = md.consent === "1";
  if (capiAllowed(consent)) {
    await sendCapi({
      eventName: "Purchase",
      eventId: purchaseEventId(s.id),
      eventTime: s.created,
      sourceUrl: md.source_url || siteUrl,
      user: {
        email: customer?.email,
        phone: customer?.phone,
        name: customer?.name,
        city: customer?.address?.city,
        zip: customer?.address?.postal_code,
        country: customer?.address?.country ?? "sk",
        ip: consent ? md.ip || undefined : undefined,
        userAgent: consent ? md.ua || undefined : undefined,
        fbp: consent ? md.fbp || undefined : undefined,
        fbc: consent ? buildFbc(md.fbc || undefined, md.fbclid || undefined) : undefined,
      },
      custom: {
        currency: "EUR",
        value: amount,
        content_ids: [md.product_id],
        content_name: productName,
        content_type: "product",
        num_items: qty,
        order_id: s.id,
      },
    });
  }

  // 2) PDF poukážky
  const codes = Array.from({ length: qty }, (_, i) => voucherCode(s.id, i));
  const vouchers: VoucherInfo[] = codes.map((code) => ({
    code,
    productName,
    includes: product?.includes ?? [],
    valueLabel: unitLabel,
    recipient,
    validUntil: voucherValidUntil,
    bonus: product?.bonus,
  }));
  const pdf = Buffer.from(await renderVouchersPdf(vouchers)).toString("base64");
  const fileName = `Poukazka-Relax-Zilina-${codes[0]}.pdf`;

  // 3) E-mail zákazníkovi
  if (customer?.email) {
    await sendEmail({
      to: [{ email: customer.email, name: customer.name ?? undefined }],
      subject: qty > 1 ? `Vaše darčekové poukážky (${qty} ks) – ${salon.name}` : `Vaša darčeková poukážka – ${salon.name}`,
      replyTo: process.env.SALON_NOTIFY_EMAIL || undefined,
      attachments: [{ name: fileName, content: pdf }],
      html: `
        <div style="font-family:Arial,sans-serif;color:#2B1E2F;line-height:1.55;max-width:560px">
          <p>Dobrý deň${customer.name ? ` ${esc(customer.name.split(" ")[0])}` : ""},</p>
          <p>ďakujeme za nákup. V prílohe je ${qty > 1 ? "vašich " + qty + " poukážok" : "vaša poukážka"} <b>${esc(productName)}</b> v PDF. Môžete ju vytlačiť alebo poslať ďalej.</p>
          <p><b>Kód:</b> ${codes.map(esc).join(", ")}<br/>
          <b>Platí do:</b> ${esc(voucherValidUntil)}</p>
          <p>Termín si obdarovaná osoba rezervuje na <a href="${salon.bookingUrl}">visblee.sk/charlie-centrum</a> alebo na čísle ${salon.phone} a uvedie kód poukážky.</p>
          <p>Ak chcete poukážku vytlačenú v darčekovej obálke, zastavte sa v salóne. Pripravíme vám ju zadarmo.</p>
          <p>Tešíme sa,<br/>tím ${esc(salon.fullName)}<br/>${esc(salon.address)}</p>
        </div>`,
    });
  }

  // 4) Upozornenie pre salón
  if (process.env.SALON_NOTIFY_EMAIL) {
    await sendEmail({
      to: [{ email: process.env.SALON_NOTIFY_EMAIL }],
      subject: `Nový predaj: ${productName} (${formatEur(s.amount_total ?? 0)})`,
      attachments: [{ name: fileName, content: pdf }],
      html: `
        <div style="font-family:Arial,sans-serif;color:#2B1E2F;line-height:1.55">
          <p><b>${esc(productName)}</b> × ${qty}, spolu <b>${formatEur(s.amount_total ?? 0)}</b></p>
          <p>Kódy: ${codes.map(esc).join(", ")}</p>
          <p>Kupujúci: ${esc(customer?.name ?? "")}, ${esc(customer?.email ?? "")}, ${esc(customer?.phone ?? "")}<br/>
          Obdarovaný: ${esc(recipient ?? "neuvedené")}</p>
          <p>Stripe: ${esc(s.id)}</p>
        </div>`,
    });
  }

  // 5) Voliteľne n8n → NocoDB
  if (process.env.N8N_SALE_WEBHOOK_URL) {
    try {
      await fetch(process.env.N8N_SALE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          created: new Date(s.created * 1000).toISOString(),
          session_id: s.id,
          product_id: md.product_id,
          product_name: productName,
          quantity: qty,
          amount_eur: amount,
          codes,
          customer_name: customer?.name,
          customer_email: customer?.email,
          customer_phone: customer?.phone,
          recipient,
          source: "online",
        }),
      });
    } catch (err) {
      console.error("[fulfill] n8n webhook zlyhal", err);
    }
  }

  // 6) Príznak spracovania (ďalšie doručenie webhooku sa preskočí)
  if (pi) {
    await stripe().paymentIntents.update(pi.id, {
      metadata: { fulfilled: "1", voucher_codes: codes.join(",").slice(0, 500), product_id: md.product_id ?? "" },
    });
  }
  console.log(`[fulfill] ${sessionId} hotovo: ${codes.join(", ")}`);
}
