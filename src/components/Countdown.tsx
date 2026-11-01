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

/** Veľké číslo + dvojriadkový popis, ako list z adventného kalendára. */
function parts(days: number): { num: string | null; label: [string, string] } {
  if (days < 0) return { num: null, label: ["Poukážka príde", "hneď e-mailom"] };
  if (days === 0) return { num: null, label: ["Dnes je", "Štedrý deň"] };
  if (days === 1) return { num: "1", label: ["deň do", "Štedrého dňa"] };
  if (days <= 4) return { num: String(days), label: ["dni do", "Štedrého dňa"] };
  return { num: String(days), label: ["dní do", "Štedrého dňa"] };
}

/** Odpočet v úvode. Bez JavaScriptu (a pred načítaním) ukáže hviezdu a všeobecný text. */
export default function Countdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysToChristmasEve(new Date()));
  }, []);

  const { num, label } = days === null ? { num: null, label: ["Vianočné", "poukážky 2026"] } : parts(days);

  return (
    <p className="hero__count">
      <span key={num ?? "star"} className="hero__count-num">
        {num ?? <Star />}
      </span>
      <span className="hero__count-label">
        {label[0]}
        <br />
        {label[1]}
      </span>
    </p>
  );
}
