import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { getProduct, formatEur } from "@/lib/products";
import { salon } from "@/lib/config";
import { purchaseEventId } from "@/lib/fulfillment";
import PurchaseTracker from "@/components/PurchaseTracker";
import Snowfall from "@/components/Snowfall";
import { Bow } from "@/components/Decor";

export const metadata: Metadata = { title: "Ďakujeme za nákup | Relax Žilina", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let session = null;
  if (session_id?.startsWith("cs_")) {
    try {
      session = await stripe().checkout.sessions.retrieve(session_id, { expand: ["line_items"] });
    } catch {
      session = null;
    }
  }

  const paid = session?.payment_status === "paid";
  const product = getProduct(session?.metadata?.product_id ?? "");
  const qty = session?.line_items?.data[0]?.quantity ?? 1;

  return (
    <main className="thanks">
      <Snowfall />
      <div className="wrap thanks__in">
        <Bow className="thanks__bow" />
        {paid && session ? (
          <>
            <h1>Ďakujeme, darček je zaplatený</h1>
            <p className="hero__lead">
              {qty > 1 ? `${qty} poukážky` : "Poukážku"} <strong>{product?.name ?? "Darčeková poukážka"}</strong> v PDF sme poslali na{" "}
              <strong>{session.customer_details?.email}</strong>. Ak ju o pár minút nenájdete, pozrite aj priečinok Spam alebo Promo akcie.
            </p>
            <div className="thanks__box">
              <p>Zaplatené: <strong>{formatEur(session.amount_total ?? 0)}</strong></p>
              <p>
                Obdarovaná si termín rezervuje na <a href={salon.bookingUrl}>Visblee</a> alebo na čísle{" "}
                <a href={salon.phoneHref}>{salon.phone}</a> a uvedie kód z poukážky.
              </p>
              <p>Tlačenú poukážku v darčekovej obálke vám radi pripravíme v salóne.</p>
            </div>
            <PurchaseTracker
              eventId={purchaseEventId(session.id)}
              value={(session.amount_total ?? 0) / 100}
              contentIds={[session.metadata?.product_id ?? ""]}
              contentName={product?.name ?? ""}
              numItems={qty}
            />
          </>
        ) : (
          <>
            <h1>Platbu ešte overujeme</h1>
            <p className="hero__lead">
              Hneď ako ju platobná brána potvrdí, poukážka vám príde e-mailom. Ak do 15 minút nepríde, zavolajte nám na{" "}
              <a href={salon.phoneHref}>{salon.phone}</a>.
            </p>
          </>
        )}
        <p><Link className="linklike" href="/">Späť na darčeky</Link></p>
      </div>
    </main>
  );
}
