import "server-only";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { salon } from "./config";

// Kódy bez zameniteľných znakov (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Kód je odvodený od ID platby a poradia, takže opakované doručenie webhooku zo Stripe
 * vytvorí vždy rovnaké kódy (žiadne duplicitné poukážky).
 */
export function voucherCode(sessionId: string, index: number): string {
  const secret = process.env.VOUCHER_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "relax";
  const digest = createHmac("sha256", secret).update(`${sessionId}:${index}`).digest();
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[digest[i] % ALPHABET.length];
  return `RLX-${out.slice(0, 4)}-${out.slice(4)}`;
}

export type VoucherInfo = {
  code: string;
  productName: string;
  includes: string[];
  valueLabel: string;
  recipient?: string;
  validUntil: string;
  bonus?: string;
};

const C = {
  ink: rgb(0x2b / 255, 0x1e / 255, 0x2f / 255),
  wine: rgb(0x8c / 255, 0x2f / 255, 0x4b / 255),
  brass: rgb(0xb8 / 255, 0x92 / 255, 0x5a / 255),
  muted: rgb(0x6e / 255, 0x5f / 255, 0x70 / 255),
  blush: rgb(0xf2 / 255, 0xdd / 255, 0xe3 / 255),
  bg: rgb(0xfb / 255, 0xf8 / 255, 0xfa / 255),
};

async function font(file: string) {
  return readFile(path.join(process.cwd(), "assets", "fonts", file));
}

function wrap(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (measure(next) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Jedno PDF, jedna strana na každú poukážku (formát A5 na šírku, dobre sa tlačí aj ukazuje v mobile). */
export async function renderVouchersPdf(vouchers: VoucherInfo[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const sans = await doc.embedFont(await font("DejaVuSans.ttf"), { subset: true });
  const sansBold = await doc.embedFont(await font("DejaVuSans-Bold.ttf"), { subset: true });
  const serif = await doc.embedFont(await font("DejaVuSerif-Bold.ttf"), { subset: true });
  doc.setTitle(`${salon.name} – darčeková poukážka`);
  doc.setAuthor(salon.fullName);

  for (const v of vouchers) {
    const W = 595.28, H = 419.53; // A5 na šírku
    const page = doc.addPage([W, H]);
    const m = 34;
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.bg });
    // Ústrižok vpravo
    const stubX = W - 170;
    page.drawRectangle({ x: stubX, y: 0, width: W - stubX, height: H, color: C.wine });
    for (let y = 14; y < H - 8; y += 14) {
      page.drawLine({ start: { x: stubX, y }, end: { x: stubX, y: y + 7 }, thickness: 1, color: C.bg });
    }
    page.drawCircle({ x: stubX, y: H, size: 12, color: C.bg });
    page.drawCircle({ x: stubX, y: 0, size: 12, color: C.bg });

    // Ľavá časť
    page.drawText(salon.fullName, { x: m, y: H - m - 4, size: 10, font: sansBold, color: C.wine });
    page.drawText("Darčeková poukážka", { x: m, y: H - m - 22, size: 10, font: sans, color: C.muted });

    const titleLines = wrap(v.productName, stubX - m * 2, (s) => serif.widthOfTextAtSize(s, 28));
    let y = H - m - 70;
    for (const l of titleLines) {
      page.drawText(l, { x: m, y, size: 28, font: serif, color: C.ink });
      y -= 34;
    }
    if (v.recipient) {
      page.drawText(`Pre: ${v.recipient}`, { x: m, y, size: 12, font: sansBold, color: C.ink });
      y -= 22;
    }
    page.drawLine({ start: { x: m, y: y + 4 }, end: { x: m + 60, y: y + 4 }, thickness: 1.5, color: C.brass });
    y -= 14;
    for (const item of v.includes) {
      for (const [i, l] of wrap(item, stubX - m * 2 - 14, (s) => sans.widthOfTextAtSize(s, 10.5)).entries()) {
        if (i === 0) page.drawText("•", { x: m, y, size: 10.5, font: sans, color: C.brass });
        page.drawText(l, { x: m + 12, y, size: 10.5, font: sans, color: C.ink });
        y -= 15;
      }
      y -= 2;
    }
    if (v.bonus) {
      y -= 4;
      page.drawText(`Bonus: ${v.bonus}`, { x: m, y, size: 10, font: sansBold, color: C.wine });
    }

    const foot = `Platí do ${v.validUntil}. Termín si rezervujte na visblee.sk/charlie-centrum alebo na ${salon.phone} a uveďte kód poukážky. ${salon.fullName}, ${salon.address}.`;
    const footLines = wrap(foot, stubX - m * 2, (s) => sans.widthOfTextAtSize(s, 8.5));
    footLines.forEach((l, i) => {
      page.drawText(l, { x: m, y: m - 6 + (footLines.length - 1 - i) * 12, size: 8.5, font: sans, color: C.muted });
    });

    // Ústrižok: hodnota a kód
    const sx = stubX + 22;
    page.drawText("Hodnota", { x: sx, y: H - m - 22, size: 9.5, font: sans, color: C.blush });
    page.drawText(v.valueLabel, { x: sx, y: H - m - 54, size: 26, font: serif, color: rgb(1, 1, 1) });
    page.drawText("Kód poukážky", { x: sx, y: 110, size: 9.5, font: sans, color: C.blush });
    page.drawText(v.code, { x: sx, y: 90, size: 13.5, font: sansBold, color: rgb(1, 1, 1) });
    page.drawText("Kód je jedinečný a dá sa", { x: sx, y: 62, size: 8, font: sans, color: C.blush });
    page.drawText("uplatniť jedenkrát.", { x: sx, y: 51, size: 8, font: sans, color: C.blush });
  }
  return doc.save();
}
