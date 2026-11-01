"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { newEventId, trackPixel } from "@/lib/tracking-client";

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
    const io = new IntersectionObserver(
      (entries) => {
        if (sent || !entries.some((e) => e.isIntersecting)) return;
        sent = trackPixel(
          "ViewContent",
          { currency: "EUR", value: priceCents / 100, content_ids: [productId], content_name: productName, content_type: "product" },
          newEventId(),
        );
        if (sent) io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [productId, productName, priceCents]);

  return (
    <article ref={ref} className={className} {...rest}>
      {children}
    </article>
  );
}
