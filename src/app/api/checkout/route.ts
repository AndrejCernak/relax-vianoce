import { NextResponse, after } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProduct, isAvailable } from "@/lib/products";
import { siteUrl } from "@/lib/config";
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

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || undefined;
  const ua = req.headers.get("user-agent") ?? undefined;
  const consent = body.consent === true;
  const sourceUrl = body.sourceUrl?.startsWith(siteUrl) ? body.sourceUrl : siteUrl;

  let session;
  try {
    session = await stripe().checkout.sessions.create({
    mode: "payment",
    locale: "sk",
    line_items: [
      {
        quantity: 1,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: 20 },
        price_data: {
          currency: "eur",
          unit_amount: product.priceCents,
          product_data: {
            name: `Darčeková poukážka: ${product.name}`,
            description: product.includes.join(" + ").slice(0, 500),
          },
        },
      },
    ],
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
        message: `Poukážku v PDF vám pošleme e-mailom hneď po zaplatení. Zaplatením súhlasíte s obchodnými podmienkami: ${siteUrl}/obchodne-podmienky`,
      },
    },
    success_url: `${siteUrl}/dakujeme?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/#darceky`,
    metadata: {
      product_id: product.id,
      consent: consent ? "1" : "0",
      fbp: consent ? clip(body.fbp) : "",
      fbc: consent ? clip(body.fbc) : "",
      fbclid: consent ? clip(body.fbclid) : "",
      ip: consent ? clip(ip) : "",
      ua: consent ? clip(ua) : "",
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
  if (body.eventId && capiAllowed(consent)) {
    const eventId = body.eventId.slice(0, 100);
    after(() =>
      sendCapi({
        eventName: "InitiateCheckout",
        eventId,
        sourceUrl,
        user: {
          ip: consent ? ip : undefined,
          userAgent: consent ? ua : undefined,
          fbp: consent ? body.fbp : undefined,
          fbc: consent ? buildFbc(body.fbc, body.fbclid) : undefined,
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
