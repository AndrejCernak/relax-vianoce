import "server-only";
import type Stripe from "stripe";
import { stripe } from "./stripe";
import { appId, salon, vatRate } from "./config";

// Faktúry: Stripe po zaplatení vystaví faktúru (invoice_creation) a pošle ju zákazníkovi e-mailom,
// ak je v Stripe zapnuté Settings → Customer emails → Successful payments. Odkaz je aj v e-maile s poukážkou.

let vatRateId: Promise<string | null> | null = null;

/** ID sadzby DPH v Stripe (DPH je zahrnutá v cene). Nájde existujúcu, inak ju raz vytvorí. */
export function vatTaxRateId(): Promise<string | null> {
  if (!(vatRate > 0)) return Promise.resolve(null);
  vatRateId ??= (async () => {
    for await (const r of stripe().taxRates.list({ active: true, inclusive: true, limit: 100 })) {
      if (r.percentage === vatRate && r.country === "SK" && r.display_name === "DPH") return r.id;
    }
    const r = await stripe().taxRates.create({
      display_name: "DPH",
      percentage: vatRate,
      inclusive: true,
      country: "SK",
      description: `DPH ${vatRate} % (Slovensko)`,
    });
    return r.id;
  })().catch((err) => {
    // Predaj kvôli tomu nezastavíme, faktúra sa vtedy vystaví bez rozpisu DPH.
    console.error("[invoice] sadzbu DPH v Stripe sa nepodarilo pripraviť", err);
    vatRateId = null;
    return null;
  });
  return vatRateId;
}

/** Faktúra, ktorú Stripe vystaví po zaplatení: údaje predávajúceho a prevádzky. */
export function invoiceCreation(productId: string, description: string): Stripe.Checkout.SessionCreateParams.InvoiceCreation {
  const o = salon.operator;
  return {
    enabled: true,
    invoice_data: {
      description: description.slice(0, 1500),
      custom_fields: [
        { name: "IČO", value: o.ico },
        { name: "DIČ", value: o.dic },
        { name: "IČ DPH", value: o.icDph },
        { name: "Prevádzka", value: `${salon.fullName}, ${salon.address}`.slice(0, 140) },
      ],
      footer: `${o.company}, ${o.seat}. IČO ${o.ico}, DIČ ${o.dic}, IČ DPH ${o.icDph}.`,
      metadata: { app: appId, product_id: productId },
    },
  };
}
