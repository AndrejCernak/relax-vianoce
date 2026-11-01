// Katalóg darčekov. Ceny sú v centoch a vychádzajú z cenníka na Visblee (november 2026).
// Cena balíka = súčet služieb zaokrúhlený nadol, bez komunikovanej zľavy.

export type Group = "pre-nu" | "pre-seba" | "pre-neho" | "hodnotova" | "novy-rok";

export type Product = {
  id: string;
  group: Group;
  name: string;
  priceCents: number;
  includes: string[];
  duration?: string;
  bonus?: string;
  note?: string;
  featured?: boolean;
  /** ISO dátum, od ktorého sa produkt zobrazí a dá kúpiť (čas Europe/Bratislava) */
  availableFrom?: string;
};

export const groups: { id: Group; title: string; intro: string }[] = [
  { id: "pre-nu", title: "Pre ňu", intro: "Pre manželku, mamu, sestru či kamarátku. Hodina alebo dve, keď nemusí nič." },
  { id: "pre-seba", title: "Pre seba pred sviatkami", intro: "Na vianočné večierky a fotky pri stromčeku. Termín si rezervujete do 23. 12." },
  { id: "pre-neho", title: "Pre neho", intro: "Darček pre muža, ktorý nie sú ponožky ani parfum." },
  { id: "hodnotova", title: "Hodnotová poukážka", intro: "Keď neviete, čo vybrať. Uplatní sa na čokoľvek v salóne." },
  { id: "novy-rok", title: "Nový rok, nové telo", intro: "Kúpite teraz, začnete v januári. S meraním na začiatku aj na konci." },
];

export const products: Product[] = [
  {
    id: "vianocny-ritual",
    group: "pre-nu",
    name: "Vianočný rituál",
    priceCents: 8900,
    includes: [
      "Kolagénové ošetrenie pleti SYIS",
      "Relaxačná masáž tváre, krku a dekoltu",
      "Úprava a farbenie obočia a farbenie mihalníc",
    ],
    duration: "približne 2 h 30 min",
    bonus: "Parfum Yodeyma v darčekovom balení",
    featured: true,
  },
  {
    id: "maly-ritual",
    group: "pre-nu",
    name: "Malý rituál",
    priceCents: 4500,
    includes: ["Luxusné hĺbkové čistenie pleti ultrazvukom s úpravou a farbením obočia", "Farbenie mihalníc"],
    duration: "približne 1 h 30 min",
  },
  {
    id: "hydratacna-bomba",
    group: "pre-nu",
    name: "Hydratačná bomba na zimu",
    priceCents: 6900,
    includes: ["Hydratačné ošetrenie s kyselinou hyalurónovou a vitamínom C", "Relaxačná masáž tváre, krku a dekoltu"],
    duration: "približne 1 h 50 min",
  },
  {
    id: "pohlad-ktory-zastavi",
    group: "pre-nu",
    name: "Pohľad, ktorý zastaví",
    priceCents: 4900,
    includes: ["Lash lifting", "Úprava a farbenie obočia"],
    duration: "približne 2 h",
  },
  {
    id: "luxusny-ritual",
    group: "pre-nu",
    name: "Luxusný rituál",
    priceCents: 13900,
    includes: [
      "Neinvazívny facelifting rádiofrekvenciou s úpravou a farbením obočia",
      "Neinvazívna mezoterapia, hĺbková hydratácia pokožky",
    ],
    duration: "2 návštevy po 1 h 30 min",
    bonus: "Parfum Yodeyma v darčekovom balení",
  },
  {
    id: "ziariva-na-sviatky",
    group: "pre-seba",
    name: "Žiarivá na sviatky",
    priceCents: 8900,
    includes: ["Liftingové ošetrenie mini HIFU PRO+ s úpravou a farbením obočia", "Lash lifting"],
    duration: "približne 3 h, dá sa rozdeliť na 2 návštevy",
    note: "Termín si rezervujte vo Visblee najneskôr na 23. 12.",
  },
  {
    id: "pansky-restart",
    group: "pre-neho",
    name: "Pánsky reštart",
    priceCents: 7500,
    includes: ["Meranie zloženia tela na prístroji InBody", "EMSzero na 1 lokalitu a 30 min lymfodrenáž"],
    duration: "približne 1 h 30 min",
  },
  { id: "hodnotova-20", group: "hodnotova", name: "Hodnotová poukážka 20 €", priceCents: 2000, includes: ["Na akúkoľvek službu alebo produkt v salóne"] },
  { id: "hodnotova-50", group: "hodnotova", name: "Hodnotová poukážka 50 €", priceCents: 5000, includes: ["Na akúkoľvek službu alebo produkt v salóne"] },
  { id: "hodnotova-100", group: "hodnotova", name: "Hodnotová poukážka 100 €", priceCents: 10000, includes: ["Na akúkoľvek službu alebo produkt v salóne"] },
  {
    id: "novy-rok-start",
    group: "novy-rok",
    name: "Nový rok, nové telo",
    priceCents: 23900,
    includes: [
      "Úvodné meranie InBody",
      "4× EMSzero na 1 lokalitu so 4× 30 min lymfodrenážou",
      "Kontrolné meranie InBody",
    ],
    bonus: "Pri kúpe do 31. 12. Vacuslim48 zadarmo",
    availableFrom: "2026-12-27",
  },
];

export const valueVoucherIds = ["hodnotova-20", "hodnotova-50", "hodnotova-100"];

export function isAvailable(p: Product, now = new Date()): boolean {
  if (!p.availableFrom) return true;
  return now.getTime() >= Date.parse(`${p.availableFrom}T00:00:00+01:00`);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatEur(cents: number): string {
  const eur = cents / 100;
  return `${Number.isInteger(eur) ? eur : eur.toFixed(2).replace(".", ",")} €`;
}
