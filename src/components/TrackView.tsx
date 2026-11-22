"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { CONSENT_EVENT, newEventId, trackPixel } from "@/lib/tracking-client";

/** Odošle ViewContent, keď je darček aspoň z 60 % viditeľný (raz za načítanie stránky). */
export default function TrackView({
  productId,
  productName,
  priceCents,
  className,
  children,
  ...rest
}: {
  productId: string;
  productName: string;
  priceCents: number;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    let visible = false;
    const send = () => {
      if (sent || !visible) return;
      sent = trackPixel(
        "ViewContent",
        { currency: "EUR", value: priceCents / 100, content_ids: [productId], content_name: productName, content_type: "product" },
        newEventId(),
      );
      if (sent) io.disconnect();
    };
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        send();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    // Súhlas môže prísť, až keď je darček už na obrazovke. Odklad, aby MetaPixel stihol pripraviť fbq.
    const onConsent = () => window.setTimeout(send, 0);
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => {
      io.disconnect();
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, [productId, productName, priceCents]);

  return (
    <article ref={ref} className={className} {...rest}>
      {children}
    </article>
  );
}
