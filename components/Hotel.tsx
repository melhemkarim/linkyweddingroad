"use client";

import { useEffect, useRef, useState } from "react";

type P = { d: string; w?: number; s: number; t?: number; c?: "acc" | "gold" };

const rays = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return `M${(338 + Math.cos(a) * 22).toFixed(1)} ${(64 + Math.sin(a) * 22).toFixed(1)} L${(338 + Math.cos(a) * 29).toFixed(1)} ${(64 + Math.sin(a) * 29).toFixed(1)}`;
}).join(" ");

// window grid of the tower: 4 columns x 4 rows
const cols = [139, 173, 207, 241];
const rows = [112, 146, 180, 214];
const wins: [number, number][] = rows.flatMap((y) => cols.map((x) => [x, y] as [number, number]));
// which windows have their light on (a nice irregular pattern)
const lit = new Set([0, 2, 3, 5, 6, 8, 9, 11, 12, 14]);
const wing: [number, number][] = [[52, 268], [80, 268], [310, 268], [338, 268]];

const lines: P[] = [
  { d: "M12 316 H388", s: 0, t: 1.2 }, // ground
  { d: "M110 316 V96 H290 V316", s: 0.4, t: 1.8, w: 2.6 }, // tower
  { d: "M100 96 H300 M108 96 V86 H292 V96", s: 1.3, t: 1.0, w: 2.4 }, // cornice
  { d: "M40 316 V252 H110 M290 252 H360 V316", s: 1.0, t: 1.4, w: 2.4 }, // side wings
  { d: "M34 252 H116 M284 252 H366", s: 1.8, t: 0.7 }, // wing roofs
  { d: "M142 262 H258 L250 248 H150 Z", s: 2.0, t: 0.9, w: 2.4 }, // canopy
  { d: "M152 262 V316 M248 262 V316", s: 2.2, t: 0.7 }, // pillars
  { d: "M168 316 V272 H232 V316", s: 2.3, t: 0.8, w: 2.4 }, // door frame
  { d: "M156 316 V310 H244 V316", s: 2.5, t: 0.5 }, // step
  { d: "M200 86 V56", s: 2.8, t: 0.5, c: "acc", w: 2.4 }, // flagpole
  { d: "M18 316 C22 292 16 272 24 252 M24 252 Q10 246 3 256 M24 252 Q18 238 6 238 M24 252 Q36 242 48 250 M24 252 Q32 238 42 236", s: 2.6, t: 1.3 }, // palm left
  { d: "M382 316 C378 292 384 272 376 252 M376 252 Q390 246 397 256 M376 252 Q382 238 394 238 M376 252 Q364 242 352 250 M376 252 Q368 238 358 236", s: 2.9, t: 1.3 }, // palm right
  { d: "M338 42 A22 22 0 1 1 337.9 42", s: 3.1, t: 0.9, c: "gold" }, // sun
];

const blooms = [[88, 311], [128, 312], [272, 312], [312, 311], [60, 310]];

/**
 * A little hotel that draws itself: tower, wings, canopy, palms. Then the windows
 * light up one by one, the doors open with a warm light, the flag waves,
 * birds fly past and small white flowers open at the foot.
 */
export function Hotel({ mirror = false, label = "" }: { mirror?: boolean; label?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`church hotel ${on ? "on" : ""}`}
      viewBox="0 0 400 330"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <g transform={mirror ? "translate(400 0) scale(-1 1)" : undefined}>
        <path className="glow" d="M168 316 V272 H232 V316 Z" />
        <path className="glow soft" d="M160 316 L168 306 H232 L240 316 Z" />

        {/* windows light up one by one */}
        {wins.map(([x, y], i) => (
          <rect key={i} className={`win ${lit.has(i) ? "lit" : ""}`} x={x} y={y} width="20" height="22" rx="1.5" style={{ ["--d" as string]: `${3.2 + ((i * 7) % 16) * 0.16}s` }} />
        ))}
        {wing.map(([x, y], i) => (
          <rect key={`w${i}`} className="win lit" x={x} y={y} width="14" height="20" rx="1.5" style={{ ["--d" as string]: `${3.4 + i * 0.3}s` }} />
        ))}

        {lines.map((l, i) => (
          <path
            key={i}
            className={`cl ${l.c ?? ""}`}
            pathLength={1}
            d={l.d}
            style={{ ["--d" as string]: `${l.s}s`, ["--t" as string]: `${l.t ?? 0.8}s`, strokeWidth: l.w ?? 2 }}
          />
        ))}

        {/* window frames, drawn */}
        {wins.map(([x, y], i) => (
          <rect key={`f${i}`} className="cl" x={x} y={y} width="20" height="22" rx="1.5" pathLength={1} style={{ ["--d" as string]: `${1.6 + (i % 4) * 0.12 + Math.floor(i / 4) * 0.2}s`, ["--t" as string]: "0.7s", strokeWidth: 1.6 }} />
        ))}
        {wing.map(([x, y], i) => (
          <rect key={`wf${i}`} className="cl" x={x} y={y} width="14" height="20" rx="1.5" pathLength={1} style={{ ["--d" as string]: `${2.2 + i * 0.1}s`, ["--t" as string]: "0.6s", strokeWidth: 1.6 }} />
        ))}

        {/* the two door leaves slide open */}
        <path className="leaf l" d="M168 316 V272 H200 V316 Z" />
        <path className="leaf r" d="M232 316 V272 H200 V316 Z" />

        {/* flag */}
        <path className="flag" d="M200 58 L228 66 L200 74 Z" />
        <circle className="crossGlow" cx="200" cy="66" r="16" />

        <g className="rays">
          <path className="cl gold" pathLength={1} d={rays} style={{ ["--d" as string]: "3.4s", ["--t" as string]: "0.7s" }} />
        </g>

        {blooms.map(([x, y], i) => (
          <g key={i} className="bloom" style={{ ["--d" as string]: `${3.4 + i * 0.25}s`, transformOrigin: `${x}px ${y}px` }}>
            {Array.from({ length: 5 }, (_, k) => {
              const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
              return <circle key={k} cx={x + Math.cos(a) * 3.6} cy={y - 4 + Math.sin(a) * 3.6} r="2.7" />;
            })}
            <circle className="eye" cx={x} cy={y - 4} r="1.5" />
            <path d={`M${x} ${y - 1} V${y + 6}`} className="stalk" />
          </g>
        ))}

        <g className="bird b1">
          <path d="M0 0 q5 -6 10 0 q5 -6 10 0" />
        </g>
        <g className="bird b2">
          <path d="M0 0 q4 -5 8 0 q4 -5 8 0" />
        </g>

        {[[60, 120], [136, 60], [250, 44], [320, 130], [380, 170]].map(([x, y], i) => (
          <path
            key={i}
            className="twinkle"
            d={`M${x} ${y - 7} L${x + 1.6} ${y - 1.6} L${x + 7} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 7} L${x - 1.6} ${y + 1.6} L${x - 7} ${y} L${x - 1.6} ${y - 1.6} Z`}
            style={{ ["--d" as string]: `${3.6 + i * 0.5}s`, transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </g>
    </svg>
  );
}
