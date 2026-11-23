"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rng } from "@/lib/brush";

type Seg = { x: number; y: number; a: number; side: 1 | -1; flower: boolean; petals: string[]; core: string };

const BRUSH = 54; // how close the finger has to be to grow a piece of vine (px)
const L = 46; // length of one piece of vine

/** A narrow pointed jasmine petal, pointing along +x from (cx, cy). */
function petal(ang: number, cx: number, cy: number, len: number): string {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const p = (x: number, y: number) => `${(cx + x * ca - y * sa).toFixed(1)} ${(cy + x * sa + y * ca).toFixed(1)}`;
  const w = len * 0.24;
  return `M ${p(0, 0)} C ${p(len * 0.35, -w)} ${p(len * 0.95, -w * 0.5)} ${p(len * 1.1, 0)} C ${p(len * 0.95, w * 0.5)} ${p(len * 0.35, w)} ${p(0, 0)}`;
}

const STEM = "M 0 0 C 8 -9 15 -9 23 0 S 38 9 46 0";
const LEAF_UP = "M 12 -5 C 12 -14 20 -22 30 -22 C 30 -13 22 -6 12 -5 Z";
const LEAF_DN = "M 12 5 C 12 14 20 22 30 22 C 30 13 22 6 12 5 Z";

/** Pieces of vine all round the edge: along the top, then down the left and right sides. */
function build(w: number, h: number): Seg[] {
  const out: Seg[] = [];
  const m = 24; // distance from the edge to the vine
  let k = 1;

  const make = (x: number, y: number, a: number, side: 1 | -1, flower: boolean): Seg => {
    const r = rng(k++);
    const rot = r() * 6;
    const petals: string[] = [];
    for (let i = 0; i < 5; i++) petals.push(petal(rot + (i / 5) * Math.PI * 2, 25, side * -17, 10));
    // a small swirl in the middle of the flower
    let core = "";
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      const an = rot + t * 2 * Math.PI * 2;
      core += `${i === 0 ? "M" : "L"} ${(25 + Math.cos(an) * 3.4 * t).toFixed(1)} ${(side * -17 + Math.sin(an) * 3.4 * t).toFixed(1)} `;
    }
    return { x, y, a, side, flower, petals: flower ? petals : [], core: flower ? core : "" };
  };

  // top: left to right (flowers hang down into the screen)
  const nx = Math.max(5, Math.round((w - 2 * m) / L));
  const sx = (w - 2 * m) / nx;
  for (let i = 0; i < nx; i++) out.push(make(m + i * sx, m, 0, -1, i % 3 === 1));
  // left and right: top to bottom
  const ny = Math.max(6, Math.round((h - 2 * m) / L));
  const sy = (h - 2 * m) / ny;
  for (let i = 0; i < ny; i++) {
    out.push(make(m, m + i * sy, 90, 1, i % 3 === 1));
    out.push(make(w - m, m + i * sy, 90, -1, i % 3 === 2));
  }
  return out;
}

/**
 * A vine with jasmine that grows around the edge of the screen, where the finger goes.
 * If nobody touches, it grows by itself.
 */
export function VineFrame({
  onStart,
  onDone,
  hintDelay = 0,
}: {
  onStart: () => void;
  onDone: () => void;
  hintDelay?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [dashes, setDashes] = useState<Seg[]>([]);
  const [finished, setFinished] = useState(false);
  const nodes = useRef<(SVGGElement | null)[]>([]);
  const painted = useRef<Set<number>>(new Set());
  const state = useRef({ started: false, done: false, idle: 0 as unknown as ReturnType<typeof setTimeout> });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const last = { w: el.clientWidth, h: el.clientHeight };
    const measure = () => {
      last.w = el.clientWidth;
      last.h = el.clientHeight;
      setDashes(build(last.w, last.h));
    };
    measure();
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      // phone browsers fire "resize" when the address bar hides; ignore tiny changes
      if (Math.abs(el.clientWidth - last.w) < 4 && Math.abs(el.clientHeight - last.h) < 4) return;
      clearTimeout(t);
      t = setTimeout(() => {
        painted.current.clear();
        nodes.current.forEach((n) => n?.classList.remove("on"));
        measure();
        // everything is painted again right away after a resize
        setTimeout(() => finish(true), 50);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paint = (i: number, delay = 0) => {
    if (painted.current.has(i)) return;
    painted.current.add(i);
    const g = nodes.current[i];
    if (g) {
      g.style.setProperty("--dl", `${delay}ms`);
      g.classList.add("on");
    }
  };

  const finish = useCallback(
    (instant = false) => {
      const s = state.current;
      if (s.done && !instant) return;
      s.done = true;
      clearTimeout(s.idle);
      const total = nodes.current.length;
      let k = 0;
      for (let i = 0; i < total; i++) {
        if (!painted.current.has(i)) paint(i, instant ? 0 : k++ * 16);
      }
      setFinished(true);
      setTimeout(onDone, instant ? 0 : k * 16 + 700);
    },
    [onDone]
  );

  // if nobody paints, paint for them
  const armIdle = useCallback(
    (ms: number) => {
      const s = state.current;
      clearTimeout(s.idle);
      s.idle = setTimeout(() => finish(), ms);
    },
    [finish]
  );

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => finish(true), 80);
      return () => clearTimeout(t);
    }
    armIdle(9000 + hintDelay);
    return () => clearTimeout(state.current.idle);
  }, [armIdle, finish, hintDelay]);

  const touch = (e: React.PointerEvent) => {
    const s = state.current;
    if (s.done) return;
    if (e.pointerType !== "mouse" && e.buttons === 0 && e.type === "pointermove") return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    let any = false;
    dashes.forEach((d, i) => {
      if (painted.current.has(i)) return;
      const mx = d.a === 0 ? d.x + L / 2 : d.x;
      const my = d.a === 0 ? d.y : d.y + L / 2;
      const dx = mx - x;
      const dy = my - y;
      if (dx * dx + dy * dy < BRUSH * BRUSH) {
        paint(i);
        any = true;
      }
    });
    if (any) {
      if (!s.started) {
        s.started = true;
        onStart();
      }
      if (painted.current.size >= dashes.length * 0.86) finish();
      else armIdle(5000);
    }
  };

  return (
    <div className={`paintFrame ${finished ? "finished" : ""}`} ref={box}>
      <svg className="frameSvg" width="100%" height="100%" aria-hidden="true">
        {dashes.map((d, i) => {
          const sc = (L / 46).toFixed(3);
          return (
            <g
              key={i}
              ref={(n) => {
                nodes.current[i] = n;
              }}
              className="vSeg"
              transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) rotate(${d.a}) scale(${sc})`}
            >
              <path className="vsGuide" d={STEM} />
              <path className="vs" pathLength={1} d={STEM} />
              <path className={`lf ${d.side === 1 ? "dn" : "up"}`} d={d.side === 1 ? LEAF_DN : LEAF_UP} />
              {d.flower && (
                <g className="fl">
                  <path className="vs stalk" pathLength={1} d={`M 25 0 Q ${25 + 2} ${d.side * -8} 25 ${d.side * -9}`} />
                  {d.petals.map((p, j) => (
                    <path key={j} className="fp" d={p} />
                  ))}
                  <path className="fc" d={d.core} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="frameCatch" onPointerDown={touch} onPointerMove={touch} />
    </div>
  );
}
