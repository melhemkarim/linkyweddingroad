"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Her, Him } from "./Couple";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// the arch they meet under (a nod to the photo: white arch, little dome, evil eyes, flowers)
const archLines = [
  "M30 400 V176 H330 V400",
  "M92 400 V236 A88 88 0 0 1 268 236 V400",
  "M108 400 V238 A72 72 0 0 1 252 238 V400",
  "M130 176 V132 H230 V176",
  "M126 132 C126 90 234 90 234 132",
  "M164 100 V72 H196 V100 M160 72 C160 52 200 52 200 72",
  "M180 52 V34 M172 41 H188",
  "M42 262 C52 250 70 250 80 262 C70 274 52 274 42 262 Z M280 262 C290 250 308 250 318 262 C308 274 290 274 280 262 Z",
];
const flowers: [number, number][] = [
  [38, 190], [58, 176], [84, 192], [30, 220], [66, 214], [326, 192], [300, 178], [276, 194], [334, 222], [296, 216], [58, 300], [302, 304],
];
const hearts = [0, 1, 2, 3, 4, 5, 6];

/**
 * Scroll story: the two of them walk toward each other, meet under an arch
 * and stand close like in the photo. Everything is driven by how far you scroll.
 */
export function Walk() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const herBox = useRef<HTMLDivElement>(null);
  const himBox = useRef<HTMLDivElement>(null);
  const [met, setMet] = useState(false);
  const [line, setLine] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const w = wrap.current;
    const s = stage.current;
    const h = herBox.current;
    const m = himBox.current;
    if (!w || !s || !h || !m) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let lastMet = false;
    let lastLine = 0;
    let lastStarted = false;

    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      const p = reduce ? 1 : clamp(-r.top / total);
      const W = s.clientWidth;
      const fw = Math.min(150, W * 0.36);
      const walkP = clamp(p / 0.72);
      const hx = lerp(-fw - 16, W / 2 - fw * 0.8, walkP);
      const mx = lerp(W + 16, W / 2 - fw * 0.25, walkP);
      h.style.width = fw + "px";
      m.style.width = fw * 1.1 + "px";
      h.style.transform = `translate3d(${hx}px,0,0)`;
      m.style.transform = `translate3d(${mx}px,0,0)`;
      const ang = walkP * 9 * Math.PI * 2;
      const settle = 1 - clamp((walkP - 0.9) / 0.1);
      s.style.setProperty("--sw", (Math.sin(ang) * (walkP > 0 ? settle : 0)).toFixed(3));
      s.style.setProperty("--bob", (Math.abs(Math.cos(ang)) * (walkP > 0 ? settle : 0)).toFixed(3));
      s.style.setProperty("--arch", clamp((p - 0.05) / 0.6).toFixed(3));
      const nowMet = p > 0.78;
      const nowLine = nowMet ? 2 : p > 0.3 ? 1 : 0;
      const nowStarted = p > 0.04;
      if (nowMet !== lastMet) setMet((lastMet = nowMet));
      if (nowLine !== lastLine) setLine((lastLine = nowLine));
      if (nowStarted !== lastStarted) setStarted((lastStarted = nowStarted));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const lines = site.text.walkLines;
  return (
    <section className="walk" ref={wrap} aria-label="Our walk">
      <div className={`walkStage ${met ? "met" : ""}`} ref={stage}>
        <div className="walkCaps" aria-live="off">
          {lines.map((t, i) => (
            <div key={i} className={`walkCap ${line === i ? "on" : ""}`}>
              {t}
            </div>
          ))}
        </div>

        <svg className="walkArch" viewBox="0 0 360 400" aria-hidden="true">
          {archLines.map((d, i) => (
            <path key={i} className="archLine" pathLength={1} d={d} />
          ))}
          <path className="archDome" d="M126 132 C126 90 234 90 234 132 Z" />
          {flowers.map(([x, y], i) => (
            <g key={i} className="bougain" style={{ ["--d" as string]: `${0.3 + i * 0.09}s`, transformOrigin: `${x}px ${y}px` }}>
              <circle cx={x} cy={y} r="6" />
              <circle cx={x + 7} cy={y + 4} r="4.5" />
              <circle cx={x - 6} cy={y + 5} r="4.5" />
            </g>
          ))}
        </svg>

        <svg className="walkGround" viewBox="0 0 400 4" preserveAspectRatio="none" aria-hidden="true">
          <path className="archLine" pathLength={1} d="M0 2 H400" />
        </svg>

        <div className="figs">
          <div className="figBox herBox" ref={herBox}>
            <Her />
          </div>
          <div className="figBox himBox" ref={himBox}>
            <Him />
          </div>
          <div className="hearts" aria-hidden="true">
            {hearts.map((i) => (
              <svg key={i} className="heart" viewBox="0 0 24 22" style={{ ["--i" as string]: i }}>
                <path d="M12 21 C4 14 1 10 1 6.5 C1 3.2 3.6 1 6.6 1 C9 1 11 2.4 12 4.4 C13 2.4 15 1 17.4 1 C20.4 1 23 3.2 23 6.5 C23 10 20 14 12 21 Z" />
              </svg>
            ))}
          </div>
        </div>

        <div className={`walkHint ${started ? "gone" : ""}`} aria-hidden="true">
          {site.text.walkHint}
        </div>
      </div>
    </section>
  );
}
