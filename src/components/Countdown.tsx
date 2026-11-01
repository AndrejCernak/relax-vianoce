"use client";

import { useEffect, useState } from "react";
import { Star } from "./Decor";

/** Počet dní do Štedrého dňa podľa času v Bratislave. */
function daysToChristmasEve(now: Date) {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bratislava",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);
  return Math.round((Date.UTC(y, 11, 24) - Date.UTC(y, m - 1, d)) / 86_400_000);
}

function label(days: number) {
  if (days < 0) return "Poukážka príde e-mailom hneď po zaplatení";
  if (days === 0) return "Dnes je Štedrý deň, poukážka príde hneď";
  if (days === 1) return "Štedrý deň je už zajtra";
  if (days <= 4) return `Do Štedrého dňa zostávajú ${days} dni`;
  return `Do Štedrého dňa zostáva ${days} dní`;
}

/** Odpočet v úvode. Bez JavaScriptu (a pred načítaním) ukáže všeobecný text. */
export default function Countdown() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(label(daysToChristmasEve(new Date())));
  }, []);

  return (
    <p className="hero__badge">
      <Star />
      <span key={text ?? "default"} className="hero__badge-text">
        {text ?? "Vianočné darčekové poukážky"}
      </span>
    </p>
  );
}
