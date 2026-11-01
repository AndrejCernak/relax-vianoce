import type { Metadata } from "next";
import Link from "next/link";
import { salon } from "@/lib/config";
import { ConsentSettingsLink } from "@/components/ConsentBanner";

export const metadata: Metadata = { title: "Ochrana osobných údajov | Relax Žilina" };

// NÁVRH – pred spustením skontrolovať so zodpovednou osobou / právnikom.
export default function Privacy() {
  const o = salon.operator;
  return (
    <main className="legal">
      <div className="wrap legal__in">
        <p><Link className="linklike" href="/">Späť na darčeky</Link></p>
        <h1>Ochrana osobných údajov</h1>

        <h2>Prevádzkovateľ</h2>
        <p>{o.company}, {o.seat}, IČO {o.ico}, e-mail {o.email}.</p>

        <h2>Aké údaje spracúvame a prečo</h2>
        <ul>
          <li><strong>Vybavenie objednávky:</strong> meno, e-mail, telefón, meno obdarovaného, údaje o platbe. Právny základ: plnenie zmluvy. Doba: počas platnosti poukážky a lehôt na reklamáciu.</li>
          <li><strong>Účtovníctvo:</strong> údaje na dokladoch. Právny základ: zákonná povinnosť. Doba: podľa zákona o účtovníctve.</li>
          <li><strong>Meranie reklamy (len so súhlasom):</strong> cookies Meta Pixel, IP adresa, typ prehliadača a zahashovaný e-mail a telefón pri nákupe, ktoré odovzdávame spoločnosti Meta cez Conversions API. Právny základ: súhlas. Súhlas môžete kedykoľvek odvolať.</li>
        </ul>

        <h2>Komu údaje odovzdávame</h2>
        <ul>
          <li>Stripe Payments Europe (platby)</li>
          <li>Brevo (odosielanie e-mailov s poukážkou)</li>
          <li>Meta Platforms Ireland (meranie reklamy, len so súhlasom)</li>
          <li>Vercel (hosting stránky)</li>
          <li>WebPoint (správa reklamy a stránky, sprostredkovateľ)</li>
        </ul>

        <h2>Cookies</h2>
        <p>Nevyhnutná cookie si pamätá vašu voľbu súhlasu. Cookies Meta (_fbp, _fbc) sa ukladajú až po vašom súhlase. <ConsentSettingsLink /></p>

        <h2>Vaše práva</h2>
        <p>Máte právo na prístup, opravu, vymazanie, obmedzenie spracúvania, prenosnosť, námietku a odvolanie súhlasu. Môžete podať sťažnosť na Úrade na ochranu osobných údajov SR. Kontakt: {o.email}.</p>

        <p className="legal__note">DOPLNIŤ: dátum účinnosti a prípadne zodpovednú osobu.</p>
      </div>
    </main>
  );
}
