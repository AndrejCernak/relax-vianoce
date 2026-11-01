// Rýchla kontrola bez Stripe a Mety: payload Conversions API, kódy poukážok, PDF.
// Spustenie: npm run selftest  (vytvorí test-poukazka.pdf v koreni projektu)
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { buildCapiPayload, normPhone, buildFbc } from "../src/lib/meta-capi";
import { voucherCode, renderVouchersPdf } from "../src/lib/voucher";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");

// 1) Normalizácia a hash
const p = buildCapiPayload({
  eventName: "Purchase",
  eventId: "purchase_cs_test_123",
  eventTime: 1763300000,
  sourceUrl: "https://darceky.relax-zilina.sk/",
  user: {
    email: "  Jana.Novakova@Gmail.com ",
    phone: "+421 911 111 641",
    name: "Jana Nováková",
    country: "SK",
    ip: "1.2.3.4",
    userAgent: "Mozilla/5.0",
    fbp: "fb.1.1763299000000.123456",
    fbc: buildFbc(undefined, "IwAR_test"),
  },
  custom: { currency: "EUR", value: 89, content_ids: ["vianocny-ritual"], num_items: 1, order_id: "cs_test_123" },
}) as { data: Array<{ user_data: Record<string, unknown>; event_id: string; custom_data: Record<string, unknown> }> };

const ud = p.data[0].user_data;
assert.deepEqual(ud.em, [sha("jana.novakova@gmail.com")]);
assert.deepEqual(ud.ph, [sha("421911111641")]);
assert.deepEqual(ud.fn, [sha("jana")]);
assert.deepEqual(ud.ln, [sha("novakova")]);
assert.deepEqual(ud.country, [sha("sk")]);
assert.equal(normPhone("0911 111 641"), sha("421911111641"));
assert.match(String(ud.fbc), /^fb\.1\.\d{13}\.IwAR_test$/);
assert.equal(p.data[0].event_id, "purchase_cs_test_123");
assert.equal(p.data[0].custom_data.value, 89);
console.log("✓ Conversions API payload:", JSON.stringify(p.data[0], null, 2).slice(0, 900));

// 2) Kódy sú deterministické a rôzne pre rôzne kusy
const a = voucherCode("cs_test_123", 0);
assert.equal(a, voucherCode("cs_test_123", 0));
assert.notEqual(a, voucherCode("cs_test_123", 1));
assert.match(a, /^RLX-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
console.log("✓ Kód poukážky:", a);

// 3) PDF
const pdf = await renderVouchersPdf([
  {
    code: a,
    productName: "Vianočný rituál",
    includes: [
      "Kolagénové ošetrenie pleti SYIS",
      "Relaxačná masáž tváre, krku a dekoltu",
      "Úprava a farbenie obočia a farbenie mihalníc",
    ],
    valueLabel: "89 €",
    recipient: "Mamina Ľubica",
    validUntil: "31. 3. 2027",
    bonus: "Parfum Yodeyma v darčekovom balení",
  },
]);
await writeFile("test-poukazka.pdf", pdf);
console.log("✓ PDF vytvorené: test-poukazka.pdf");
