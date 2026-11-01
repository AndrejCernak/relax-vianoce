"use client";

import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number };

/**
 * Jemné sneženie na pozadí tmavej sekcie (canvas cez celého rodiča).
 * Beží len keď je sekcia viditeľná; pri „obmedziť pohyb“ ukáže nehybné vločky.
 */
export default function Snowfall({ className = "", density = 1 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let raf = 0;
    let last = 0;
    let inView = false;

    const make = (y?: number): Flake => {
      const r = 0.6 + Math.random() ** 2 * 2.4;
      return {
        x: Math.random() * w,
        y: y ?? Math.random() * h,
        r,
        vy: 14 + r * 14,
        sway: 6 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.55,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#fff";
      flakes = Array.from({ length: Math.min(160, Math.round(((w * h) / 9000) * density)) }, () => make());
      draw();
    };

    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      for (const f of flakes) {
        f.y += f.vy * dt;
        f.phase += dt * 0.8;
        if (f.y - f.r > h) Object.assign(f, make(-f.r * 2));
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (still || raf || !inView || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={ref} className={`snow ${className}`} aria-hidden="true" />;
}
