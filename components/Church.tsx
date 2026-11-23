"use client";

import { useEffect, useRef, useState } from "react";

type P = { d: string; w?: number; s: number; t?: number; c?: "acc" | "gold" };

// Spokes of the round window, worked out once
const spokes = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return `M180 212 L${(180 + Math.cos(a) * 13).toFixed(1)} ${(212 + Math.sin(a) * 13).toFixed(1)}`;
}).join(" ");
const rays = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return `M${(338 + Math.cos(a) * 22).toFixed(1)} ${(64 + Math.sin(a) * 22).toFixed(1)} L${(338 + Math.cos(a) * 29).toFixed(1)} ${(64 + Math.sin(a) * 29).toFixed(1)}`;
}).join(" ");

// every line of the church, in the order it is drawn (s = start second)
const lines: P[] = [
  { d: "M12 316 H388", s: 0, t: 1.2 }, // ground
  { d: "M146 316 V310 H214 V316 M154 310 V304 H206 V310", s: 0.5, t: 0.8 }, // steps
  { d: "M108 316 V200 L180 148 L252 200 V316", s: 0.7, t: 1.5, w: 2.6 }, // front
  { d: "M100 206 L180 144 L260 206", s: 1.2, t: 1.0 }, // roof edge
  { d: "M252 316 V152 H306 V316", s: 1.0, t: 1.6, w: 2.6 }, // tower
  { d: "M246 152 L279 86 L312 152 Z", s: 1.7, t: 1.0, w: 2.6 }, // spire
  { d: "M252 214 H306 M252 262 H306", s: 2.1, t: 0.6 }, // tower bands
  { d: "M268 196 V176 A11 11 0 0 1 290 176 V196", s: 2.2, t: 0.6 }, // belfry
  { d: "M274 296 V282 A5 5 0 0 1 284 282 V296 Z", s: 2.4, t: 0.5 },
  { d: "M34 316 V238 L108 212", s: 1.3, t: 1.2, w: 2.4 }, // side nave
  { d: "M48 292 V268 A6 6 0 0 1 60 268 V292 Z M68 292 V268 A6 6 0 0 1 80 268 V292 Z M88 292 V268 A6 6 0 0 1 100 268 V292 Z", s: 2.3, t: 0.9 },
  { d: "M120 292 V262 A8 8 0 0 1 136 262 V292 Z M224 292 V262 A8 8 0 0 1 240 262 V292 Z", s: 2.4, t: 0.8 }, // front windows
  { d: "M158 304 V262 A22 22 0 0 1 202 262 V304", s: 2.0, t: 1.0, w: 2.4 }, // door arch
  { d: "M193 212 A13 13 0 1 1 167 212 A13 13 0 1 1 193 212", s: 2.6, t: 0.8 }, // round window
  { d: "M180 144 V122 M171 131 H189", s: 3.0, t: 0.6, c: "acc", w: 2.6 }, // cross
  { d: "M279 86 V64 M270 73 H288", s: 3.0, t: 0.6, c: "acc", w: 2.6 }, // tower cross
  { d: "M346 316 V292 M346 290 C330 266 330 218 346 192 C362 218 362 266 346 290 Z", s: 2.6, t: 1.2 }, // cypress
  { d: "M372 316 V300 M372 298 C363 284 363 258 372 244 C381 258 381 284 372 298 Z", s: 2.9, t: 0.9 },
  { d: "M338 42 A22 22 0 1 1 337.9 42", s: 3.1, t: 0.9, c: "gold" }, // sun
];

// five small white flowers along the ground
const blooms = [
  [78, 309], [126, 311], [236, 311], [318, 309], [24, 310],
];

/**
 * A little church that draws itself: ground, walls, tower, door, windows, cross.
 * Then the door opens with a warm light inside, the bell swings, the cross glows,
 * birds fly past and small white flowers open at the foot of the walls.
 */
export function Church({ mirror = false, label = "" }: { mirror?: boolean; label?: string }) {
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
      className={`church ${on ? "on" : ""}`}
      viewBox="0 0 400 330"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
    >
      <g transform={mirror ? "translate(400 0) scale(-1 1)" : undefined}>
        {/* warm light inside the door */}
        <path className="glow" d="M158 304 V262 A22 22 0 0 1 202 262 V304 Z" />
        <path className="glow soft" d="M150 316 L158 304 H202 L210 316 Z" />

        {lines.map((l, i) => (
          <path
            key={i}
            className={`cl ${l.c ?? ""}`}
            pathLength={1}
            d={l.d}
            style={{ ["--d" as string]: `${l.s}s`, ["--t" as string]: `${l.t ?? 0.8}s`, strokeWidth: l.w ?? 2 }}
          />
        ))}

        {/* round window: spokes turn slowly */}
        <g className="spokes">
          <path className="cl" pathLength={1} d={spokes} style={{ ["--d" as string]: "3.0s", ["--t" as string]: "0.6s" }} />
          <circle className="cl" cx="180" cy="212" r="4" pathLength={1} style={{ ["--d" as string]: "3.2s", ["--t" as string]: "0.5s" }} />
        </g>

        {/* the two door leaves swing open */}
        <path className="leaf l" d="M158 304 V262 Q158 240 180 240 V304 Z" />
        <path className="leaf r" d="M202 304 V262 Q202 240 180 240 V304 Z" />

        {/* bell inside the tower */}
        <g className="bellSwing">
          <path className="bell" d="M279 164 V170 M273 186 Q273 174 279 174 Q285 174 285 186 L288 190 H270 Z" />
        </g>

        {/* glow behind the crosses */}
        <circle className="crossGlow" cx="180" cy="131" r="13" />
        <circle className="crossGlow" cx="279" cy="73" r="12" />

        {/* sun with turning rays */}
        <g className="rays">
          <path className="cl gold" pathLength={1} d={rays} style={{ ["--d" as string]: "3.4s", ["--t" as string]: "0.7s" }} />
        </g>

        {/* white flowers at the foot of the walls */}
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

        {/* birds */}
        <g className="bird b1">
          <path d="M0 0 q5 -6 10 0 q5 -6 10 0" />
        </g>
        <g className="bird b2">
          <path d="M0 0 q4 -5 8 0 q4 -5 8 0" />
        </g>

        {/* twinkles */}
        {[[60, 120], [136, 84], [226, 54], [214, 112], [380, 150]].map(([x, y], i) => (
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
