"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { monthName, pad } from "@/lib/dates";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const sparks = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
  const r = 70 + ((i * 37) % 70);
  return { dx: +(Math.cos(a) * r).toFixed(1), dy: +(Math.sin(a) * r * 1.2).toFixed(1), d: (i % 6) * 0.04, s: 3 + (i % 3) };
});

/**
 * The date is made of the two childhood photos: his half and her half start far apart,
 * and as you scroll they slide together. When they touch, the date locks into one
 * piece, a gold seam lights up and the phone gives a small buzz.
 */
export function DateReveal() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const seam = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const w = wrap.current;
    const s = stage.current;
    const L = left.current;
    const R = right.current;
    const S = seam.current;
    if (!w || !s || !L || !R || !S) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let wasLocked = false;
    let wasStarted = false;
    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      const p = reduce ? 1 : clamp(-r.top / total);
      const W = s.clientWidth;
      const t = clamp((p - 0.03) / 0.6);
      const e = ease(t);
      const off = (1 - e) * W * 0.27;
      const rot = (1 - e) * 6;
      L.style.opacity = R.style.opacity = String(clamp(p / 0.04));
      L.style.transform = `translate3d(${(-off).toFixed(1)}px,${(off * 0.14).toFixed(1)}px,0) rotate(${(-rot).toFixed(2)}deg)`;
      R.style.transform = `translate3d(${off.toFixed(1)}px,${(-off * 0.14).toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg)`;
      S.style.opacity = String(e * e);
      S.style.transform = `translateX(-50%) scaleY(${(0.15 + e * 0.85).toFixed(3)})`;
      s.style.setProperty("--e", e.toFixed(3));
      const nowLocked = t >= 0.995;
      const nowStarted = p > 0.02;
      if (nowLocked !== wasLocked) {
        wasLocked = nowLocked;
        setLocked(nowLocked);
        if (nowLocked && navigator.vibrate) navigator.vibrate([18, 40, 30]);
      }
      if (nowStarted !== wasStarted) setStarted((wasStarted = nowStarted));
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

  const { day } = site.date;
  const lines = [pad(day), monthName.toUpperCase(), String(site.date.year)];
  const Text = ({ shine = false }: { shine?: boolean }) => (
    <div className={`drText ${shine ? "drShine" : ""}`} aria-hidden={shine ? true : undefined}>
      <span className="drDay">{lines[0]}</span>
      <span className="drMonth">{lines[1]}</span>
      <span className="drYear">{lines[2]}</span>
    </div>
  );

  return (
    <section className="dr" ref={wrap} aria-label={`${site.text.calendarTitle}: ${day} ${monthName} ${site.date.year}`}>
      <div className={`drStage ${locked ? "locked" : ""}`} ref={stage}>
        <div className="drCaps" aria-hidden="true">
          <div className={`drCap ${locked ? "" : "on"}`}>{site.text.dateLines[0]}</div>
          <div className={`drCap ${locked ? "on" : ""}`}>{site.text.dateLines[1]}</div>
        </div>

        <div className="drGlowGap" aria-hidden="true" />

        <div className="drHalf drL" ref={left} style={{ ["--img" as string]: `url(${site.photoHim})` }} aria-hidden="true">
          <div className="drBg" />
          <div className="drTextBox">
            <Text />
          </div>
        </div>
        <div className="drHalf drR" ref={right} style={{ ["--img" as string]: `url(${site.photoHer})` }} aria-hidden="true">
          <div className="drBg" />
          <div className="drTextBox">
            <Text />
          </div>
        </div>

        <div className="drShineBox" aria-hidden="true">
          <Text shine />
        </div>

        <div className="drSeam" ref={seam} aria-hidden="true" />
        <div className="drSparks" aria-hidden="true">
          {sparks.map((s, i) => (
            <i key={i} style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, ["--d" as string]: `${s.d}s`, width: s.s, height: s.s }} />
          ))}
        </div>

        <div className={`drHint ${started ? "gone" : ""}`} aria-hidden="true">
          {site.text.dateHint}
        </div>
      </div>
    </section>
  );
}
