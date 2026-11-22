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
          <li><strong>Cookies na meranie reklamy (len so súhlasom):</strong> cookies Meta Pixel (_fbp, _fbc) a udalosti z prehliadača. Právny základ: súhlas, ktorý môžete kedykoľvek odvolať.</li>
          <li><strong>Meranie predajov z reklamy:</strong> keď začnete platbu a keď nákup dokončíte, odovzdávame spoločnosti Meta cez Conversions API údaje o nákupe (produkt, suma), zahashovaný e-mail, telefón a meno, IP adresu, typ prehliadača a identifikátor kliknutia na reklamu. Robíme to aj bez súhlasu s cookies, aby sme vedeli, ktoré reklamy prinášajú predaje. Právny základ: oprávnený záujem na meraní účinnosti reklamy. Proti tomuto spracúvaniu môžete kedykoľvek namietať e-mailom na {o.email}.</li>
        </ul>

        <h2>Komu údaje odovzdávame</h2>
        <ul>
          <li>Stripe Payments Europe (platby)</li>
          <li>WebPoint cez n8n a poskytovateľa e-mailovej schránky (odosielanie e-mailov s poukážkou)</li>
          <li>Meta Platforms Ireland (meranie reklamy a predajov)</li>
          <li>Vercel (hosting stránky)</li>
          <li>WebPoint (správa reklamy a stránky, sprostredkovateľ)</li>
        </ul>

        <h2>Cookies</h2>
        <p>Nevyhnutná cookie si pamätá vašu voľbu súhlasu. Cookies Meta (_fbp, _fbc) sa ukladajú až po vašom súhlase. <ConsentSettingsLink /></p>

        <h2>Vaše práva</h2>
        <p>Máte právo na prístup, opravu, vymazanie, obmedzenie spracúvania, prenosnosť, námietku a odvolanie súhlasu. Môžete podať sťažnosť na Úrade na ochranu osobných údajov SR. Kontakt: {o.email}.</p>

        <p className="legal__note">Účinné od 23. 11. 2026.</p>
      </div>
    </main>
  );
}
