"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { scenes, viewBoxes, type SceneName } from "@/lib/scenes";

const DUR = { xs: 0.55, sm: 0.8, md: 1.2, lg: 1.8 } as const;
const STEP = { xs: 0.09, sm: 0.25, md: 0.45, lg: 0.6 } as const;
const MAX_START = 7; // the last stroke starts at most this many seconds in

/**
 * A hand-drawn red scene that draws itself, stroke by stroke.
 * It starts when it scrolls into view, or when `play` turns true.
 */
export function Scene({ name, play, className = "", label = "", tone = "red" }: { name: SceneName; play?: boolean; className?: string; label?: string; tone?: "red" | "cream" }) {
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);
  const on = play ?? seen;

  const parts = useMemo(() => {
    const items = scenes[name];
    let t = 0;
    const raw = items.map((it) => {
      const s = it.s ?? "md";
      const start = t;
      t += STEP[s];
      return { it, s, start };
    });
    const k = t > MAX_START ? MAX_START / t : 1;
    return raw.map(({ it, s, start }) => ({ it, dur: DUR[s], delay: start * k }));
  }, [name]);

  useEffect(() => {
    if (play !== undefined) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [play]);

  return (
    <svg
      ref={ref}
      className={`scn ${tone === "cream" ? "cream" : ""} ${on ? "on" : ""} ${className}`}
      viewBox={viewBoxes[name] ?? "0 0 400 500"}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      {parts.map(({ it, dur, delay }, i) => {
        const f = it.f ?? 0;
        return (
          <g key={i} transform={it.tr}>
            {f === 2 && <path className="sf paper" d={it.d} style={{ ["--d" as string]: `${delay.toFixed(2)}s` }} />}
            <path
              className={`sl ${it.c ?? ""}`}
              pathLength={1}
              d={it.d}
              style={{ ["--d" as string]: `${delay.toFixed(2)}s`, ["--t" as string]: `${dur}s`, strokeWidth: it.w ?? 2.2 }}
            />
            {f === 1 && <path className={`sf tint ${it.c ?? ""}`} d={it.d} style={{ ["--d" as string]: `${(delay + dur * 0.8).toFixed(2)}s` }} />}
          </g>
        );
      })}
    </svg>
  );
}
