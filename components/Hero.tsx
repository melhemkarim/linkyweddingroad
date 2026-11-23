"use client";

import { useState } from "react";
import { site } from "@/site.config";
import { VineFrame } from "./VineFrame";
import { RedPrint } from "./RedPrint";
import { Scene } from "./Scene";

// long names get a smaller size so they never run off the screen
const size = (n: string) => (n.length <= 5 ? "13.5vw" : n.length <= 7 ? "11vw" : n.length <= 9 ? "9vw" : "7.4vw");
const cap = (n: string) => `min(${size(n)}, 64px)`;

/** First screen: paint the frame with a finger, then the names and the photo appear. */
export function Hero() {
  const { first, second } = site.names;
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);

  return (
    <section className={`hero ${ready ? "ready" : ""} ${started ? "started" : ""}`} aria-label="Invitation">
      <VineFrame onStart={() => setStarted(true)} onDone={() => setReady(true)} />

      <h1 className="srOnly">
        {first} &amp; {second}
      </h1>

      <div className="paintHint" aria-hidden="true">
        <span className="hand">{site.text.paintHint}</span>
        <small>{site.text.paintSub}</small>
      </div>

      <div className="heroInner" aria-hidden="true">
        <div className="heroNames">
          <div className="hand name write w1" style={{ ["--fs" as string]: cap(first) }}>
            {first}
          </div>
          <div className="and fadeIn f1">and</div>
          <div className="hand name write w2" style={{ ["--fs" as string]: cap(second) }}>
            {second}
          </div>
        </div>

        <div className="ar heroAr fadeIn f1">
          {site.namesAr.first} و {site.namesAr.second}
        </div>

        <div className="serifCaps fadeIn f2">{site.introTop}</div>

        {site.heroScene ? (
          <Scene name={site.heroScene} play={ready} className="heroPrint fadeIn f3" />
        ) : (
          <RedPrint className="heroPrint fadeIn f3" src="/photos/hero.jpg" alt="" loading="eager" />
        )}
      </div>

      <div className="heroCue fadeIn f4" aria-hidden="true">
        <span>{site.text.scroll}</span>
        <i />
      </div>
    </section>
  );
}
