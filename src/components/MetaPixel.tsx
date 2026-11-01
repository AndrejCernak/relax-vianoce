"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, getConsent } from "@/lib/tracking-client";

/** Načíta Meta Pixel až po súhlase s cookies a odošle PageView. */
export default function MetaPixel({ pixelId }: { pixelId: string }) {
  useEffect(() => {
    if (!pixelId) return;
    const load = () => {
      if (getConsent() !== "granted" || window.fbq) return;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const n: any = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
      };
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      window.fbq = n;
      window._fbq = n;
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
      n("init", pixelId);
      n("track", "PageView");
    };
    load();
    window.addEventListener(CONSENT_EVENT, load);
    return () => window.removeEventListener(CONSENT_EVENT, load);
  }, [pixelId]);

  return null;
}
