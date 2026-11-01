"use client";

import { useEffect } from "react";
import { trackPixel, getConsent } from "@/lib/tracking-client";

/**
 * Purchase v prehliadači s rovnakým event_id, aké posiela server (webhook) cez Conversions API.
 * Pri obnovení stránky sa neodošle druhýkrát.
 */
export default function PurchaseTracker(props: {
  eventId: string;
  value: number;
  contentIds: string[];
  contentName: string;
  numItems: number;
}) {
  useEffect(() => {
    const key = `relax_purchase_${props.eventId}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}
    if (getConsent() !== "granted") return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      const ok = trackPixel(
        "Purchase",
        {
          currency: "EUR",
          value: props.value,
          content_ids: props.contentIds,
          content_name: props.contentName,
          content_type: "product",
          num_items: props.numItems,
        },
        props.eventId,
      );
      if (ok || tries > 25) {
        clearInterval(timer);
        if (ok) {
          try {
            sessionStorage.setItem(key, "1");
          } catch {}
        }
      }
    }, 200);
    return () => clearInterval(timer);
  }, [props.eventId, props.value, props.contentIds, props.contentName, props.numItems]);

  return null;
}
