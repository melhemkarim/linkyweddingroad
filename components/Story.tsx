"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { blob, rng } from "@/lib/brush";
import { Vines } from "./Vines";
import { Scene } from "./Scene";

type Chapter = (typeof site.chapters)[number];

/** A short row of hand-painted dashes between chapters. */
function Dashes({ seed }: { seed: number }) {
  const items = Array.from({ length: 5 }).map((_, i) => {
    const r = rng(seed * 10 + i);
    return { d: blob(r, 9 + r() * 5, 3.2 + r() * 1.6, 0.2, 0.5), x: 14 + i * 26, y: 9 + (r() - 0.5) * 3, a: 90 + (r() - 0.5) * 24 };
  });
  return (
    <svg className="dashRow" viewBox="0 0 134 18" width="134" height="18" aria-hidden="true">
      {items.map((it, i) => (
        <path key={i} d={it.d} transform={`translate(${it.x} ${it.y}) rotate(${it.a})`} />
      ))}
    </svg>
  );
}

/** One memory. The photo is a red print; hold it and it shows in its real colours. */
function ChapterCard({ ch, index }: { ch: Chapter; index: number }) {
  const [warm, setWarm] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const right = index % 2 === 1;

  const press = () => {
    // a short wait so a scroll swipe does not flash the colour
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setWarm(true), 140);
  };
  const release = () => {
    if (timer.current) clearTimeout(timer.current);
    setWarm(false);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <article className={`chapter ${right ? "right" : "left"}`}>
      <Reveal threshold={0.35}>
        <div className="chLabel serifCaps">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <i />
          <span>{ch.label}</span>
        </div>
      </Reveal>

      <Reveal className="chPhotoReveal" threshold={0.25}>
        <div
          className={`chPhoto ${right ? "tiltR" : "tiltL"}`}
          onPointerDown={press}
          onPointerUp={release}
          onPointerCancel={release}
          onPointerLeave={release}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Scene name={ch.scene} label={ch.label} />
        </div>
      </Reveal>

      <Reveal delay={150} threshold={0.4}>
        <div className="chWhen serifCaps">{ch.when}</div>
        <p className="chText">{ch.text}</p>
      </Reveal>

      {index < site.chapters.length - 1 && (
        <Reveal threshold={0.6}>
          <div className="chDivider">
            <Dashes seed={index + 3} />
          </div>
        </Reveal>
      )}
    </article>
  );
}

export function Story() {
  return (
    <section className="story paper vined" aria-label={site.text.storyTitle}>
      <Vines seed={1} />
      <Reveal>
        <h2 className="eyebrow">{site.text.storyTitle}</h2>
        <div className="ar titleAr">{site.text.ar.story}</div>
      </Reveal>
      {site.chapters.map((ch, i) => (
        <ChapterCard key={ch.label} ch={ch} index={i} />
      ))}
    </section>
  );
}
