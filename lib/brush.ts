// Tiny helpers that draw hand-painted looking marks (dashes and blobs).

/** Small seeded random generator, so every render looks the same. */
export function rng(seed: number) {
  let s = (Math.imul(seed + 1, 2654435761) >>> 0) || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

/**
 * A closed, slightly uneven brush shape around (0,0).
 * rx / ry = half length / half thickness, wobble = how uneven, taper = how pointed one end is.
 */
export function blob(r: () => number, rx: number, ry: number, wobble = 0.2, taper = 0.45, n = 9): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const j = 1 + (r() - 0.5) * 2 * wobble;
    const tp = 1 - taper * ((Math.cos(t) + 1) / 2);
    pts.push([Math.cos(t) * rx * j, Math.sin(t) * ry * j * tp]);
  }
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + " Z";
}
