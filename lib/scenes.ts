// Hand-drawn red line scenes. Each scene is a list of strokes that get drawn one after another.
// Canvas is 400 x 500.

import { rng } from "./brush";

export type SceneName = "hello" | "trip" | "yes" | "arch" | "cedar";

export type Item = {
  d: string;
  /** 0 = line only, 1 = soft red tint fills in after drawing, 2 = paper colour (hides what is behind) */
  f?: 0 | 1 | 2;
  /** stroke width (default 2.2) */
  w?: number;
  /** size of the stroke: how long it takes to draw */
  s?: "xs" | "sm" | "md" | "lg";
  tr?: string;
  /** "acc" = print this one in the second ink (stamp red) */
  c?: "acc";
};

const n1 = (n: number) => n.toFixed(1);

/** A rough hand-drawn arched window around the card (outer frame + inner line). */
const FRAME =
  "M36 480 Q22 480 22 464 V204 Q22 30 200 22 Q378 30 378 204 V464 Q378 480 364 480 Z";
const FRAME_IN = "M46 468 V206 Q46 46 200 38 Q354 46 354 206 V468 Z";
const frame: Item = { d: FRAME, w: 2.6, s: "lg" };
const frameIn: Item = { d: FRAME_IN, w: 1.6, s: "lg" };

/** Loose petal loop. */
function petal(r: () => number, cx: number, cy: number, ang: number, len: number, wid: number): string {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const p = (x: number, y: number): [number, number] => [cx + x * ca - y * sa, cy + x * sa + y * ca];
  const j = () => (r() - 0.5) * 1.4;
  const a = p(len * 0.35, -wid + j());
  const b = p(len * 1.02, -wid * 0.45 + j());
  const tip = p(len * 1.08, j() * 0.5);
  const c = p(len * 1.02, wid * 0.45 + j());
  const d = p(len * 0.35, wid + j());
  return `M ${n1(cx)} ${n1(cy)} C ${n1(a[0])} ${n1(a[1])} ${n1(b[0])} ${n1(b[1])} ${n1(tip[0])} ${n1(tip[1])} C ${n1(c[0])} ${n1(c[1])} ${n1(d[0])} ${n1(d[1])} ${n1(cx)} ${n1(cy)}`;
}

function swirl(r: () => number, cx: number, cy: number, rad: number): string {
  let d = "";
  const off = r() * 6;
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    const a = off + t * 2.2 * Math.PI * 2;
    d += `${i === 0 ? "M" : "L"} ${n1(cx + Math.cos(a) * rad * t)} ${n1(cy + Math.sin(a) * rad * t)} `;
  }
  return d;
}

/** "jasmine" = narrow pointed star, "blossom" = rounder orange blossom. */
function flower(seed: number, cx: number, cy: number, big: number, n = 5, kind: "jasmine" | "blossom" = "jasmine"): Item[] {
  const r = rng(seed);
  const rot = r() * Math.PI;
  const out: Item[] = [];
  const wid = kind === "jasmine" ? 0.2 : 0.42;
  const len = kind === "jasmine" ? big * 1.15 : big;
  for (let k = 0; k < n; k++) out.push({ d: petal(r, cx, cy, rot + (k / n) * Math.PI * 2, len, len * wid), f: 1, s: "xs", w: 2, c: "acc" });
  out.push({ d: swirl(r, cx, cy, big * 0.34), s: "xs", w: 1.6, c: "acc" });
  return out;
}

function leaf(x: number, y: number, ang: number, len: number, wid = 6): Item {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const q = (px: number, py: number): [number, number] => [x + px * ca - py * sa, y + px * sa + py * ca];
  const a = q(len * 0.3, -wid);
  const b = q(len * 0.85, -wid * 0.6);
  const t = q(len, 0);
  const c = q(len * 0.85, wid * 0.6);
  const d = q(len * 0.3, wid);
  return {
    d: `M ${n1(x)} ${n1(y)} C ${n1(a[0])} ${n1(a[1])} ${n1(b[0])} ${n1(b[1])} ${n1(t[0])} ${n1(t[1])} C ${n1(c[0])} ${n1(c[1])} ${n1(d[0])} ${n1(d[1])} ${n1(x)} ${n1(y)}`,
    f: 1,
    s: "xs",
    w: 1.8,
  };
}

/** A small plant with a flower, growing up from (x, y). */
function sprig(seed: number, x: number, y: number, h: number, lean: number): Item[] {
  const tx = x + lean;
  const ty = y - h;
  return [
    { d: `M ${x} ${y} Q ${x + lean * 0.2} ${y - h * 0.5} ${tx} ${ty + 8}`, s: "sm", w: 2 },
    leaf(x + lean * 0.15, y - h * 0.32, -2.5, 24),
    leaf(x + lean * 0.3, y - h * 0.52, -0.6, 24),
    ...flower(seed, tx, ty, 15),
  ];
}

function sparkle(x: number, y: number, s: number): Item {
  return {
    d: `M ${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`,
    f: 1,
    s: "xs",
    w: 1.8,
  };
}

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

// ───────── 1. coffee on a small table ─────────
function hello(): Item[] {
  const items: Item[] = [frame, frameIn];

  // string of lights
  const P0: [number, number] = [84, 114];
  const P1: [number, number] = [200, 196];
  const P2: [number, number] = [316, 114];
  items.push({ d: `M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`, s: "lg", w: 2 });
  [0.16, 0.33, 0.5, 0.67, 0.84].forEach((t) => {
    const x = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
    const y = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
    items.push({ d: `M ${n1(x - 5)} ${n1(y + 3)} Q ${n1(x - 8)} ${n1(y + 20)} ${n1(x)} ${n1(y + 24)} Q ${n1(x + 8)} ${n1(y + 20)} ${n1(x + 5)} ${n1(y + 3)} Z`, f: 1, s: "xs", w: 1.8, c: "acc" });
  });

  // table
  items.push({ d: ellipse(200, 342, 136, 26), f: 2, s: "lg" });
  items.push({ d: "M190 366 Q192 404 187 446", s: "sm" });
  items.push({ d: "M210 366 Q208 404 213 446", s: "sm" });
  items.push({ d: "M148 458 Q200 434 252 458 Q200 472 148 458 Z", s: "sm" });

  // the coffee pot (rakwe) in the middle
  items.push({ d: "M219 292 L252 268", s: "sm", w: 2.4 });
  items.push({ d: "M182 322 Q178 304 190 272 L210 272 Q222 304 218 322 Q200 330 182 322 Z", f: 2, s: "md" });
  items.push({ d: "M188 272 Q200 264 212 272", s: "xs", w: 1.8 });
  items.push({ d: "M190 273 L180 262", s: "xs", w: 2 });
  items.push({ d: "M184 246 Q176 234 186 224 Q194 214 184 204", s: "sm", w: 1.8 });

  // two small coffee cups (finjan), the right one mirrored
  const cup = (tr?: string): Item[] => [
    { d: "M100 280 Q122 288 144 280 L139 312 Q122 324 105 312 Z", f: 2, s: "md", tr },
    { d: "M100 280 Q122 272 144 280", s: "xs", w: 1.8, tr },
    { d: "M88 322 Q122 344 156 322", s: "sm", tr },
    { d: "M110 256 Q102 244 112 232 Q120 220 110 208", s: "sm", w: 1.8, tr },
    { d: "M132 260 Q124 248 134 236 Q142 224 132 212", s: "sm", w: 1.8, tr },
  ];
  items.push(...cup());
  items.push(...cup("translate(400 6) scale(-1 1)"));

  items.push(sparkle(74, 222, 13), sparkle(330, 240, 11), sparkle(80, 396, 9), sparkle(322, 408, 11));
  items.push(...sprig(21, 76, 466, 54, 6), ...sprig(23, 326, 466, 60, -6));
  return items;
}

// ───────── 2. a little car on a trip ─────────
function trip(): Item[] {
  const items: Item[] = [frame, frameIn];
  const rays: Item[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rays.push({ d: `M ${n1(282 + Math.cos(a) * 38)} ${n1(146 + Math.sin(a) * 38)} L ${n1(282 + Math.cos(a) * 49)} ${n1(146 + Math.sin(a) * 49)}`, s: "xs", w: 2 });
  }
  items.push({ d: ellipse(282, 146, 26, 26), f: 1, s: "md", c: "acc" }, ...rays);
  items.push({ d: "M110 124 q10 -10 20 0 q10 -10 20 0", s: "xs", w: 1.8 }, { d: "M160 152 q8 -8 16 0 q8 -8 16 0", s: "xs", w: 1.8 });

  // mountains
  items.push({ d: "M50 312 L118 190 L170 262 L224 204 L350 312", f: 1, s: "lg" });
  items.push({ d: "M100 220 L118 190 L136 222 L122 214 L110 224 Z", s: "xs", w: 1.8 });
  items.push({ d: "M50 340 Q130 306 214 338 Q290 364 350 330", s: "lg" });

  // road
  items.push({ d: "M46 404 Q200 376 354 402", s: "lg" });
  items.push({ d: "M46 450 Q200 424 354 448", s: "lg" });
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 56;
    items.push({ d: `M ${x} ${n1(428 - Math.sin(i / 2.2) * 4)} h 22`, s: "xs", w: 2 });
  }

  // car
  const tr = "translate(66 22)";
  items.push({ d: "M150 268 H198 Q205 268 205 275 V292 H143 V275 Q143 268 150 268 Z", f: 1, s: "sm", tr });
  items.push({ d: "M163 268 V258 H186 V268", s: "xs", tr });
  items.push({
    d: "M70 360 L70 338 Q70 326 84 324 L122 320 L142 298 Q148 292 156 292 L200 292 Q210 292 216 300 L232 320 L262 324 Q276 326 276 340 L276 360 Z",
    f: 2,
    s: "lg",
    tr,
  });
  items.push({ d: "M150 300 L138 320 L172 320 L172 300 Z", f: 1, s: "xs", tr });
  items.push({ d: "M182 300 L182 320 L226 320 L212 300 Z", f: 1, s: "xs", tr });
  items.push({ d: "M70 348 H84", s: "xs", w: 2, tr }, { d: "M270 336 h6", s: "xs", w: 2.6, tr });
  items.push({ d: ellipse(112, 362, 20, 20), f: 2, s: "sm", tr }, { d: ellipse(112, 362, 8, 8), s: "xs", w: 1.8, tr });
  items.push({ d: ellipse(236, 362, 20, 20), f: 2, s: "sm", tr }, { d: ellipse(236, 362, 8, 8), s: "xs", w: 1.8, tr });
  items.push({ d: "M62 340 H52", s: "xs", w: 2 }, { d: "M60 358 H48", s: "xs", w: 2 });

  items.push(sparkle(84, 252, 8), sparkle(330, 232, 10));
  items.push(...sprig(31, 82, 470, 36, 4), ...sprig(33, 320, 472, 40, -5));
  return items;
}

// ───────── 3. the ring and a bottle of rose water ─────────
function yes(): Item[] {
  const items: Item[] = [frame, frameIn];
  // open lid
  items.push({ d: "M122 326 L110 238 Q108 226 120 224 L292 224 Q304 226 302 238 L290 326", f: 1, s: "md" });
  items.push({ d: "M132 304 L124 244 H288 L280 304", s: "sm", w: 1.6 });
  // ring (band) and stone
  items.push({ d: ellipse(206, 298, 34, 34), s: "md" });
  items.push({ d: ellipse(206, 298, 26, 26), s: "sm", w: 1.8 });
  items.push({ d: "M188 254 L196 237 L216 237 L224 254 L206 278 Z", f: 1, s: "sm" });
  items.push({ d: "M188 254 H224", s: "xs", w: 1.6 }, { d: "M196 237 L206 254 L216 237", s: "xs", w: 1.6 }, { d: "M202 254 L206 278 L210 254", s: "xs", w: 1.6 });
  // front of the box (hides the lower part of the ring)
  items.push({ d: "M118 326 H298 Q308 326 308 336 V408 Q308 420 296 420 H120 Q108 420 108 408 V336 Q108 326 118 326 Z", f: 2, s: "lg" });
  items.push({ d: "M118 336 Q208 358 298 336", s: "md", w: 1.8 });
  items.push({ d: "M108 384 H308", s: "md", w: 1.6 });

  // shine
  items.push({ d: "M206 216 V194", s: "xs", w: 2 }, { d: "M176 222 L162 206", s: "xs", w: 2 }, { d: "M236 222 L250 206", s: "xs", w: 2 });
  items.push(sparkle(132, 168, 15), sparkle(286, 154, 19), sparkle(240, 112, 10), sparkle(172, 120, 9), sparkle(334, 262, 9));

  // rose-water bottle (mazaher) on the left
  items.push({ d: "M56 468 Q52 440 63 420 L63 398 Q59 392 63 386 L64 368 L68 344 L72 368 L73 386 Q77 392 73 398 L73 420 Q84 440 80 468 Z", f: 1, s: "md", c: "acc" });
  items.push({ d: "M58 448 Q68 454 78 448", s: "xs", w: 1.6 });
  items.push(...sprig(43, 340, 466, 56, -6));
  return items;
}

// ───────── hero: a Lebanese triple-arch window under a red-tile roof ─────────
function arch(): Item[] {
  const items: Item[] = [];

  // red-tile roof
  items.push({ d: "M40 196 L200 84 L360 196 Z", f: 1, s: "lg", w: 2.4, c: "acc" });
  for (let y = 120; y <= 180; y += 20) {
    const half = (y - 84) * (160 / 112) - 8;
    const x0 = 200 - half;
    const count = Math.max(1, Math.floor((half * 2) / 22));
    const w = (half * 2) / count;
    let d = `M ${n1(x0)} ${y}`;
    for (let k = 0; k < count; k++) d += ` q ${n1(w / 2)} 12 ${n1(w)} 0`;
    items.push({ d, s: "sm", w: 1.6, c: "acc" });
  }

  // the wall and the ground
  items.push({ d: "M56 196 V450", s: "md" }, { d: "M344 196 V450", s: "md" });
  items.push({ d: "M40 450 H360", s: "md" });

  // three arches: the middle one is taller (outer line + inner line each)
  const arches = [
    "M78 450 V305 Q78 252 110 252 Q142 252 142 305 V450",
    "M158 450 V285 Q158 222 200 222 Q242 222 242 285 V450",
    "M258 450 V305 Q258 252 290 252 Q322 252 322 305 V450",
  ];
  const inner = [
    "M86 450 V306 Q86 262 110 262 Q134 262 134 306 V450",
    "M166 450 V286 Q166 232 200 232 Q234 232 234 286 V450",
    "M266 450 V306 Q266 262 290 262 Q314 262 314 306 V450",
  ];
  arches.forEach((d, i) => {
    items.push({ d, s: "lg", w: 2.2 });
    items.push({ d: inner[i], s: "md", w: 1.5 });
  });
  // small capitals where the arches start
  [[78, 305], [142, 305], [158, 285], [242, 285], [258, 305], [322, 305]].forEach(([x, y]) => {
    items.push({ d: `M ${x - 4} ${y} h 8`, s: "xs", w: 2 });
  });

  // a heart hanging in the middle arch
  items.push({ d: "M200 232 V344", s: "sm", w: 1.8 });
  items.push({ d: "M200 384 Q168 360 178 344 Q190 332 200 350 Q210 332 222 344 Q232 360 200 384 Z", f: 1, s: "md", c: "acc" });

  // jasmine along the top of the wall and down the sides
  const spots: [number, number][] = [];
  for (let x = 78; x <= 322; x += 41) spots.push([x, 200]);
  for (let y = 244; y <= 420; y += 44) spots.push([56, y], [344, y]);
  spots.forEach(([x, y], i) => {
    const out = x < 200 ? -1 : 1;
    items.push(leaf(x, y + 2, out < 0 ? 2.6 + (i % 3) * 0.3 : 0.5 - (i % 3) * 0.3, 20, 5));
    items.push(...flower(60 + i, x, y, i % 3 === 0 ? 15 : 12, 5, i % 4 === 1 ? "blossom" : "jasmine"));
  });

  items.push(sparkle(52, 150, 11), sparkle(350, 140, 13), sparkle(366, 330, 8), sparkle(34, 300, 8));
  items.push(...sprig(51, 82, 450, 40, 4), ...sprig(53, 318, 450, 44, -4));
  return items;
}

// ───────── footer: a cedar tree with the mountains ─────────
function cedar(): Item[] {
  const items: Item[] = [];
  items.push({ d: ellipse(318, 196, 22, 22), f: 1, s: "md" });
  // mountains at the two sides, so the tree stands in front of the valley
  items.push({ d: "M20 430 L50 338 L92 392 L134 402 L182 412", s: "lg" }, { d: "M218 412 L262 398 L316 386 L352 332 L382 376", s: "lg" });
  items.push({ d: "M40 366 L50 338 L62 362 L52 356 Z", s: "xs", w: 1.6 }, { d: "M340 352 L352 332 L364 354 L352 348 Z", s: "xs", w: 1.6 });
  items.push({ d: "M20 452 H380", s: "md" });
  // trunk
  items.push({ d: "M186 452 Q192 404 190 352", s: "sm", w: 2.4 }, { d: "M214 452 Q208 404 210 352", s: "sm", w: 2.4 });
  // flat layers of branches, top first
  const tier = (cx: number, y: number, w: number, h: number): Item => ({
    d: `M ${cx - w} ${y} Q ${cx - w * 0.7} ${y - h} ${cx - w * 0.3} ${y - h * 0.7} Q ${cx} ${y - h * 1.3} ${cx + w * 0.3} ${y - h * 0.7} Q ${cx + w * 0.7} ${y - h} ${cx + w} ${y} Q ${cx} ${y + h * 0.5} ${cx - w} ${y} Z`,
    f: 2,
    s: "md",
    w: 2.2,
  });
  // each layer hides the mountains behind it, then gets a soft tint on top
  [tier(200, 178, 30, 16), tier(198, 206, 54, 18), tier(204, 238, 76, 20), tier(194, 272, 96, 22), tier(204, 312, 114, 24), tier(196, 352, 130, 26)].forEach((t) => {
    items.push(t, { d: t.d, f: 1, s: "xs", w: 2.2 });
  });
  items.push({ d: "M70 140 q10 -10 20 0 q10 -10 20 0", s: "xs", w: 1.8 }, { d: "M110 168 q8 -8 16 0 q8 -8 16 0", s: "xs", w: 1.8 });
  items.push(sparkle(48, 250, 10), sparkle(350, 250, 12), sparkle(330, 130, 8));
  items.push(...sprig(71, 60, 452, 34, 3), ...sprig(73, 340, 452, 38, -3));
  return items;
}

/** Scenes without a frame are cropped tighter so they fill the space. */
export const viewBoxes: Partial<Record<SceneName, string>> = { arch: "30 60 340 425", cedar: "10 120 380 345" };

export const scenes: Record<SceneName, Item[]> = {
  hello: hello(),
  trip: trip(),
  yes: yes(),
  arch: arch(),
  cedar: cedar(),
};
