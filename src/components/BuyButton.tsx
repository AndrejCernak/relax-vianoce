"use client";

import { useState } from "react";
import { collectMetaIds, newEventId, trackPixel } from "@/lib/tracking-client";

type Props = {
  productId: string;
  productName: string;
  priceCents: number;
  label: string;
  variant?: "light" | "dark";
};

export default function BuyButton({ productId, productName, priceCents, label, variant = "light" }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setError(null);
    const eventId = newEventId();
    trackPixel(
      "InitiateCheckout",
      { currency: "EUR", value: priceCents / 100, content_ids: [productId], content_name: productName, content_type: "product", num_items: 1 },
      eventId,
    );
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, eventId, sourceUrl: location.href.split("#")[0], ...collectMetaIds() }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Platbu sa nepodarilo otvoriť.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Platbu sa nepodarilo otvoriť.");
      setBusy(false);
    }
  }

  return (
    <div className="buy">
      <button className={`btn btn--buy ${variant === "dark" ? "btn--on-wine" : ""}`} onClick={buy} disabled={busy} aria-busy={busy}>
        {busy ? "Otváram platbu…" : label}
      </button>
      {error && (
        <p className="buy__error" role="alert">
          {error} Skúste to znova alebo zavolajte do salónu.
        </p>
      )}
    </div>
  );
}
