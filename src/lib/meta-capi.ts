import "server-only";
import { createHash } from "node:crypto";

// Meta Conversions API zo servera. Rovnaké event_id ako v prehliadači → Meta udalosti spojí (deduplikácia).

const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export function normEmail(email?: string | null) {
  const v = email?.trim().toLowerCase();
  return v ? sha256(v) : undefined;
}

/** Telefón: len číslice s predvoľbou krajiny, napr. 421911111641. */
export function normPhone(phone?: string | null) {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) digits = `421${digits.slice(1)}`;
  return digits ? sha256(digits) : undefined;
}

export function normText(v?: string | null) {
  const s = v
    ?.trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
  return s ? sha256(s) : undefined;
}

export function splitName(full?: string | null): { fn?: string; ln?: string } {
  if (!full) return {};
  const parts = full.trim().split(/\s+/);
  return { fn: parts[0], ln: parts.length > 1 ? parts[parts.length - 1] : undefined };
}

/** Ak nemáme cookie _fbc, poskladáme ju z fbclid podľa formátu Mety: fb.1.<čas v ms>.<fbclid> */
export function buildFbc(fbc?: string, fbclid?: string) {
  if (fbc) return fbc;
  if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;
  return undefined;
}

export type CapiUser = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type CapiEvent = {
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase";
  eventId: string;
  eventTime?: number;
  sourceUrl: string;
  user: CapiUser;
  custom?: Record<string, unknown>;
};

export function buildCapiPayload(e: CapiEvent) {
  const { fn, ln } = splitName(e.user.name);
  const em = normEmail(e.user.email);
  const user_data: Record<string, unknown> = {
    em: em ? [em] : undefined,
    ph: normPhone(e.user.phone) ? [normPhone(e.user.phone)] : undefined,
    fn: normText(fn) ? [normText(fn)] : undefined,
    ln: normText(ln) ? [normText(ln)] : undefined,
    ct: normText(e.user.city) ? [normText(e.user.city)] : undefined,
    zp: e.user.zip ? [sha256(e.user.zip.replace(/\s/g, "").toLowerCase())] : undefined,
    country: e.user.country ? [sha256(e.user.country.trim().toLowerCase())] : undefined,
    external_id: em ? [em] : undefined,
    client_ip_address: e.user.ip,
    client_user_agent: e.user.userAgent,
    fbp: e.user.fbp,
    fbc: e.user.fbc,
  };
  Object.keys(user_data).forEach((k) => user_data[k] === undefined && delete user_data[k]);

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: e.eventName,
        event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.sourceUrl,
        user_data,
        custom_data: e.custom,
      },
    ],
  };
  if (process.env.META_TEST_EVENT_CODE) payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  return payload;
}

export async function sendCapi(e: CapiEvent): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    console.warn("[capi] chýba NEXT_PUBLIC_META_PIXEL_ID alebo META_CAPI_ACCESS_TOKEN, udalosť sa neodoslala", e.eventName);
    return;
  }
  const version = process.env.META_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${version}/${pixelId}/events?access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildCapiPayload(e)),
    });
    const body = await res.text();
    if (!res.ok) console.error(`[capi] ${e.eventName} zlyhala (${res.status}): ${body}`);
    else console.log(`[capi] ${e.eventName} odoslaná (${e.eventId}): ${body}`);
  } catch (err) {
    console.error(`[capi] ${e.eventName} chyba siete`, err);
  }
}

export function capiAllowed(consent: boolean) {
  const requireConsent = (process.env.CAPI_REQUIRE_CONSENT ?? "true") !== "false";
  return consent || !requireConsent;
}
