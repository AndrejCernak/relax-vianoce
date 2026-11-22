import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./black-friday.css";
import BlackFridayShop, { type BfPhase, type BfTier } from "@/components/BlackFridayShop";
import { ConsentSettingsLink } from "@/components/ConsentBanner";
import { PhoneIcon, Star } from "@/components/Decor";
import { blackFridayWindow, formatEur, isDeal, products, saleWindowMs } from "@/lib/products";
import { blackFriday as bf, salon } from "@/lib/config";
import { soldUnits } from "@/lib/stock";

// Stav akcie (pred / počas / po) sa dopočíta aj v prehliadači, toto je len čerstvosť prvého zobrazenia.
export const revalidate = 60;

const tiers: BfTier[] = products.filter(isDeal).map((p) => ({
  id: p.id,
  tier: p.tier ?? p.name,
  name: p.name,
  priceCents: p.priceCents,
  compareAtCents: p.compareAtCents ?? p.priceCents,
  sessions: p.sessions ?? 1,
  includes: p.includes,
  stock: p.stock,
  remaining: p.stock,
}));
const maxSave = Math.max(...tiers.map((t) => t.compareAtCents - t.priceCents));
const maxPct = Math.max(...tiers.map((t) => Math.round((1 - t.priceCents / t.compareAtCents) * 100)));

export const metadata: Metadata = {
  title: `Black Friday: ${bf.packageName} až −${maxPct} % | ${salon.name}`,
  description: `Najväčšia Black Friday akcia ${bf.place}. ${bf.packageName} BASIC, PREMIUM a VIP so zľavou až ${formatEur(maxSave)}. Len ${bf.dateLabel}, zaplatíte online a poukážka príde hneď e-mailom.`,
  openGraph: {
    title: `Najväčšia Black Friday akcia ${bf.place}`,
    description: `${bf.packageName} až −${maxPct} %. Len ${bf.dateLabel}.`,
    locale: "sk_SK",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: bf.themeColor, width: "device-width", initialScale: 1, viewportFit: "cover" };

/** Doplní zostávajúce kusy obmedzených balíkov zo Stripe (bez Stripe kľúča ostane plný počet). */
async function withStock(list: BfTier[]): Promise<BfTier[]> {
  const limited = list.filter((t) => t.stock);
  if (!limited.length || !process.env.STRIPE_SECRET_KEY) return list;
  try {
    const sold = await soldUnits(limited.map((t) => t.id), blackFridayWindow.from);
    return list.map((t) => (t.stock ? { ...t, remaining: Math.max(0, t.stock - (sold[t.id] ?? 0)) } : t));
  } catch (err) {
    console.error("[black-friday] počet predaných kusov sa nepodarilo zistiť", err);
    return list;
  }
}

export default async function BlackFridayPage() {
  const shown = await withStock(tiers);
  const { start, end } = saleWindowMs(blackFridayWindow.from, blackFridayWindow.until);
  const now = Date.now();
  const preview = process.env.SALE_PREVIEW === "1";
  const initialPhase: BfPhase = preview ? "live" : now < start ? "soon" : now > end ? "over" : "live";
  const defaultId = (shown.find((t) => t.tier === "PREMIUM" && t.remaining !== 0) ?? shown.find((t) => t.remaining !== 0) ?? shown[0]).id;

  const faqs = [
    { q: "Dokedy môžem procedúry vyčerpať?", a: `Poukážka platí do ${bf.validUntil}.` },
    { q: "Ako sa objednám na termín?", a: `${bf.howToBook} a uveďte kód z poukážky.` },
    {
      q: "Môžem balík darovať?",
      a: "Áno. Pri platbe môžete zadať meno obdarovaného. Poukážku v PDF potom pošlete ďalej alebo vytlačíte.",
    },
    { q: "Môžem kúpiť viac balíkov?", a: "Áno. Pri platbe zmeníte počet kusov a každý balík dostane vlastný kód." },
    { q: "Je platba bezpečná?", a: "Platba prebieha cez platobnú bránu Stripe. Údaje z vašej karty salón ani my nevidíme." },
  ];

  return (
    <div className={`bf bf--${bf.theme}`}>
      <header className="bf-top">
        <Link className="bf-brand" href="/">
          <span className="bf-brand__mark" aria-hidden="true" />
          <span className="bf-brand__main">{bf.brand.main}</span>
          <span className="bf-brand__sub">{bf.brand.sub}</span>
        </Link>
        <a className="bf-call" href={salon.phoneHref} aria-label={`Zavolať do salónu ${salon.phone}`}>
          <PhoneIcon />
        </a>
      </header>

      <main>
        <section className="bf-hero">
          <div className="bf-rays" aria-hidden="true" />
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="bf-spark" />
          ))}
          <p className="bf-ribbon">Limitovaná ponuka · {bf.dateLabel}</p>
          <h1 className="bf-title">
            <span className="bf-title__pre">Najväčšia</span>{" "}
            <span className="bf-title__big">
              <span className="bf-w1">Black</span> <span className="bf-w2">Friday</span>
            </span>{" "}
            <span className="bf-title__post">akcia {bf.place}</span>
          </h1>
          <p className="bf-save">
            <span>
              Ušetrite až <strong>{formatEur(maxSave)}</strong>
            </span>
          </p>
        </section>

        <BlackFridayShop
          tiers={shown}
          defaultId={defaultId}
          startsAt={start}
          endsAt={end}
          initialPhase={initialPhase}
          preview={preview}
          packageName={bf.packageName}
          startLabel={bf.startLabel}
        />

        <section className="bf-sec bf-how">
          <h2>Ako to funguje</h2>
          <ol>
            <li>
              <b>Vyberte balík</b> BASIC, PREMIUM alebo VIP.
            </li>
            <li>
              <b>Zaplaťte</b> kartou, Apple Pay alebo Google Pay.
            </li>
            <li>
              <b>Poukážka s kódom</b> vám hneď príde e-mailom.
            </li>
            <li>
              <b>Objednajte sa.</b> {bf.howToBook} a uveďte kód.
            </li>
          </ol>
        </section>

        <section className="bf-sec bf-faq">
          <h2>Časté otázky</h2>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <section className="bf-sec bf-contact">
          <p className="bf-contact__name">{salon.fullName}</p>
          <p>
            {salon.address}
            <br />
            {salon.hours}
          </p>
          <a className="bf-contact__call" href={salon.phoneHref}>
            <PhoneIcon />
            {salon.phone}
          </a>
          <Link className="bf-contact__xmas" href="/">
            Hľadáte vianočný darček? Pozrite vianočné poukážky
          </Link>
        </section>
      </main>

      <footer className="bf-foot">
        <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
        <Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link>
        <ConsentSettingsLink />
      </footer>
    </div>
  );
}
