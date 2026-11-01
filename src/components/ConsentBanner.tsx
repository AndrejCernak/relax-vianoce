"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/tracking-client";

export const OPEN_CONSENT_EVENT = "relax-open-consent";

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (v: "granted" | "denied") => {
    const before = getConsent();
    setConsent(v);
    setOpen(false);
    // Pixel sa nedá za behu vypnúť, preto pri odvolaní súhlasu stránku obnovíme.
    if (before === "granted" && v === "denied") location.reload();
  };

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Súhlas s cookies">
      <p>
        Cookies používame na meranie, ktoré reklamy fungujú, a na zobrazovanie relevantných ponúk na Facebooku a Instagrame.
        Nákup funguje aj bez nich. <Link href="/ochrana-osobnych-udajov">Viac o spracovaní údajov</Link>
      </p>
      <div className="consent__actions">
        <button className="btn btn--ghost" onClick={() => choose("denied")}>Len nevyhnutné</button>
        <button className="btn btn--ghost" onClick={() => choose("granted")}>Povoliť všetky</button>
      </div>
    </div>
  );
}

export function ConsentSettingsLink() {
  return (
    <button className="linklike" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Nastavenia cookies
    </button>
  );
}
