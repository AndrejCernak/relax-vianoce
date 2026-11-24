import type { Metadata } from "next";
import Link from "next/link";
import { salon, voucherValidUntil, siteUrl } from "@/lib/config";

export const metadata: Metadata = { title: "Obchodné podmienky | Relax Žilina" };

// NÁVRH – pred spustením musí text skontrolovať účtovníčka alebo právnik (spotrebiteľské právo, DPH pri poukážkach).
export default function Terms() {
  const o = salon.operator;
  return (
    <main className="legal">
      <div className="wrap legal__in">
        <p><Link className="linklike" href="/">Späť na darčeky</Link></p>
        <h1>Obchodné podmienky predaja darčekových poukážok</h1>

        <h2>1. Predávajúci</h2>
        <p>{o.company}, {o.seat}, IČO {o.ico}, DIČ {o.dic}, IČ DPH {o.icDph}, e-mail {o.email}, telefón {salon.phone}. Prevádzka: {salon.fullName}, {salon.address}.</p>

        <h2>2. Predmet</h2>
        <p>Predmetom je predaj darčekových poukážok na služby a produkty prevádzky {salon.fullName} prostredníctvom stránky {siteUrl}.</p>

        <h2>3. Cena a platba</h2>
        <p>Ceny sú uvedené v eurách vrátane DPH. Platba prebieha vopred kartou, Apple Pay alebo Google Pay cez platobnú bránu Stripe. Po zaplatení vám e-mailom príde poukážka a faktúra.</p>

        <h2>4. Doručenie</h2>
        <p>Poukážku v PDF zasielame na e-mail zadaný pri platbe bezodkladne po prijatí platby. Na požiadanie pripravíme tlačenú poukážku na vyzdvihnutie v prevádzke.</p>

        <h2>5. Platnosť a uplatnenie</h2>
        <p>Poukážka platí do {voucherValidUntil}. Termín sa rezervuje cez Visblee alebo telefonicky, pri rezervácii sa uvádza kód poukážky. Každý kód je možné uplatniť jedenkrát. Poukážku je možné vymeniť za inú službu v rovnakej hodnote. Poukážka nie je zameniteľná za hotovosť.</p>

        <h2>6. Odstúpenie od zmluvy</h2>
        <p>Spotrebiteľ môže od zmluvy odstúpiť bez uvedenia dôvodu do 14 dní od kúpy poukážky. Stačí poslať e-mail na {o.email} s kódom poukážky, prípadne použiť vzorový formulár na odstúpenie podľa zákona č. 108/2024 Z. z. o ochrane spotrebiteľa. Ak poukážka ešte nebola uplatnená, vrátime celú zaplatenú sumu najneskôr do 14 dní od doručenia odstúpenia, rovnakým spôsobom, akým bola zaplatená.</p>

        <h2>7. Reklamácie</h2>
        <p>Reklamáciu poukážky (napríklad nedoručený alebo nefunkčný kód) alebo poskytnutej služby uplatnite e-mailom na {o.email} alebo osobne v prevádzke. Reklamáciu vybavíme bez zbytočného odkladu, najneskôr do 30 dní od jej uplatnenia, a o výsledku vás budeme informovať e-mailom.</p>

        <h2>8. Ochrana osobných údajov</h2>
        <p>Spracovanie osobných údajov popisujú <Link href="/ochrana-osobnych-udajov">Zásady ochrany osobných údajov</Link>.</p>

        <h2>9. Alternatívne riešenie sporov</h2>
        <p>Ak nie ste spokojní s vybavením reklamácie alebo sa domnievate, že sme porušili vaše práva, napíšte nám na {o.email}. Ak vašu žiadosť zamietneme alebo na ňu do 30 dní neodpovieme, môžete podať návrh na alternatívne riešenie sporu, napríklad Slovenskej obchodnej inšpekcii (www.soi.sk). Zoznam subjektov alternatívneho riešenia sporov vedie Ministerstvo hospodárstva SR.</p>

        <p className="legal__note">Tieto podmienky sú účinné od 23. 11. 2026.</p>
      </div>
    </main>
  );
}
