import BuyButton from "./BuyButton";
import TrackView from "./TrackView";
import { ClockIcon, GiftIcon, Seal, Snowflake, Star } from "./Decor";
import { formatEur, type Product } from "@/lib/products";

export default function VoucherCard({ p, flag }: { p: Product; flag?: string }) {
  const price = formatEur(p.priceCents);
  return (
    <TrackView
      productId={p.id}
      productName={p.name}
      priceCents={p.priceCents}
      className={`voucher ${p.featured ? "voucher--featured" : ""}`}
      data-reveal="up"
    >
      <span className="voucher__sheen" aria-hidden="true" />
      {p.featured ? <Seal /> : <Snowflake className="voucher__flake" />}
      <div className="voucher__body">
        {p.featured && <p className="sr-only">Najobľúbenejší darček</p>}
        {flag ? (
          <p className="voucher__flag">{flag}</p>
        ) : (
          <p className="voucher__kicker">
            <Star />
            Darčeková poukážka
          </p>
        )}
        <h4 className="voucher__name">{p.name}</h4>
        <span className="voucher__rule" aria-hidden="true" />
        <ul className="voucher__includes">
          {p.includes.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        {p.duration && (
          <p className="voucher__meta">
            <ClockIcon />
            Trvanie {p.duration}
          </p>
        )}
        {p.bonus && (
          <p className="voucher__bonus">
            <GiftIcon />
            <span>Navyše: {p.bonus}</span>
          </p>
        )}
        {p.note && <p className="voucher__meta">{p.note}</p>}
      </div>
      <div className="voucher__stub">
        <p className="voucher__pricebox">
          <span className="voucher__price-label">Cena</span>
          <span className="voucher__price">{price}</span>
        </p>
        <BuyButton
          productId={p.id}
          productName={p.name}
          priceCents={p.priceCents}
          label={`Kúpiť za ${price}`}
          variant={p.featured ? "dark" : "light"}
        />
      </div>
    </TrackView>
  );
}
