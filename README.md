# Relax Žilina – stránka s vianočnými darčekmi

Predaj darčekových poukážok online: zákazník vyberie darček, zaplatí cez Stripe a PDF poukážka mu hneď príde e-mailom.
Každý nákup ide do Mety ako **Purchase so skutočnou sumou** (Pixel v prehliadači + Conversions API zo servera, deduplikované),
takže v Ads Manageri vidíte reálne tržby a návratnosť reklamy.

## Ako to funguje

1. Reklama → stránka. Po súhlase s cookies sa načíta Pixel (PageView, ViewContent pri zobrazení darčeka).
2. Klik na **Kúpiť** → Pixel `InitiateCheckout` + server pošle to isté cez Conversions API s rovnakým `event_id`.
3. Stripe Checkout (karta, Apple Pay, Google Pay). Pri vytvorení platby uložíme `_fbp`, `_fbc` / `fbclid`, IP a prehliadač.
4. Po zaplatení Stripe zavolá webhook → server:
   - pošle `Purchase` cez Conversions API (event_id `purchase_<id platby>`, suma, zahashovaný e-mail, telefón, meno, `fbp`, `fbc`),
   - vygeneruje PDF poukážku s jedinečným kódom (`RLX-XXXX-XXXX`, jeden kód na kus),
   - pošle e-mail zákazníkovi a upozornenie salónu (Brevo),
   - voliteľne pošle predaj do n8n (→ NocoDB).
5. Ďakovacia stránka pošle `Purchase` z Pixelu s rovnakým event_id → Meta obe udalosti spojí do jednej.

Webhook je odolný voči opakovaniu: kódy sú odvodené od ID platby a po spracovaní sa na platbu zapíše príznak `fulfilled`.

## Čo treba pripraviť

| Čo | Kde | Do premennej |
| --- | --- | --- |
| Stripe účet na Relax (IČO, bankový účet) | dashboard.stripe.com | `STRIPE_SECRET_KEY` |
| Webhook endpoint | Stripe → Developers → Webhooks | `STRIPE_WEBHOOK_SECRET` |
| Pixel ID (ten istý pixel, ktorý beží na Visblee) | Events Manager | `NEXT_PUBLIC_META_PIXEL_ID` |
| Conversions API token | Events Manager → pixel → Nastavenia → Conversions API → Vygenerovať prístupový token | `META_CAPI_ACCESS_TOKEN` |
| Brevo API kľúč + overený odosielateľ (doména relax-zilina.sk) | Brevo → SMTP & API | `BREVO_API_KEY`, `EMAIL_FROM` |
| E-mail salónu na upozornenia | Peta | `SALON_NOTIFY_EMAIL` |
| Náhodný tajný kľúč pre kódy | napr. `openssl rand -hex 32` | `VOUCHER_SECRET` |
| Subdoména | DNS relax-zilina.sk | — |

Všetky premenné sú popísané v `.env.example`.

## Nasadenie na Vercel

1. Nahrajte projekt do GitHub repozitára (súkromného).
2. Vercel → **Add New Project** → importujte repozitár. Framework sa rozpozná sám (Next.js).
3. **Settings → Environment Variables:** vložte všetky premenné z `.env.example`.
   `SITE_URL` = finálna adresa, napr. `https://darceky.relax-zilina.sk`.
4. **Deploy.**
5. **Settings → Domains:** pridajte `darceky.relax-zilina.sk`. V DNS domény vytvorte záznam
   `CNAME darceky → cname.vercel-dns.com` (presnú hodnotu ukáže Vercel).
6. Stripe → Webhooks → **Add endpoint**: `https://darceky.relax-zilina.sk/api/stripe-webhook`,
   udalosti `checkout.session.completed` a `checkout.session.async_payment_succeeded`.
   Signing secret vložte do `STRIPE_WEBHOOK_SECRET` a spravte **Redeploy**.

> `NEXT_PUBLIC_META_PIXEL_ID` sa vkladá pri builde. Po jeho zmene treba vždy spraviť Redeploy.

## Meta: nastavenie, aby meranie fungovalo naozaj

1. **Overte doménu** relax-zilina.sk v Business Manageri (Nastavenia firmy → Značková bezpečnosť → Domény).
2. Použite **ten istý pixel/dataset** ako na Visblee, aby sa dáta nerozdeľovali.
3. Do `META_TEST_EVENT_CODE` dajte kód z **Events Manager → Testovať udalosti** a spravte testovací nákup (nižšie).
4. Skontrolujte v Testovať udalosti:
   - `PageView`, `ViewContent`, `InitiateCheckout`, `Purchase` z **prehliadača aj zo servera**,
   - pri `InitiateCheckout` a `Purchase` stav **Deduplikované** (rovnaké event_id),
   - `Purchase` má hodnotu (napr. 89 EUR) a menu EUR.
5. Po teste **vymažte** `META_TEST_EVENT_CODE` a spravte Redeploy.
6. Po pár dňoch skontrolujte **Event Match Quality** pri Purchase (cieľ 7+ z 10) a **Diagnostiku** v Events Manageri.

### Kampaň

- Cieľ **Predaj**, miesto konverzie **Web**, pixel Relax.
- Kým nie je aspoň ~10 nákupov týždenne, optimalizujte na `InitiateCheckout`, potom prepnite na `Purchase`.
- URL reklamy: `https://darceky.relax-zilina.sk/` (Meta pridá `fbclid` sama). Do parametrov URL môžete pridať
  `utm_source=meta&utm_medium=paid&utm_campaign=vianoce2026`.
- Pre konkrétny darček odkazujte na kotvu, napr. `/#pre-nu` alebo `/#dalsie`.

## Test pred spustením (Stripe testovací režim)

1. V `.env` použite testovacie kľúče `sk_test_...` a testovací webhook secret.
2. Na stránke povoľte cookies, kliknite **Kúpiť za 89 €**.
3. Karta `4242 4242 4242 4242`, ľubovoľný budúci dátum, CVC `123`, e-mail na seba.
4. Skontrolujte:
   - ďakovacia stránka ukazuje sumu a e-mail,
   - príde e-mail s PDF poukážkou a salónu upozornenie,
   - v Stripe → Payments je platba s metadátami `fulfilled=1` a `voucher_codes`,
   - v Events Manageri Purchase z prehliadača aj servera, deduplikované.
5. Prepnite na ostré kľúče (`sk_live_...`) a ostrý webhook.

## Lokálny vývoj

```bash
npm install
cp .env.example .env.local      # doplňte testovacie kľúče
npm run dev                     # http://localhost:3000
stripe listen --forward-to localhost:3000/api/stripe-webhook   # webhooky lokálne (Stripe CLI)
npm run selftest                # kontrola Conversions API payloadu, kódov a PDF (vytvorí test-poukazka.pdf)
```

## Čo upraviť pred spustením

- `src/lib/config.ts`: všetko s **DOPLNIŤ** (prevádzkovateľ, IČO, e-mail, presná adresa).
- `src/lib/products.ts`: balíky, ceny, bonusy. „Nový rok, nové telo“ sa zobrazí automaticky od 27. 12.
- `src/app/obchodne-podmienky` a `src/app/ochrana-osobnych-udajov`: **návrhy**, musí ich skontrolovať účtovníčka alebo právnik
  (odstúpenie od zmluvy, DPH pri poukážkach, reklamácie).
- `CAPI_REQUIRE_CONSENT=true` (predvolené): bez súhlasu s cookies sa do Mety neposiela nič. Ak by ste chceli Purchase
  posielať aj bez súhlasu, rozhodnite to s GDPR poradcom.

## Uplatnenie poukážky v salóne

Kódy sú v e-maile, ktorý dostane salón pri každom predaji, v Stripe (metadáta platby) a v NocoDB, ak je zapojené n8n.
Pri uplatnení salón kód odškrtne. n8n dostane JSON s poľami:
`created, session_id, product_id, product_name, quantity, amount_eur, codes[], customer_name, customer_email, customer_phone, recipient, source`.

## Štruktúra

```
src/app/page.tsx                    stránka s darčekmi
src/app/dakujeme/page.tsx           ďakovacia stránka + Purchase z Pixelu
src/app/api/checkout/route.ts       vytvorenie Stripe platby + InitiateCheckout cez CAPI
src/app/api/stripe-webhook/route.ts webhook → fulfillment
src/lib/fulfillment.ts              Purchase cez CAPI, PDF, e-maily, n8n
src/lib/meta-capi.ts                Conversions API (hashovanie, payload, odoslanie)
src/lib/voucher.ts                  kódy a PDF poukážky
src/lib/products.ts                 katalóg darčekov
src/components/MetaPixel.tsx        Pixel po súhlase
src/components/ConsentBanner.tsx    cookie lišta
```
