import { NextResponse, after } from "next/server";
import { remainingUnits } from "@/lib/stock";
import { invoiceCreation, vatTaxRateId } from "@/lib/invoice";
import { stripe } from "@/lib/stripe";
import { checkoutName, getProduct, isAvailable } from "@/lib/products";
import { appId, salon, siteUrl } from "@/lib/config";
import { sendCapi, capiAllowed, buildFbc } from "@/lib/meta-capi";

export const runtime = "nodejs";

type Body = {
  productId?: string;
  eventId?: string;
  consent?: boolean;
  fbp?: string;
  fbc?: string;
  fbclid?: string;
  sourceUrl?: string;
};

const clip = (v: string | undefined | null, n = 500) => (v ? v.slice(0, n) : "");

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatná požiadavka." }, { status: 400 });
  }

  const product = getProduct(body.productId ?? "");
  if (!product || !isAvailable(product)) {
    return NextResponse.json({ error: "Tento darček momentálne nie je v predaji." }, { status: 400 });
  }

  // Obmedzený balík: nepredáme viac kusov, než zostáva.
  const remaining = await remainingUnits(product);
  if (remaining === 0) {
    return NextResponse.json({ error: "Tento balík je už vypredaný." }, { status: 409 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
  const ua = req.headers.get("user-agent") ?? undefined;
  const consent = body.consent === true;
  // IP, prehliadač a fbclid uložíme aj bez súhlasu, ak to CAPI_REQUIRE_CONSENT dovoľuje. Cookies Mety (_fbp, _fbc) len so súhlasom.
  const share = capiAllowed(consent);
  const sourceUrl = body.sourceUrl?.startsWith(siteUrl) ? body.sourceUrl : siteUrl;

  const taxRate = await vatTaxRateId();
  const lineName = `${checkoutName(product)} – ${salon.name}`;

  let session;
  try {
    session = await stripe().checkout.sessions.create({
    mode: "payment",
    locale: "sk",
    line_items: [
      {
        quantity: 1,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: Math.min(20, remaining ?? 20) },
        price_data: {
          currency: "eur",
          unit_amount: product.priceCents,
          product_data: {
            // Na platobnej stránke je meno firmy (PEDORE s.r.o.), preto pridáme názov salónu.
            name: lineName,
            description: product.includes.join(" + ").slice(0, 500),
          },
        },
        tax_rates: taxRate ? [taxRate] : undefined,
      },
    ],
    // Po zaplatení Stripe vystaví faktúru a pošle ju zákazníkovi.
    invoice_creation: invoiceCreation(product.id, lineName),
    phone_number_collection: { enabled: true },
    custom_fields: [
      {
        key: "obdarovany",
        label: { type: "custom", custom: "Meno obdarovaného (nepovinné)" },
        type: "text",
        optional: true,
        text: { maximum_length: 60 },
      },
    ],
    custom_text: {
      submit: {
        message: `Poukážku v PDF a faktúru vám pošleme e-mailom hneď po zaplatení. Zaplatením súhlasíte s obchodnými podmienkami: ${siteUrl}/obchodne-podmienky`,
      },
    },
    success_url: `${siteUrl}/dakujeme?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}${product.landingPath ?? "/#darceky"}`,
    metadata: {
      app: appId,
      product_id: product.id,
      consent: consent ? "1" : "0",
      fbp: consent ? clip(body.fbp) : "",
      fbc: consent ? clip(body.fbc) : "",
      fbclid: share ? clip(body.fbclid) : "",
      ip: share ? clip(ip) : "",
      ua: share ? clip(ua) : "",
      source_url: clip(sourceUrl),
    },
    payment_intent_data: {
      description: `Poukážka ${product.name}`,
      metadata: { product_id: product.id },
    },
  });
  } catch (err) {
    console.error("[checkout] Stripe session zlyhala", err);
    return NextResponse.json({ error: "Platbu sa nepodarilo otvoriť." }, { status: 502 });
  }

  // Conversions API: InitiateCheckout s rovnakým event_id ako Pixel v prehliadači.
  if (body.eventId && share) {
    const eventId = body.eventId.slice(0, 100);
    after(() =>
      sendCapi({
        eventName: "InitiateCheckout",
        eventId,
        sourceUrl,
        user: {
          ip,
          userAgent: ua,
          fbp: consent ? body.fbp : undefined,
          fbc: buildFbc(consent ? body.fbc : undefined, body.fbclid),
        },
        custom: {
          currency: "EUR",
          value: product.priceCents / 100,
          content_ids: [product.id],
          content_name: product.name,
          content_type: "product",
          num_items: 1,
        },
      }),
    );
  }

  return NextResponse.json({ url: session.url });
}
