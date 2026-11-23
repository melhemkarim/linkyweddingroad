"use client";

import { useEffect, useRef } from "react";
import { site } from "@/site.config";

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;

// ── the coast: a chain of curves, drawn from the top of the map to the bottom (sea on the left) ──
const START: Pt = [236, 0];
const CURVES: [Pt, Pt, Pt][] = [
  [[232, 140], [280, 250], [250, 380]],
  [[226, 500], [190, 560], [204, 700]],
  [[218, 840], [270, 900], [262, 1060]],
  [[254, 1200], [196, 1280], [210, 1440]],
  [[224, 1580], [280, 1650], [268, 1800]],
  [[256, 1950], [214, 2020], [226, 2160]],
  [[238, 2300], [220, 2420], [232, 2600]],
];
const H = 2600;

const coast: Pt[] = [];
{
  let p0 = START;
  coast.push(p0);
  for (const [a, b, c] of CURVES) {
    for (let i = 1; i <= 60; i++) {
      const t = i / 60;
      const u = 1 - t;
      coast.push([
        u * u * u * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * c[0],
        u * u * u * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * c[1],
      ]);
    }
    p0 = c;
  }
}
const coastX = (y: number) => {
  let lo = 0;
  let hi = coast.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (coast[mid][1] < y) lo = mid;
    else hi = mid;
  }
  const [x1, y1] = coast[lo];
  const [x2, y2] = coast[hi];
  return x1 + ((x2 - x1) * (y - y1)) / Math.max(0.001, y2 - y1);
};
const toPath = (pts: Pt[], dx = 0) => pts.map(([x, y], i) => `${i ? "L" : "M"}${(x + dx).toFixed(1)} ${y.toFixed(1)}`).join("");

// the gold road runs along the coast, a little inland
const ROAD_DX = 48;
const road = coast.filter(([, y]) => y >= 430 && y <= 2470).map(([x, y]) => [x + ROAD_DX, y] as Pt);
const roadLen: number[] = [0];
for (let i = 1; i < road.length; i++) roadLen.push(roadLen[i - 1] + Math.hypot(road[i][0] - road[i - 1][0], road[i][1] - road[i - 1][1]));
const roadTotal = roadLen[roadLen.length - 1];
const roadAt = (p: number): Pt => {
  const d = Math.min(1, Math.max(0, p)) * roadTotal;
  let lo = 0;
  let hi = road.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (roadLen[mid] < d) lo = mid;
    else hi = mid;
  }
  const k = (d - roadLen[lo]) / Math.max(0.001, roadLen[hi] - roadLen[lo]);
  return [road[lo][0] + (road[hi][0] - road[lo][0]) * k, road[lo][1] + (road[hi][1] - road[lo][1]) * k];
};

// small seeded random so the picture is the same every time
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// little waves in the sea
const waves = Array.from({ length: 150 }, (_, i) => {
  const y = 20 + rnd(i, 1) * (H - 40);
  const x = 8 + rnd(i, 2) * Math.max(10, coastX(y) - 40);
  const w = 8 + rnd(i, 3) * 14;
  return { d: `M${x.toFixed(1)} ${y.toFixed(1)} q${(w / 4).toFixed(1)} -3 ${(w / 2).toFixed(1)} 0 t${(w / 2).toFixed(1)} 0`, delay: (rnd(i, 4) * 6).toFixed(2) };
});
// stars that come out over the sea at the end
const stars = Array.from({ length: 46 }, (_, i) => {
  const y = 1700 + rnd(i, 7) * 880;
  return { x: r1(6 + rnd(i, 8) * Math.max(10, coastX(y) - 20)), y: r1(y), r: r1(0.7 + rnd(i, 9) * 1.1), delay: (rnd(i, 10) * 4).toFixed(2) };
});

const crenels = (x1: number, x2: number, y: number, w = 6, h = 6) => {
  let d = `M${x1} ${y + h}`;
  for (let x = x1; x < x2; x += w * 2) d += ` V${y} H${Math.min(x + w, x2)} V${y + h} H${Math.min(x + w * 2, x2)}`;
  return d;
};

const cypress = (x0: number, y0: number, s = 1) => {
  const x = r1(x0);
  const y = r1(y0);
  const a = r1(6 * s);
  const b = r1(7 * s);
  const c = r1(10 * s);
  const d = r1(30 * s);
  const e = r1(40 * s);
  return `M${x} ${y} v${-a} M${x} ${r1(y - a)} c${-b} ${-c} ${-b} ${-d} 0 ${-e} c${b} ${c} ${b} ${d} 0 ${e}`;
};
const house = (x0: number, y0: number, w0 = 16) => {
  const x = r1(x0);
  const y = r1(y0);
  const w = r1(w0);
  return `M${x} ${y} v-12 h${w} v12 M${r1(x - 2)} ${r1(y - 12)} l${r1(w / 2 + 2)} -8 l${r1(w / 2 + 2)} 8 M${r1(x + w / 2 - 2)} ${y} v-6 h4 v6`;
};

const scatter = [560, 720, 880, 1010, 1180, 1330, 1470, 1620, 1780, 1930, 2080, 2230].map((y, i) => {
  const cx = coastX(y);
  return { cyp: cypress(cx + 96 + rnd(i, 11) * 40, y + 8, 1 + rnd(i, 12) * 0.5), hs: house(cx + 68 + rnd(i, 13) * 20, y + 40, 14 + rnd(i, 14) * 8), cyp2: cypress(cx + 150 + rnd(i, 15) * 30, y - 26, 0.8) };
});

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// time of day over the whole road: early light → warm noon → sunset → night
const TINTS: [number, number[]][] = [
  [0, [255, 176, 110, 0.2]],
  [0.35, [255, 232, 190, 0.05]],
  [0.7, [255, 120, 84, 0.2]],
  [1, [6, 10, 38, 0.5]],
];
const tintAt = (p: number) => {
  for (let i = 1; i < TINTS.length; i++) {
    if (p <= TINTS[i][0]) {
      const [p0, c0] = TINTS[i - 1];
      const [p1, c1] = TINTS[i];
      const t = (p - p0) / (p1 - p0);
      return `rgba(${c0.map((v, k) => lerp(v, c1[k], t)).map((v, k) => (k < 3 ? Math.round(v) : v.toFixed(3))).join(",")})`;
    }
  }
  return "rgba(6,10,38,.5)";
};

export function Road() {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const dot = useRef<SVGGElement>(null);
  const tint = useRef<HTMLDivElement>(null);
  const starsG = useRef<SVGGElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const s = stage.current;
    const g = svg.current;
    if (!w || !s || !g) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = w.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, r.height - vh);
      const p = reduce ? 1 : clamp(-r.top / total);
      const W = s.clientWidth;
      const sc = W / 400;
      const [x, y] = roadAt(p);
      const maxShift = Math.max(0, H * sc - vh);
      const shift = clamp(y * sc - vh * 0.5, 0, maxShift);
      g.style.transform = `translate3d(0,${(-shift).toFixed(1)}px,0)`;
      dot.current?.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      g.style.setProperty("--rp", String(1 - p));
      tint.current?.style.setProperty("background", tintAt(p));
      starsG.current?.style.setProperty("opacity", String(clamp((p - 0.62) / 0.3)));
      if (title.current) {
        const o = clamp(1 - p / 0.1);
        title.current.style.opacity = String(o);
        title.current.style.transform = `translateY(${(-(1 - o) * 40).toFixed(1)}px)`;
      }
      if (end.current) end.current.style.opacity = String(clamp((p - 0.9) / 0.08));
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

  return (
    <section className="road" ref={wrap} aria-label="Invitation">
      <div className="roadStage" ref={stage}>
        <svg className="roadSvg" ref={svg} viewBox={`0 0 400 ${H}`} aria-hidden="true">
          <defs>
            <linearGradient id="rdSea" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#081a2b" />
              <stop offset="0.55" stopColor="#0d2f46" />
              <stop offset="1" stopColor="#14425c" />
            </linearGradient>
            <linearGradient id="rdLand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#223d55" />
              <stop offset="1" stopColor="#162d44" />
            </linearGradient>
            <radialGradient id="rdGlow">
              <stop offset="0" stopColor="#fff3c9" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#f2c868" stopOpacity="0.5" />
              <stop offset="1" stopColor="#f2c868" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rdFadeB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0a1c2d" stopOpacity="0" />
              <stop offset="1" stopColor="#0a1c2d" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="rdBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.85" />
              <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="400" height={H} fill="url(#rdSea)" />
          <path d={`${toPath(coast)} L400 ${H} L400 0 Z`} fill="url(#rdLand)" />

          {/* sea: small waves that shimmer */}
          <g className="rdWaves">
            {waves.map((wv, i) => (
              <path key={i} d={wv.d} style={{ animationDelay: `${wv.delay}s` }} />
            ))}
          </g>
          {/* land: faint contour lines */}
          {[70, 130, 200].map((dx, i) => (
            <path key={dx} className="rdContour" d={toPath(coast, dx)} style={{ opacity: 0.16 - i * 0.04 }} />
          ))}
          {/* shoreline with moving foam */}
          <path className="rdShore" d={toPath(coast)} />
          <path className="rdFoam" d={toPath(coast, -5)} />

          {/* in between: cypress trees, small stone houses */}
          <g className="rdLine soft">
            {scatter.map((o, i) => (
              <g key={i}>
                <path d={o.cyp} />
                <path d={o.hs} />
                <path d={o.cyp2} />
              </g>
            ))}
          </g>

          {/* ─────── the first landmarks: two small islands ─────── */}
          <g className="rdLine">
            {/* small islands with palm trees, out in the sea */}
            <path d="M86 180 C94 160 146 160 154 180 Z" />
            <path d="M118 170 C116 156 118 148 122 140 M122 140 c-8 -4 -14 -2 -18 4 M122 140 c8 -5 14 -3 18 3 M122 140 c-2 -8 4 -12 10 -12 M122 140 c0 -8 -6 -12 -12 -11" />
            <path d="M44 252 C50 238 84 238 92 252 Z" />
            <path d="M66 244 C65 236 66 230 69 224 M69 224 c-6 -3 -10 -1 -13 3 M69 224 c6 -3 10 -2 13 2" />
          </g>

          {/* little boats in the middle of the sea */}
          <g className="rdLine soft">
            {[[70, 1000], [120, 1500], [60, 1740]].map(([x, y], i) => (
              <g key={i} className="rdBoat" style={{ animationDelay: `${i * 1.4}s` }}>
                <path d={`M${x} ${y} q12 8 28 0 z M${x + 14} ${y} V${y - 22} l12 18 z`} />
              </g>
            ))}
          </g>

          {/* ─────── the last landmarks: the Raouche rocks, a lighthouse, city lights ─────── */}
          <g className="rdLine">
            <g transform="translate(-20 0)">
              {/* the great rock with its arch */}
              <path d="M60 2556 C58 2522 64 2494 62 2466 L68 2442 L66 2424 L82 2416 L90 2402 L106 2409 L118 2398 L132 2407 L146 2412 L152 2432 L150 2454 C154 2482 160 2522 166 2556" />
              <path d="M86 2556 V2514 C86 2488 100 2474 114 2474 C128 2474 140 2488 140 2514 V2556" />
              <path d="M74 2470 l10 6 M72 2498 l8 -6 M148 2476 l-8 6 M152 2512 l-9 -4 M96 2432 l10 -4 M122 2428 l12 4" className="soft" />
              <path d="M70 2446 q14 -4 24 2 M128 2440 q12 -3 22 3" className="soft" />
              {/* the smaller rock */}
              <path d="M184 2556 C186 2528 190 2500 198 2486 L206 2480 L214 2470 L224 2476 L230 2492 C238 2512 240 2536 242 2556" />
              <path d="M196 2512 l8 -4 M222 2516 l-8 -3 M206 2494 l9 -3" className="soft" />
            </g>
            <path d="M12 2558 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" className="rdSurf" />
            {/* lighthouse */}
            <path d="M264 2540 L270 2404 H290 L296 2540" />
            <path d="M268 2450 H292 M266 2494 H294" className="gold" />
            <path d="M268 2404 V2390 H292 V2404 M264 2390 H296 M266 2390 Q280 2368 294 2390" />
            <path d="M262 2540 H298" />
            {/* city: towers with lights */}
            <path d="M306 2540 V2440 H326 V2540 M330 2540 V2400 H352 V2540 M356 2540 V2456 H384 V2540" />
            <path d="M338 2400 V2386 M340 2386 H336" />
          </g>
          <g className="rdCity">
            {[[312, 2452], [318, 2452], [312, 2470], [318, 2470], [312, 2488], [318, 2488], [336, 2414], [344, 2414], [336, 2432], [344, 2432], [336, 2450], [344, 2450], [336, 2468], [344, 2468], [362, 2470], [372, 2470], [362, 2488], [372, 2488]].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="4" height="6" style={{ animationDelay: `${(rnd(i, 21) * 5).toFixed(2)}s` }} />
            ))}
          </g>
          <g transform="translate(280 2397)">
            <g className="rdBeam">
              <path d="M0 0 L-170 -26 L-170 26 Z" fill="url(#rdBeam)" />
            </g>
          </g>

          {/* ─────── gulls ─────── */}
          <g className="rdLine soft">
            <path className="rdGull g1" d="M0 0 q5 -6 10 0 q5 -6 10 0" />
            <path className="rdGull g2" d="M0 0 q4 -5 8 0 q4 -5 8 0" />
          </g>

          {/* pigeons around the rocks */}
          <g className="rdLine soft">
            <path className="rdPig p1" d="M0 0 q3 -4 6 0 q3 -4 6 0" />
            <path className="rdPig p2" d="M0 0 q3 -4 6 0 q3 -4 6 0" />
            <path className="rdPig p3" d="M0 0 q3 -4 6 0 q3 -4 6 0" />
          </g>

          {/* the two names on the map */}
          <g className="rdLabels">
            <text x="196" y="270" textAnchor="middle">TRIPOLI</text>
            <path d="M160 279 H232" />
            <text x="86" y="2318" textAnchor="middle">BEIRUT</text>
            <path d="M58 2327 H114" />
          </g>

          <g className="rdStars" ref={starsG}>
            {stars.map((st, i) => (
              <circle key={i} cx={st.x} cy={st.y} r={st.r} style={{ animationDelay: `${st.delay}s` }} />
            ))}
          </g>

          {/* the road: faint ahead, bright behind the glowing dot */}
          <path className="rdRoadAhead" d={toPath(road)} />
          <path className="rdRoadGlow" d={toPath(road)} pathLength={1} />
          <path className="rdRoadTrail" d={toPath(road)} pathLength={1} />
          <g ref={dot} transform={`translate(${r1(road[0][0])} ${r1(road[0][1])})`}>
            <circle r="30" fill="url(#rdGlow)" className="rdPulse" />
            <circle r="5.2" fill="#fff6d8" />
            <circle r="9" fill="none" stroke="#f2c868" strokeWidth="1.2" className="rdRipple" />
          </g>
          <rect x="0" y={H - 110} width="400" height="110" fill="url(#rdFadeB)" />
        </svg>

        <div className="roadTint" ref={tint} aria-hidden="true" />

        <div className="roadTitle" ref={title}>
          <div className="rtTop">{site.introTop}</div>
          <h1 className="rtNames">
            <span>{site.names.first}</span>
            <i>&amp;</i>
            <span>{site.names.second}</span>
          </h1>
          <div className="ar rtAr">
            {site.namesAr.first} و {site.namesAr.second}
          </div>
          <div className="rtCue">
            <span>{site.text.roadHint}</span>
            <b />
          </div>
        </div>

        <div className="roadEnd" ref={end} aria-hidden="true">
          {site.text.roadEnd}
        </div>
      </div>
    </section>
  );
}
