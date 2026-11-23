"use client";

import { useEffect, useState } from "react";
import { site } from "@/site.config";

/**
 * The very first thing: two wooden shutters, closed. Touch them (or the knob)
 * and they swing open to show the invitation behind.
 */
export function Shutters() {
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("closed");

  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  const open = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    setTimeout(() => setPhase("gone"), 2600);
  };

  if (phase === "gone") return null;
  const slats = Array.from({ length: 11 });
  return (
    <div className={`shutters ${phase}`} onClick={open} role="button" aria-label="Open the invitation" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open()}>
      <div className="shLight" aria-hidden="true" />
      <div className="shLeaf shL" aria-hidden="true">
        <div className="shFrame">
          {slats.map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <div className="shLeaf shR" aria-hidden="true">
        <div className="shFrame">
          {slats.map((_, i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <div className="shCenter" aria-hidden="true">
        <div className="shNames hand">
          {site.names.first} <span>&amp;</span> {site.names.second}
        </div>
        <div className="shKnob">
          <span />
        </div>
        <div className="shHint">{site.text.shutterHint}</div>
      </div>
    </div>
  );
}
