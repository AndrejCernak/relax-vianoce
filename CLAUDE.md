# Relax Žilina – vianočné darčeky (kontext pre Claude Code)

## O projekte
Stránka na predaj darčekových poukážok pre salón **Relax Žilina – Charlie centrum** (kontakt: Peta).
Robí ju agentúra **WebPoint** (Andrej) ako súčasť vianočnej Meta kampane 16. 11. – 31. 12. 2026.
Cieľ: v Ads Manageri vidieť **reálne tržby a ROAS** (Purchase s hodnotou), nie leady.

Obchodný model s klientom: november 400 € fix, december 25 % z tržieb kampane, reklamný rozpočet 300 €.
Garancia: ak tržby kampane < 934 € (= všetko, čo klient vloží), január robí WebPoint zadarmo.
Preto musí byť **každý predaj presne zmeraný** (Stripe + kód VIANOCE v salóne).

## Komunikácia
- Používateľ: Andrej, píše po slovensky, chce **vykanie**, stručne, bez omáčok.
- Texty na stránke: slovenčina, vykanie, jednoduché vety.

## Stack
- Next.js 16 (App Router, TypeScript), bez Tailwindu, ručné CSS v `src/app/globals.css`
- Stripe Checkout (hostovaný), webhook `/api/stripe-webhook`
- Meta Pixel (až po súhlase s cookies) + Conversions API zo servera
- PDF poukážky cez `pdf-lib` + DejaVu fonty v `assets/fonts` (kvôli diakritike)
- E-maily cez n8n webhook (`N8N_MAIL_WEBHOOK_URL`, workflow `n8n/poukazky-email.json`, Send Email z webpointsk@gmail.com s menom salónu, webhook chráni len náhodná cesta), náhradne Brevo API; voliteľne n8n webhook → NocoDB
- Hosting: plán je Vercel, subdoména napr. `darceky.relax-zilina.sk`
- Fonty stránky cez `@fontsource-variable` (self-hosted, bez Google Fonts kvôli GDPR)

## Dôležité rozhodnutia (nemeniť bez dôvodu)
- **Deduplikácia:** InitiateCheckout má rovnaké `eventId` v Pixeli (BuyButton) aj v CAPI (`/api/checkout`).
  Purchase má `event_id = purchase_<stripe session id>` v CAPI (webhook) aj v Pixeli (ďakovacia stránka).
- **Consent:** Pixel a cookies Mety (_fbp, _fbc) až po „Povoliť všetky“. Conversions API (InitiateCheckout, Purchase) ide **aj bez súhlasu** s IP, prehliadačom, fbclid a zahashovaným e-mailom/telefónom (rozhodnutie klienta 22. 11. 2026, oprávnený záujem, opísané v GDPR stránke). `CAPI_REQUIRE_CONSENT=true` vráti prísny režim.
- IP, user agent a `fbclid` sa ukladajú do metadát Stripe session podľa `capiAllowed`, `fbp`/`fbc` len so súhlasom; použijú sa pri Purchase.
- **Kódy poukážok** `RLX-XXXX-XXXX` sú deterministické (HMAC zo session id + poradie) → opakovaný webhook nevytvorí nové kódy.
  Po spracovaní sa na PaymentIntent zapíše `fulfilled=1` a `voucher_codes`.
- Ceny v `src/lib/products.ts` = súčet služieb z cenníka na Visblee, zaokrúhlené nadol, **bez komunikovanej zľavy**.
- „Nový rok, nové telo“ sa zobrazí automaticky od 27. 12. (`availableFrom`).

## Black Friday 2026
- Podstránka `/black-friday`: `src/app/black-friday/page.tsx`, `black-friday.css`, klient `src/components/BlackFridayShop.tsx`.
  Tieto tri súbory sú **rovnaké v Relaxe aj v Paradise**, rozdiely sú len v `config.ts` (`blackFriday`) a `products.ts`.
- Produkty majú `group: "black-friday"`, `availableFrom/Until` (23. – 29. 11.), `compareAtCents`, `tier`, `sessions`, `landingPath`.
  `isAvailable` kontroluje začiatok aj koniec; `SALE_PREVIEW=1` ho obíde (len lokálne).
- Fulfillment podľa `isDeal(product)` mení nadpis PDF, predmet e-mailu, platnosť (`blackFriday.validUntil`) a oslovenie.
- **Faktúry:** Checkout má `invoice_creation`, Stripe po zaplatení vystaví faktúru (IČO, DIČ, IČ DPH, prevádzka, päta s firmou)
  a pošle ju, ak je v Stripe zapnuté Customer emails → Successful payments. Odkaz je aj v e-maile s poukážkou.
  DPH je zahrnutá v cene, sadzba `VAT_RATE` (predvolene 23 %, `src/lib/invoice.ts` si sadzbu v Stripe nájde alebo vytvorí). **Overiť s účtovníčkou.**
- **Limit kusov:** PREMIUM a VIP majú `stock: 10` (reálny limit od klienta 22. 11. 2026). Predané kusy sa rátajú zo zaplatených
  Stripe Checkout sessions od začiatku akcie (`src/lib/stock.ts`). Stránka ukazuje „Zostáva X z 10 kusov“ (obnova každých 60 s),
  `/api/checkout` vypredaný balík odmietne (409) a počet kusov v Stripe obmedzí na zvyšok. Pri výpadku Stripe sa limit nekontroluje.
- Nákupná lišta je `position: fixed` dole; cookie lišta zapisuje svoju výšku do `--consent-h`, aby sa neprekrývali.
- **Overiť s Petou:** leták Relaxu uvádza EMShape a INFRAShape (rovnako ako Paradise), no vianočný cenník Relaxu má EMSzero.

## Stav
Hotové a overené (v cloude): build, typecheck, Pixel len po súhlase, rovnaké eventId v Pixeli a v tele `/api/checkout`,
CAPI payload (hashovanie e-mailu, telefónu, mena), PDF poukážka s diakritikou, chybová hláška bez Stripe kľúča.

**Neoverené** (chýbajú kľúče): reálna Stripe platba, webhook, Conversions API zo servera, e-maily cez n8n.

## TODO
1. Spustiť lokálne: `npm install`, `cp .env.example .env.local`, `npm run dev`.
2. ~~Prevádzkovateľ~~ hotové: PEDORE s.r.o. (IČO 45284971, IČ DPH SK2022922737), e-mail zilinarelax@gmail.com,
   adresa J. M. Geromettu 8772/1A (vo fakturačných údajoch je preklep „H.M.Gerometta“).
3. Testovací nákup: Stripe test kľúč, `stripe listen --forward-to localhost:3000/api/stripe-webhook`, karta 4242 4242 4242 4242.
4. Meta: Pixel ID (ten istý pixel ako na Visblee), CAPI token, `META_TEST_EVENT_CODE`, skontrolovať „Deduplikované“ a hodnotu Purchase.
5. Nasadiť na Vercel, pripojiť subdoménu, ostrý webhook, overiť doménu v Business Manageri.
6. Obchodné podmienky a GDPR stránka sú **návrhy** → nechať skontrolovať právnikom/účtovníčkou.
7. Po natáčaní 10. 11. doplniť skutočné fotky do kartičiek (zatiaľ len typografia).
8. Zvážiť: bonus „Darček pre darcu“ (10 € pre kupujúceho pri nákupe nad 80 €) – zatiaľ nie je implementovaný, čaká na rozhodnutie Pety.

## Príkazy
- `npm run dev` – vývoj na http://localhost:3000
- `npm run build` – produkčný build
- `npm run typecheck`
- `npm run selftest` – kontrola CAPI payloadu, kódov a PDF (vytvorí `test-poukazka.pdf`)

## Dizajn
Vianočný motív „darček v zimný večer“. Tmavé sekcie: noc `#2A0D1B` (úvod, pätička, ďakujeme), čečina `#1C3529` (Každá poukážka).
Svetlé: papier `#FBF6EE` / `#FFFDF8`, text `#2B1E2F`, vínová `#8C2F4B` (tlačidlá, hlavný darček), zlatá fólia (gradient `--foil`, hlavné CTA).
Nadpisy Bodoni Moda (optical size, kurzíva na zvýraznenie), text Figtree, ozdobné písmo Pinyon Script (len krátke nápisy).
Ozdoby sú čisté SVG v `src/components/Decor.tsx` (bez obrázkov), sneženie je canvas `Snowfall.tsx`.
Animácie: úvodná scéna (čečina, gule, darček, poukážka), objavovanie pri skrolovaní cez `data-reveal` + `RevealOnScroll.tsx`.
Všetko rešpektuje `prefers-reduced-motion`. Kartičky ostávajú ako skutočné poukážky s perforovaným ústrižkom.
