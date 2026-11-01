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
        <p>{o.company}, {o.seat}, IČO {o.ico}, DIČ {o.dic}, e-mail {o.email}, telefón {salon.phone}. Prevádzka: {salon.fullName}, {salon.address}.</p>

        <h2>2. Predmet</h2>
        <p>Predmetom je predaj darčekových poukážok na služby a produkty prevádzky {salon.fullName} prostredníctvom stránky {siteUrl}.</p>

        <h2>3. Cena a platba</h2>
        <p>Ceny sú uvedené v eurách vrátane DPH, ak je predávajúci platiteľom DPH. Platba prebieha vopred kartou, Apple Pay alebo Google Pay cez platobnú bránu Stripe.</p>

        <h2>4. Doručenie</h2>
        <p>Poukážku v PDF zasielame na e-mail zadaný pri platbe bezodkladne po prijatí platby. Na požiadanie pripravíme tlačenú poukážku na vyzdvihnutie v prevádzke.</p>

        <h2>5. Platnosť a uplatnenie</h2>
        <p>Poukážka platí do {voucherValidUntil}. Termín sa rezervuje cez Visblee alebo telefonicky, pri rezervácii sa uvádza kód poukážky. Každý kód je možné uplatniť jedenkrát. Poukážku je možné vymeniť za inú službu v rovnakej hodnote. Poukážka nie je zameniteľná za hotovosť.</p>

        <h2>6. Odstúpenie od zmluvy</h2>
        <p>DOPLNIŤ podľa odporúčania právnika: spotrebiteľ má spravidla právo odstúpiť od zmluvy uzavretej na diaľku do 14 dní od jej uzavretia. Postup, formulár a spôsob vrátenia platby doplniť.</p>

        <h2>7. Reklamácie</h2>
        <p>Reklamácie poukážky alebo poskytnutej služby uplatnite e-mailom na {o.email} alebo osobne v prevádzke. DOPLNIŤ lehoty a postup podľa reklamačného poriadku prevádzky.</p>

        <h2>8. Ochrana osobných údajov</h2>
        <p>Spracovanie osobných údajov popisujú <Link href="/ochrana-osobnych-udajov">Zásady ochrany osobných údajov</Link>.</p>

        <h2>9. Alternatívne riešenie sporov</h2>
        <p>Spotrebiteľ sa môže obrátiť na subjekt alternatívneho riešenia sporov, napríklad Slovenskú obchodnú inšpekciu, alebo použiť platformu RSO Európskej komisie. DOPLNIŤ presné údaje.</p>

        <p className="legal__note">Tieto podmienky sú účinné od DOPLNIŤ dátum.</p>
      </div>
    </main>
  );
}
