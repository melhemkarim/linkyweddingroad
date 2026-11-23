"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { rng } from "@/lib/brush";

const W = 70; // tile width
const H = 440; // tile height

const f = (n: number) => n.toFixed(1);
type Pt = [number, number];

/** A petal, drawn as one loose loop out from the centre. */
function petal(r: () => number, cx: number, cy: number, ang: number, len: number, wid: number): string {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const p = (x: number, y: number): Pt => [cx + x * ca - y * sa, cy + x * sa + y * ca];
  const j = () => (r() - 0.5) * 1.6;
  const a = p(len * 0.35, -wid + j());
  const b = p(len * 1.02, -wid * 0.45 + j());
  const tip = p(len * 1.08, j() * 0.5);
  const c = p(len * 1.02, wid * 0.45 + j());
  const d = p(len * 0.35, wid + j());
  return `M ${f(cx)} ${f(cy)} C ${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(tip[0])} ${f(tip[1])} C ${f(c[0])} ${f(c[1])} ${f(d[0])} ${f(d[1])} ${f(cx)} ${f(cy)}`;
}

/** A small loose spiral for the middle of a flower. */
function swirl(r: () => number, cx: number, cy: number, rad: number): string {
  let d = "";
  const turns = 2.2;
  const n = 14;
  const off = r() * 6;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = off + t * turns * Math.PI * 2;
    const rr = rad * t;
    d += `${i === 0 ? "M" : "L"} ${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)} `;
  }
  return d;
}

type Flower = { petals: string[]; core: string; delay: number };
type Leaf = { d: string; vein: string; delay: number };
type Tile = { stem: string; curls: string[]; leaves: Leaf[]; flowers: Flower[]; dots: Pt[] };

/** One section of vine: a wavy stem with leaves, small curls and two or three flowers. */
function makeTile(seed: number): Tile {
  const r = rng(seed * 7 + 3);
  const amp = 11 + r() * 3;
  const x0 = W * 0.42;
  // stem points, going down the tile
  const pts: Pt[] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * H;
    const x = x0 + Math.sin((i / steps) * Math.PI * 4) * amp + (i > 0 && i < steps ? (r() - 0.5) * 3 : 0);
    pts.push([x, y]);
  }
  let stem = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[i];
    const c = pts[i + 1];
    const d = pts[Math.min(pts.length - 1, i + 2)];
    stem += ` C ${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (d[0] - b[0]) / 6)} ${f(c[1] - (d[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
  }

  const at = (t: number): Pt => {
    const k = Math.min(steps - 0.001, t * steps);
    const i = Math.floor(k);
    const u = k - i;
    return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
  };

  const leaves: Leaf[] = [];
  const nLeaves = 7;
  for (let i = 0; i < nLeaves; i++) {
    const t = 0.06 + (i / nLeaves) * 0.9 + (r() - 0.5) * 0.04;
    const [px, py] = at(t);
    const side = i % 2 === 0 ? 1 : -1;
    const ang = side > 0 ? -0.5 + r() * 0.4 : Math.PI + 0.5 - r() * 0.4;
    const len = 20 + r() * 9;
    const wid = 5.5 + r() * 2;
    const ca = Math.cos(ang);
    const sa = Math.sin(ang);
    const q = (x: number, y: number): Pt => [px + x * ca - y * sa, py + x * sa + y * ca];
    const a = q(len * 0.3, -wid);
    const b = q(len * 0.85, -wid * 0.6);
    const tip = q(len, 0);
    const c = q(len * 0.85, wid * 0.6);
    const d = q(len * 0.3, wid);
    const d0 = `M ${f(px)} ${f(py)} C ${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(tip[0])} ${f(tip[1])} C ${f(c[0])} ${f(c[1])} ${f(d[0])} ${f(d[1])} ${f(px)} ${f(py)}`;
    const v = q(len * 0.72, 0);
    leaves.push({ d: d0, vein: `M ${f(px)} ${f(py)} L ${f(v[0])} ${f(v[1])}`, delay: t });
  }

  // little curls (tendrils)
  const curls: string[] = [];
  for (let i = 0; i < 3; i++) {
    const t = 0.14 + i * 0.3 + r() * 0.05;
    const [px, py] = at(t);
    const side = i % 2 === 0 ? -1 : 1;
    const s = 9 + r() * 4;
    curls.push(
      `M ${f(px)} ${f(py)} c ${f(side * s)} ${f(-s * 0.4)} ${f(side * s * 1.5)} ${f(s * 0.7)} ${f(side * s * 0.8)} ${f(s * 1.3)} c ${f(-side * s * 0.4)} ${f(s * 0.5)} ${f(-side * s * 1.1)} ${f(s * 0.1)} ${f(-side * s * 0.6)} ${f(-s * 0.4)}`
    );
  }

  // flowers sit on the stem at spread-out spots
  const flowers: Flower[] = [];
  const spots = [0.16, 0.5, 0.84];
  spots.forEach((t, i) => {
    const [sx, sy] = at(t);
    const reach = i % 2 === 0 ? 17 : -17;
    const cx = sx + reach;
    const cy = sy - 4;
    // the middle flower is a rounder orange blossom, the others are pointed jasmine stars
    const blossom = i === 1;
    const big = (blossom ? 12 : 15) + r() * 3;
    const n = 5;
    const rot = r() * Math.PI;
    const petals: string[] = [];
    for (let k = 0; k < n; k++) {
      petals.push(petal(r, cx, cy, rot + (k / n) * Math.PI * 2, big, big * (blossom ? 0.42 : 0.22)));
    }
    flowers.push({ petals, core: swirl(r, cx, cy, big * 0.34), delay: t });
    // short stalk from the stem to the flower
    leaves.push({
      d: "",
      vein: `M ${f(sx)} ${f(sy)} Q ${f(sx + reach * 0.4)} ${f(sy + 2)} ${f(cx - Math.sign(reach) * big * 0.3)} ${f(cy + 1)}`,
      delay: t,
    });
  });

  const dots: Pt[] = [];
  for (let i = 0; i < 3; i++) dots.push([6 + r() * (W - 12), 18 + r() * (H - 36)]);

  return { stem, curls, leaves, flowers, dots };
}

/** One tile, drawn in when it scrolls into view. */
function VineTile({ seed, flip }: { seed: number; flip: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);
  const tile = useMemo(() => makeTile(seed), [seed]);

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
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // the stem takes 2.4s; everything else starts when the stem reaches it
  const at = (t: number) => `${(0.2 + t * 2.2).toFixed(2)}s`;

  return (
    <svg
      ref={ref}
      className={`vineTile ${on ? "on" : ""} ${flip ? "flip" : ""}`}
      viewBox={`-15 0 ${W + 30} ${H}`}
      width={W + 30}
      height={H}
      aria-hidden="true"
    >
      <path className="vd stem" pathLength={1} d={tile.stem} style={{ ["--d" as string]: "0s", ["--t" as string]: "2.6s" }} />
      {tile.curls.map((d, i) => (
        <path key={`c${i}`} className="vd" pathLength={1} d={d} style={{ ["--d" as string]: at(0.14 + i * 0.3), ["--t" as string]: "0.9s" }} />
      ))}
      {tile.leaves.map((l, i) => (
        <g key={`l${i}`}>
          {l.d && <path className="vd leaf" pathLength={1} d={l.d} style={{ ["--d" as string]: at(l.delay), ["--t" as string]: "0.9s" }} />}
          {l.d && <path className="vf" d={l.d} style={{ ["--d" as string]: `${(0.2 + l.delay * 2.2 + 0.8).toFixed(2)}s` }} />}
          <path className="vd vein" pathLength={1} d={l.vein} style={{ ["--d" as string]: at(l.delay), ["--t" as string]: "0.7s" }} />
        </g>
      ))}
      {tile.flowers.map((fl, i) => (
        <g key={`f${i}`}>
          {fl.petals.map((d, k) => (
            <g key={k}>
              <path className="vf acc petalFill" d={d} style={{ ["--d" as string]: `${(0.2 + fl.delay * 2.2 + 0.4 + k * 0.28 + 0.5).toFixed(2)}s` }} />
              <path
                className="vd acc"
                pathLength={1}
                d={d}
                style={{ ["--d" as string]: `${(0.2 + fl.delay * 2.2 + 0.4 + k * 0.28).toFixed(2)}s`, ["--t" as string]: "0.7s" }}
              />
            </g>
          ))}
          <path
            className="vd acc core"
            pathLength={1}
            d={fl.core}
            style={{ ["--d" as string]: `${(0.2 + fl.delay * 2.2 + 0.4 + fl.petals.length * 0.28).toFixed(2)}s`, ["--t" as string]: "0.8s" }}
          />
        </g>
      ))}
      {tile.dots.map(([x, y], i) => (
        <circle key={i} className="vdot" cx={x} cy={y} r={1.6} style={{ ["--d" as string]: `${(1 + i * 0.35).toFixed(2)}s` }} />
      ))}
    </svg>
  );
}

/**
 * Flowers and vines down the left and right edge of a section.
 * They draw themselves as you scroll down to them.
 * The parent needs class "vined".
 */
export function Vines({ seed = 1, tone = "red" }: { seed?: number; tone?: "red" | "cream" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(6);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const measure = () => setCount(Math.max(1, Math.ceil(el.clientHeight / H)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`vines ${tone}`} aria-hidden="true">
      <div className="vineCol left">
        {Array.from({ length: count }).map((_, i) => (
          <VineTile key={i} seed={seed * 31 + i} flip={false} />
        ))}
      </div>
      <div className="vineCol right">
        {Array.from({ length: count }).map((_, i) => (
          <VineTile key={i} seed={seed * 31 + i + 17} flip />
        ))}
      </div>
    </div>
  );
}
