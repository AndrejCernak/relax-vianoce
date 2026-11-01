"use client";

// Pomocné funkcie pre Meta Pixel v prehliadači. Pixel sa načíta až po súhlase s cookies.

type Fbq = ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[] };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export const CONSENT_COOKIE = "relax_consent";
export const CONSENT_EVENT = "relax-consent-change";

export type Consent = "granted" | "denied" | null;

export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export function getConsent(): Consent {
  const v = readCookie(CONSENT_COOKIE);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: "granted" | "denied") {
  const maxAge = 60 * 60 * 24 * 180; // 6 mesiacov
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Odošle udalosť do Pixelu so zadaným eventID (rovnaké ID posiela server cez Conversions API → deduplikácia). */
export function trackPixel(event: string, params: Record<string, unknown>, eventId: string) {
  if (getConsent() !== "granted" || typeof window.fbq !== "function") return false;
  window.fbq("track", event, params, { eventID: eventId });
  return true;
}

/** Identifikátory, ktoré server pripojí k udalostiam Conversions API (zvyšuje kvalitu zhody). */
export function collectMetaIds() {
  const consent = getConsent() === "granted";
  if (!consent) return { consent: false };
  const fbclid = new URLSearchParams(location.search).get("fbclid") || undefined;
  return {
    consent: true,
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    fbclid,
  };
}
