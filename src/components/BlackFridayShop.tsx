"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import BuyButton from "./BuyButton";
import TrackView from "./TrackView";
import { formatEur } from "@/lib/products";

export type BfTier = {
  id: string;
  tier: string;
  name: string;
  priceCents: number;
  compareAtCents: number;
  sessions: number;
  includes: string[];
  /** Obmedzený počet kusov a koľko z nich ešte zostáva (len pri balíkoch s limitom) */
  stock?: number;
  remaining?: number;
};

export type BfPhase = "soon" | "live" | "over";

type Props = {
  tiers: BfTier[];
  defaultId: string;
  startsAt: number;
  endsAt: number;
  initialPhase: BfPhase;
  /** SALE_PREVIEW=1: predaj otvorený mimo termínu (len lokálne testovanie) */
  preview: boolean;
  packageName: string;
  startLabel: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const procedures = (n: number) => `${n} ${n === 1 ? "procedúra" : n <= 4 ? "procedúry" : "procedúr"}`;
const soldOut = (t: BfTier) => t.remaining === 0;

/** „Zostáva 7 z 10 kusov“ pri obmedzených balíkoch. */
function stockLabel(left: number, total: number) {
  if (left === 1) return `Zostáva posledný kus z ${total}`;
  if (left <= 4) return `Zostávajú ${left} z ${total} kusov`;
  return `Zostáva ${left} z ${total} kusov`;
}

const percentOff = (t: BfTier) => Math.round((1 - t.priceCents / t.compareAtCents) * 100);

/** Plynulé „pretočenie“ čísla na novú hodnotu (cena v lište po zmene balíka). */
export function useRolling(value: number, ms = 450) {
  const [shown, setShown] = useState(value);
  const current = useRef(value);
  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const v = Math.round(from + (value - from) * (1 - (1 - k) ** 3));
      current.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

function Crown() {
  return (
    <svg viewBox="0 0 24 18" aria-hidden="true" focusable="false">
      <path d="M2 15 1 4l6 5 5-8 5 8 6-5-1 11Z" fill="currentColor" />
      <rect x="2" y="15.5" width="20" height="2.5" rx="1" fill="currentColor" />
    </svg>
  );
}

/** Odpočet, výber balíka a nákupná lišta Black Friday stránky. */
export default function BlackFridayShop({ tiers, defaultId, startsAt, endsAt, initialPhase, preview, packageName, startLabel }: Props) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [burst, setBurst] = useState(0);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const phase: BfPhase = preview ? "live" : now === null ? initialPhase : now < startsAt ? "soon" : now > endsAt ? "over" : "live";
  const target = phase === "soon" ? startsAt : endsAt;
  const left = now === null ? null : Math.max(0, Math.floor((target - now) / 1000));
  const units: [number | null, string][] = [
    [left === null ? null : Math.floor(left / 86400), "dní"],
    [left === null ? null : Math.floor(left / 3600) % 24, "hod"],
    [left === null ? null : Math.floor(left / 60) % 60, "min"],
    [left === null ? null : left % 60, "sek"],
  ];

  const sel = tiers.find((t) => t.id === selectedId && !soldOut(t)) ?? tiers.find((t) => !soldOut(t)) ?? tiers[0];
  const price = useRolling(Math.round(sel.priceCents / 100));
  const save = useRolling(Math.round((sel.compareAtCents - sel.priceCents) / 100));

  const choose = (id: string) => {
    if (id === selectedId || tiers.some((t) => t.id === id && soldOut(t))) return;
    setSelectedId(id);
    setBurst((b) => b + 1);
    if ("vibrate" in navigator) navigator.vibrate(8);
  };

  return (
    <section className="bf-shop" id="balicky">
      <div className="bf-count">
        <span className="bf-count__label">
          {phase === "soon" ? "Akcia začína o" : phase === "live" ? "Akcia končí o" : "Black Friday akcia skončila"}
        </span>
        {phase !== "over" && (
          <span className="bf-count__boxes" role="timer" aria-label="Zostávajúci čas">
            {units.map(([v, unit]) => (
              <span className="bf-count__box" key={unit}>
                <span key={v ?? "x"} className="bf-count__num">{v === null ? "--" : pad(v)}</span>
                <span className="bf-count__unit">{unit}</span>
              </span>
            ))}
          </span>
        )}
      </div>

      {phase === "over" ? (
        <div className="bf-over">
          <p>Ďakujeme všetkým, ktorí si balík kúpili. Termín si dohodnete s kódom z poukážky.</p>
          <a className="bf-over__link" href="/">Pozrieť vianočné poukážky</a>
        </div>
      ) : (
        <>
          <div className="bf-shop__head">
            <h2 className="bf-shop__title">{packageName}</h2>
            <p className="bf-step">
              <span aria-hidden="true">1</span>
              Vyberte balík
            </p>
          </div>

          <TrackView productId={sel.id} productName={sel.name} priceCents={sel.priceCents} className="bf-tiers-wrap">
            <div className="bf-tiers" role="radiogroup" aria-label="Vyberte balík">
              {tiers.map((t) => {
                const on = t.id === sel.id;
                return (
                  <label key={t.id} className={`bf-tier${on ? " is-on" : ""}${soldOut(t) ? " is-soldout" : ""}`}>
                    <input
                      className="sr-only"
                      type="radio"
                      name="bf-tier"
                      value={t.id}
                      checked={on}
                      disabled={soldOut(t)}
                      onChange={() => choose(t.id)}
                      aria-label={`${t.tier}, ${procedures(t.sessions)}, ${formatEur(t.priceCents)} namiesto ${formatEur(t.compareAtCents)}`}
                    />
                    <span className="bf-radio" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.2 4.2L19 7" />
                      </svg>
                    </span>
                    {on && burst > 0 && (
                      <span key={burst} className="bf-burst" aria-hidden="true">
                        {Array.from({ length: 10 }, (_, i) => (
                          <span key={i} style={{ "--i": i } as CSSProperties} />
                        ))}
                      </span>
                    )}
                    <span className="bf-tier__name">
                      {t.tier}
                      {t.tier !== "BASIC" && <Crown />}
                    </span>
                    <span className="bf-tier__prices">
                      <s>{formatEur(t.compareAtCents)}</s>
                      <strong>{formatEur(t.priceCents)}</strong>
                    </span>
                    <span className="bf-tier__sub">
                      {procedures(t.sessions)} · {formatEur(Math.round(t.priceCents / t.sessions))} za procedúru
                    </span>
                    {t.stock !== undefined && t.remaining !== undefined && (
                      <span className={`bf-tier__stock${soldOut(t) ? " is-out" : ""}`}>
                        {soldOut(t) ? "Vypredané" : stockLabel(t.remaining, t.stock)}
                      </span>
                    )}
                    <span className="bf-tier__off">−{percentOff(t)} %</span>
                    <span className="bf-tier__more">
                      <span>
                        <span className="bf-tier__list">
                          {t.includes.map((i) => (
                            <span key={i}>{i}</span>
                          ))}
                        </span>
                        <span className="bf-tier__save">Ušetríte {formatEur(t.compareAtCents - t.priceCents)}</span>
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </TrackView>

          <p className="bf-trust">Platba kartou, Apple Pay alebo Google Pay · poukážka s kódom príde hneď e-mailom</p>

          <div className="bf-bar">
            <div className="bf-bar__in">
              <p className="bf-bar__sum" aria-live="polite">
                <span className="bf-bar__tier">{sel.tier}</span>
                <span className="bf-bar__price">{price} €</span>
                <span className="bf-bar__save">ušetríte {save} €</span>
              </p>
              {phase === "live" ? (
                <BuyButton productId={sel.id} productName={sel.name} priceCents={sel.priceCents} label="Kúpiť" className="bf-buy" />
              ) : (
                <div className="buy">
                  <button className="btn btn--buy bf-buy bf-buy--wait" disabled>
                    Predaj od {startLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
