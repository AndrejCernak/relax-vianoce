// Vianočné ozdoby stránky (čisté SVG, bez obrázkov). Všetky sú dekoratívne, preto aria-hidden.
import type { CSSProperties } from "react";

type P = { className?: string };

/** CSS premenné do atribútu style, napr. vars({ "--x": 30 }). */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

/** Gradienty pre ozdoby. Vkladá sa raz v layoute, ostatné SVG sa na ne odkazujú cez url(#...). */
export function DecorDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a47c3b" />
          <stop offset=".3" stopColor="#f3dfa8" />
          <stop offset=".5" stopColor="#c39a55" />
          <stop offset=".72" stopColor="#f6e6bf" />
          <stop offset="1" stopColor="#9c7638" />
        </linearGradient>
        <radialGradient id="g-wine" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#e9839f" />
          <stop offset=".35" stopColor="#a3385a" />
          <stop offset="1" stopColor="#420f22" />
        </radialGradient>
        <radialGradient id="g-gold" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset=".4" stopColor="#d8b06a" />
          <stop offset="1" stopColor="#6e4f1e" />
        </radialGradient>
        <radialGradient id="g-pine" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#8cc3a5" />
          <stop offset=".4" stopColor="#2f5a48" />
          <stop offset="1" stopColor="#0d1f17" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Star({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 0c.9 7.2 4.8 11.1 12 12-7.2.9-11.1 4.8-12 12-.9-7.2-4.8-11.1-12-12 7.2-.9 11.1-4.8 12-12Z" fill="currentColor" />
    </svg>
  );
}

export function Snowflake({ className }: P) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    >
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <path key={a} transform={`rotate(${a} 50 50)`} d="M50 50V8M50 22l-9-9M50 22l9-9M50 36l-7-6M50 36l7-6" />
      ))}
      <circle cx="50" cy="50" r="5" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="5" rx="1" />
      <path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 3.5 6.5 8 12 8Zm0 0s1.5-5 4-4.5S17.5 8 12 8Z" />
    </svg>
  );
}

/** Zlatá mašľa (darček v úvode, ďakovacia stránka). */
export function Bow({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 120 86" aria-hidden="true" focusable="false">
      <g fill="url(#g-foil)" stroke="#8d6a2f" strokeWidth=".8" strokeLinejoin="round">
        <path d="M56 42 40 80l9-4 5 8 9-40Z" />
        <path d="M64 42l16 38-9-4-5 8-9-40Z" />
        <path d="M60 40C44 14 10 6 8 28c-2 20 32 22 52 14Z" />
        <path d="M60 40c16-26 50-34 52-12 2 20-32 22-52 14Z" />
      </g>
      <path d="M58 38C46 22 24 16 18 26M62 38c12-16 34-22 40-12" fill="none" stroke="#8d6a2f" strokeWidth="1.2" opacity=".55" />
      <rect x="51" y="32" width="18" height="17" rx="6" fill="url(#g-foil)" stroke="#8d6a2f" strokeWidth=".8" />
    </svg>
  );
}

/** Vianočná guľa na šnúrke. Poloha a veľkosť sa nastavujú cez CSS premenné. */
export function Ornament({ tone, style }: { tone: "wine" | "gold" | "pine"; style?: CSSProperties }) {
  return (
    <span className="orn" style={style}>
      <span className="orn__string" />
      <svg viewBox="0 0 60 78" aria-hidden="true" focusable="false">
        <circle cx="30" cy="6.5" r="3.6" fill="none" stroke="#c9a15e" strokeWidth="1.6" />
        <circle cx="30" cy="48" r="28" fill={`url(#g-${tone})`} />
        <rect x="22" y="10" width="16" height="12" rx="2.5" fill="url(#g-foil)" />
        <path d="M3 44c9 7 45 7 54 0" fill="none" stroke="#ecd7a4" strokeWidth="1.6" opacity=".75" />
        <path d="M4 56c9 6 43 6 52 0" fill="none" stroke="#ecd7a4" strokeWidth="1.4" opacity=".55" strokeDasharray=".5 4" strokeLinecap="round" />
        <ellipse cx="19" cy="37" rx="5.5" ry="9" fill="#fff" opacity=".35" transform="rotate(35 19 37)" />
      </svg>
    </span>
  );
}

// Vetvičky čečiny: [hrot, základ, veľkosť ihličia] v súradniciach scény (100 = šírka scény).
const swagBranches: { tip: [number, number]; base: [number, number]; size: number }[] = [
  { tip: [34, 24], base: [76, 6], size: 0.9 },
  { tip: [16, 15], base: [76, 6], size: 1 },
  { tip: [52, -2], base: [76, 6], size: 0.7 },
  { tip: [98, 22], base: [76, 6], size: 0.75 },
  { tip: [104, 12], base: [76, 6], size: 0.85 },
];

function needles(len: number, size: number) {
  let d = "";
  for (let x = 0.5; x < len; x += 1.2) {
    const l = (2.2 + (x / len) * 3) * size;
    const px = x.toFixed(2);
    d += `M${px} 0l${(-l * 0.5).toFixed(2)} ${(-l).toFixed(2)}M${px} 0l${(-l * 0.5).toFixed(2)} ${l.toFixed(2)}`;
  }
  return d;
}

/** Čečina s jarabinou v hornej časti scény. viewBox zodpovedá súradniciam scény v cqw. */
export function Swag({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 100 92" overflow="visible" aria-hidden="true" focusable="false">
      {swagBranches.map(({ tip, base, size }, i) => {
        const dx = base[0] - tip[0];
        const dy = base[1] - tip[1];
        const len = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <g key={i} transform={`translate(${tip[0]} ${tip[1]}) rotate(${angle.toFixed(2)})`} fill="none" strokeLinecap="round">
            <path d={`M0 0H${len.toFixed(2)}`} stroke="#4a3226" strokeWidth=".8" />
            <path d={needles(len, size)} stroke={i % 2 ? "#24493a" : "#2f5a48"} strokeWidth=".9" />
            <path d={needles(len, size * 0.75)} stroke="#4f8a6c" strokeWidth=".5" />
            <path d={needles(len, size * 0.45)} stroke="#8fbfa3" strokeWidth=".3" opacity=".7" />
          </g>
        );
      })}
      <g>
        {[
          [76, 7, 2],
          [80, 9.6, 1.7],
          [73.4, 10, 1.6],
          [78.6, 4.4, 1.4],
        ].map(([x, y, r]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill="url(#g-wine)" />
            <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill="#fff" opacity=".6" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Adventný veniec okolo čísla kroku. */
export function Wreath({ n }: { n: number }) {
  const leaves = Array.from({ length: 24 }, (_, i) => i);
  const colors = ["#2c5242", "#3d6b56", "#1f3a2f"];
  return (
    <span className="wreath" aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        {leaves.map((i) => {
          const a = (i / leaves.length) * 360;
          const r = i % 2 ? 35 : 40;
          const x = 50 + r * Math.cos((a * Math.PI) / 180);
          const y = 50 + r * Math.sin((a * Math.PI) / 180);
          return (
            <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(a + 65).toFixed(1)})`}>
              <ellipse className="wreath__leaf" style={vars({ "--k": i })} rx="10" ry="4.2" fill={colors[i % 3]} />
            </g>
          );
        })}
        {[35, 155, 275].map((a) => {
          const x = 50 + 38 * Math.cos((a * Math.PI) / 180);
          const y = 50 + 38 * Math.sin((a * Math.PI) / 180);
          return (
            <g key={a}>
              <circle cx={x.toFixed(2)} cy={y.toFixed(2)} r="4" fill="url(#g-wine)" />
              <circle cx={(x + 5).toFixed(2)} cy={(y + 2).toFixed(2)} r="3.2" fill="url(#g-wine)" />
            </g>
          );
        })}
      </svg>
      <span className="wreath__num">{n}</span>
    </span>
  );
}

/** Zlatá pečať s rotujúcim textom na najobľúbenejšom darčeku. */
export function Seal() {
  return (
    <svg className="seal" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <path id="seal-path" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#g-foil)" />
      <circle cx="60" cy="60" r="53.5" fill="none" stroke="#7a5a24" strokeWidth=".8" strokeDasharray="1.5 3" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="#7a5a24" strokeWidth=".8" />
      <g className="seal__ring">
        <text className="seal__text">
          <textPath href="#seal-path">Najobľúbenejší darček ✦ Vianoce 2026 ✦</textPath>
        </text>
      </g>
      <path transform="translate(48 48)" d="M12 0c.9 7.2 4.8 11.1 12 12-7.2.9-11.1 4.8-12 12-.9-7.2-4.8-11.1-12-12 7.2-.9 11.1-4.8 12-12Z" fill="#5e3f14" />
    </svg>
  );
}

/** Snehový závej na spodku tmavej sekcie. Farba = currentColor (farba nasledujúcej sekcie). */
export function Snowdrift({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 1440 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 52C140 22 260 26 380 46s250 40 380 18 260-50 400-34 220 30 280 18V100H0Z" fill="currentColor" opacity=".45" />
      <path d="M0 70c120-26 250-30 370-12s240 34 380 16 260-46 390-30 200 28 300 14V100H0Z" fill="currentColor" />
    </svg>
  );
}

const trees: [number, number, number][] = [
  [150, 98, 0.9],
  [205, 92, 1.25],
  [262, 92, 0.8],
  [560, 118, 0.85],
  [800, 124, 1],
  [868, 112, 0.75],
  [985, 82, 1.1],
  [1045, 74, 1.35],
  [1110, 72, 0.9],
  [1330, 84, 1.15],
  [1385, 88, 0.8],
];

/** Kopce so stromčekmi nad pätičkou. */
export function Hills({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 1440 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <path d="M0 160V112C160 72 300 72 460 102s300 40 440-6 300-46 540-4V160Z" />
        {trees.map(([x, y, s]) => (
          <path key={x} transform={`translate(${x} ${y}) scale(${s})`} d="M0-64 14-36H7L21-14H11L25 8H-25L-11-14H-21L-7-36H-14Z" />
        ))}
      </g>
    </svg>
  );
}

const bulbColors = ["#ffd98a", "#ff9fb6", "#fff3dc", "#f3b45b"];

/** Reťaz svetielok. Drôt aj žiarovky ležia na tej istej krivke (dva oblúky). */
export function Lights({ count = 18 }: { count?: number }) {
  return (
    <div className="lights" aria-hidden="true">
      <svg viewBox="0 0 100 50" preserveAspectRatio="none" focusable="false">
        <path d="M0 10Q25 70 50 10T100 10" fill="none" stroke="#0b1812" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: count }, (_, i) => {
        const x = (i + 0.5) / count;
        const t = (x * 2) % 1;
        const y = 10 + 120 * t * (1 - t);
        return (
          <span
            key={i}
            className="bulb"
            style={vars({
              "--x": `${(x * 100).toFixed(2)}%`,
              "--y": `${(y * 2).toFixed(2)}%`,
              "--r": `${((0.5 - t) * 50).toFixed(1)}deg`,
              "--c": bulbColors[i % bulbColors.length],
              "--t": `${(1.4 + (i % 5) * 0.35).toFixed(2)}s`,
              "--dl": `${((i * 0.37) % 2).toFixed(2)}s`,
            })}
          />
        );
      })}
    </div>
  );
}
