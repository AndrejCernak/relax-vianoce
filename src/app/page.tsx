import { Fragment } from "react";
import Link from "next/link";
import VoucherCard from "@/components/VoucherCard";
import ValueVoucher from "@/components/ValueVoucher";
import { ConsentSettingsLink } from "@/components/ConsentBanner";
import Snowfall from "@/components/Snowfall";
import HeroScene from "@/components/HeroScene";
import Countdown from "@/components/Countdown";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Bow, Hills, Lights, Ornament, PhoneIcon, Snowdrift, Snowflake, Star, Swag, Wreath, vars } from "@/components/Decor";
import { groups, products, isAvailable, valueVoucherIds, formatEur } from "@/lib/products";
import { salon, voucherValidUntil } from "@/lib/config";

// Ponuka sa mení podľa dátumu (napr. Nový rok od 27. 12.), preto stránku obnovujeme každú hodinu.
export const revalidate = 3600;

const reviews = [
  { name: "Monika", text: "Skvelé miesto na oddych po náročnom dni. Personál priateľský a prostredie maximálne uvoľňujúce." },
  { name: "Marián", text: "Príjemný a profesionálny prístup personálu ma vždy poteší." },
  { name: "Jana", text: "Každá návšteva mi dodá pozitívnu energiu a dobrú náladu." },
];

const faqs = [
  {
    q: "Ako sa poukážka uplatní?",
    a: `Obdarovaná si rezervuje termín na Visblee alebo na čísle ${salon.phone} a uvedie kód poukážky. Poukážku ukáže v salóne v mobile alebo vytlačenú.`,
  },
  { q: "Dokedy poukážka platí?", a: `Do ${voucherValidUntil}.` },
  { q: "Čo ak sa jej darček nebude páčiť?", a: "Poukážku vymeníme za inú službu v rovnakej hodnote." },
  { q: "Je platba bezpečná?", a: "Platba prebieha cez platobnú bránu Stripe. Údaje z vašej karty salón ani my nevidíme." },
  { q: "Môžem kúpiť viac poukážok naraz?", a: "Áno. Pri platbe zmeníte počet kusov a každá poukážka dostane vlastný kód." },
  { q: "Potrebujem faktúru na firmu alebo poukážky pre celý tím.", a: `Zavolajte do salónu na ${salon.phone}. Firemné objednávky pripravíme na faktúru.` },
];

const steps = [
  { title: "Vyberte darček", text: "Ceny sú rovnaké ako v bežnom cenníku salónu." },
  { title: "Zaplaťte kartou, Apple Pay alebo Google Pay", text: "Platba trvá pár sekúnd." },
  { title: "Poukážka príde e-mailom", text: "Obdarovaná si termín rezervuje sama, kedy jej to vyhovuje." },
];

/** Slová nadpisu ako samostatné prvky, aby sa mohli objavovať postupne (--i = poradie). */
function Words({ text, from, foil }: { text: string; from: number; foil?: boolean }) {
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className={foil ? "w foil" : "w"} style={vars({ "--i": from + i })}>
        {w}
      </span>
    </Fragment>
  ));
}

export default function Home() {
  const now = new Date();
  const visible = products.filter((p) => isAvailable(p, now));
  const valueOptions = visible.filter((p) => valueVoucherIds.includes(p.id));
  const hero = products.find((p) => p.featured)!;
  const forHer = groups.find((g) => g.id === "pre-nu")!;
  const groupTitle = (id: string) => groups.find((g) => g.id === id)?.title;
  const ribbon = [
    "Poukážka v PDF hneď do e-mailu",
    `Platí do ${voucherValidUntil}`,
    "Vymeniteľná za inú službu",
    "Tlačená v obálke v salóne zadarmo",
    `${salon.rating.score} z 5 na Visblee`,
  ];

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__in">
          <span className="brand">
            <Star />
            Relax Žilina
          </span>
          <a className="topbar__phone" href={salon.phoneHref}>
            <PhoneIcon />
            {salon.phone}
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__glow" aria-hidden="true" />
          <Snowfall className="hero__snow" />
          <div className="wrap hero__in">
            <div className="hero__text">
              <Countdown />
              <h1>
                <Words text="Darujte jej" from={0} />{" "}
                <em>
                  <Words text="dve hodiny" from={2} foil />
                </em>{" "}
                <Words text="len pre seba" from={4} />
              </h1>
              <p className="hero__lead">
                Vianočné poukážky do salónu Relax Žilina. Vyberiete online, zaplatíte kartou a poukážka v PDF vám hneď príde do e-mailu.
              </p>
              <div className="hero__actions">
                <a className="btn btn--gold" href="#darceky">Vybrať darček</a>
                <a className="linklike" href="#ako">Ako to funguje</a>
              </div>
              <p className="hero__rating">
                <span aria-hidden="true">★★★★★</span> {salon.rating.score} z 5 od {salon.rating.count} klientov na Visblee
              </p>
            </div>

            <HeroScene>
              <div className="scene__swag">
                <Swag className="swag" />
                <Ornament tone="wine" style={vars({ "--x": 30, "--y": 12.9, "--len": 9, "--size": 11, "--dur": "3.4s", "--delay": ".9s" })} />
                <Ornament tone="gold" style={vars({ "--x": 44, "--y": 19.7, "--len": 4, "--size": 8, "--dur": "2.9s", "--delay": "1.05s" })} />
                <Ornament tone="pine" style={vars({ "--x": 99, "--y": 10.9, "--len": 18, "--size": 9.5, "--dur": "3.8s", "--delay": "1.2s" })} />
              </div>
              <div className="gift">
                <div className="gift__box" />
                <div className="gift__lid" />
                <Bow className="gift__bow" />
                <span className="gift__tag">
                  <span className="script">S láskou</span>
                </span>
              </div>
              <div className="ticket">
                <div className="ticket__paper">
                  <div className="ticket__main">
                    <span className="ticket__kicker">Darčeková poukážka</span>
                    <span className="ticket__title">{hero.name}</span>
                    <span className="ticket__rule" />
                    <span className="ticket__small">{hero.includes[0]}</span>
                    <span className="ticket__small">{hero.includes[1]}</span>
                  </div>
                  <div className="ticket__stub">
                    <Snowflake className="ticket__flake" />
                    <span className="ticket__small">Hodnota</span>
                    <span className="ticket__value">{formatEur(hero.priceCents)}</span>
                    <span className="ticket__code">RLX-7KQ4-M2HP</span>
                  </div>
                </div>
              </div>
              <Star className="spark" />
              <Star className="spark" />
              <Star className="spark" />
              <Star className="spark" />
            </HeroScene>
          </div>
          <Snowdrift className="hero__drift" />
        </section>

        <div className="ribbon-wrap" aria-hidden="true">
          <div className="ribbon">
            <div className="ribbon__track">
              {[0, 1, 2, 3].map((k) => (
                <div className="ribbon__group" key={k}>
                  {ribbon.map((t) => (
                    <span className="ribbon__item" key={t}>
                      {t}
                      <Star />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section id="ako" className="steps">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <p className="eyebrow">
                <Star />
                Tri kroky
              </p>
              <h2>Ako to funguje</h2>
            </div>
            <ol className="steps__list" data-reveal="stagger">
              {steps.map((s, i) => (
                <li key={s.title} className="step">
                  <Wreath n={i + 1} />
                  <div>
                    <strong>{s.title}.</strong>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="darceky" className="gifts">
          <Snowflake className="gifts__flake gifts__flake--left" />
          <Snowflake className="gifts__flake gifts__flake--right" />
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <p className="eyebrow">
                <Star />
                Vianočné darčeky 2026
              </p>
              <h2>
                Darčeky <em>pod stromček</em>
              </h2>
              <p className="section__lead">Ku každej poukážke darčekové balenie, pri vybraných aj bonus navyše.</p>
            </div>

            <div className="group" id="pre-nu">
              <div className="group__head" data-reveal="up">
                <h3>
                  <Snowflake />
                  {forHer.title}
                </h3>
                <p>{forHer.intro}</p>
              </div>
              <div className="grid">
                {visible.filter((p) => p.group === "pre-nu").map((p) => <VoucherCard key={p.id} p={p} />)}
              </div>
            </div>

            <div className="group" id="dalsie">
              <div className="group__head" data-reveal="up">
                <h3>
                  <Snowflake />
                  Ďalšie darčeky
                </h3>
                <p>Pre seba pred sviatkami, pre neho a hodnotová poukážka, keď neviete, čo vybrať.</p>
              </div>
              <div className="grid">
                {visible
                  .filter((p) => p.group === "pre-seba" || p.group === "pre-neho" || p.group === "novy-rok")
                  .map((p) => <VoucherCard key={p.id} p={p} flag={groupTitle(p.group)} />)}
                {valueOptions.length > 0 && <ValueVoucher options={valueOptions} />}
              </div>
            </div>
          </div>
        </section>

        <section className="promise">
          <Lights />
          <Snowfall className="promise__snow" density={0.6} />
          <div className="wrap promise__in">
            <div data-reveal="up">
              <p className="eyebrow eyebrow--light">
                <Star />
                Istota pod stromčekom
              </p>
              <h2>Každá poukážka</h2>
              <ul>
                <li><Star />platí do {voucherValidUntil}</li>
                <li><Star />sa dá vymeniť za inú službu v rovnakej hodnote</li>
                <li><Star />má vlastný kód, ktorý sa uplatní jedenkrát</li>
                <li><Star />sa dá vyzdvihnúť vytlačená v obálke, v salóne zadarmo</li>
              </ul>
            </div>
            <div className="bigtag" aria-hidden="true">
              <div className="bigtag__card">
                <span className="bigtag__kicker">Darčeková poukážka</span>
                <span className="bigtag__script script">S láskou</span>
                <span className="bigtag__rule" />
                <span className="bigtag__name">Relax Žilina</span>
                <span className="bigtag__code">RLX-····-····</span>
              </div>
            </div>
          </div>
          <Snowdrift className="promise__drift" />
        </section>

        <section className="reviews">
          <div className="wrap">
            <div className="section-head" data-reveal="up">
              <p className="eyebrow">
                <Star />
                {salon.rating.score} z 5 na Visblee
              </p>
              <h2>Čo hovoria klienti</h2>
            </div>
            <div className="reviews__grid" data-reveal="stagger">
              {reviews.map((r) => (
                <figure key={r.name} className="postcard">
                  <span className="postcard__stamp" aria-hidden="true">
                    <Snowflake />
                  </span>
                  <blockquote>{r.text}</blockquote>
                  <figcaption className="script">{r.name}</figcaption>
                </figure>
              ))}
            </div>
            <p className="reviews__more">
              Všetkých {salon.rating.count} hodnotení nájdete na{" "}
              <a href={salon.bookingUrl} target="_blank" rel="noopener">Visblee</a>.
            </p>
          </div>
        </section>

        <section className="faq">
          <div className="wrap faq__in">
            <div className="faq__aside" data-reveal="up">
              <p className="eyebrow">
                <Star />
                Pred nákupom
              </p>
              <h2>Časté otázky</h2>
              <p>Neviete si vybrať darček? Zavolajte, radi poradíme.</p>
              <a className="btn btn--outline" href={salon.phoneHref}>
                <PhoneIcon />
                {salon.phone}
              </a>
            </div>
            <div className="faq__list" data-reveal="stagger">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <Hills className="footer__hills" />
        <Snowfall className="footer__snow" density={0.7} />
        <div className="wrap footer__in">
          <p className="footer__wish">
            <span className="script foil">Krásne sviatky</span>
            <span>vám praje tím Relax Žilina</span>
          </p>
          <div>
            <p className="brand">{salon.fullName}</p>
            <p>{salon.address}<br />{salon.hours}<br /><a href={salon.phoneHref}>{salon.phone}</a></p>
          </div>
          <nav aria-label="Právne informácie" className="footer__links">
            <Link href="/obchodne-podmienky">Obchodné podmienky</Link>
            <Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link>
            <ConsentSettingsLink />
          </nav>
        </div>
      </footer>
      <RevealOnScroll />
    </>
  );
}
