import "server-only";
import { stripe } from "./stripe";
import { saleWindowMs } from "./products";
import { appId } from "./config";

/**
 * Koľko kusov sa z obmedzených balíkov už predalo (zaplatené Stripe Checkout platby od začiatku predaja).
 * Rátajú sa kusy, nie platby: jedna platba môže obsahovať viac poukážok.
 * Len platby z tejto stránky (metadata.app), oba salóny majú rovnaké ID balíkov a môžu zdieľať Stripe účet.
 */
export async function soldUnits(productIds: string[], since: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = Object.fromEntries(productIds.map((id) => [id, 0]));
  const created = { gte: Math.floor(saleWindowMs(since, since).start / 1000) };
  for await (const s of stripe().checkout.sessions.list({ status: "complete", created, limit: 100, expand: ["data.line_items"] })) {
    const id = s.metadata?.product_id;
    if (s.metadata?.app !== appId || s.payment_status !== "paid" || !id || !(id in counts)) continue;
    counts[id] += s.line_items?.data[0]?.quantity ?? 1;
  }
  return counts;
}

/** Zostávajúce kusy balíka, alebo null, ak balík nemá limit alebo sa počet nepodarilo zistiť. */
export async function remainingUnits(p: { id: string; stock?: number; availableFrom?: string }): Promise<number | null> {
  if (!p.stock) return null;
  try {
    const sold = await soldUnits([p.id], p.availableFrom ?? "2000-01-01");
    return Math.max(0, p.stock - (sold[p.id] ?? 0));
  } catch (err) {
    // Pri výpadku Stripe radšej predaj nepustíme blokovať; limit sa vtedy nekontroluje.
    console.error(`[stock] počet predaných ${p.id} sa nepodarilo zistiť`, err);
    return null;
  }
}
