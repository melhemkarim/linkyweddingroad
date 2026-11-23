"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { monthName } from "@/lib/dates";

const KEY = "linky_rsvp";
const HOLD_MS = 1100;
const initials = `${site.names.first.slice(0, 1)}${site.names.second.slice(0, 1)}`;

type Saved = { name: string; yes: boolean };

/** Accept or decline, your name, how many plus ones. Press and hold the seal: WhatsApp opens with the message already written. */
export function Rsvp() {
  const [yes, setYes] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [plus, setPlus] = useState(0);
  const [hint, setHint] = useState("");
  const [holding, setHolding] = useState(false);
  const [sent, setSent] = useState<Saved | null>(null);
  const [link, setLink] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSent(JSON.parse(raw) as Saved);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const names = `${site.names.first} & ${site.names.second}`;
  const dateText = `${site.date.day} ${monthName} ${site.date.year}`;

  const build = () => {
    const msg = site.text.rsvpMessage({ name: name.trim(), yes: !!yes, plus: yes ? plus : 0, names, date: dateText });
    return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
  };

  const valid = () => {
    if (yes === null) {
      setHint(site.text.sealNeedChoice);
      return false;
    }
    if (!name.trim()) {
      setHint(site.text.sealNeedName);
      return false;
    }
    setHint("");
    return true;
  };

  const start = () => {
    if (!valid()) return;
    setHolding(true);
    timer.current = setTimeout(finish, HOLD_MS);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    setHolding(false);
  };
  const finish = () => {
    setHolding(false);
    const url = build();
    setLink(url);
    const rec = { name: name.trim(), yes: !!yes };
    setSent(rec);
    try {
      localStorage.setItem(KEY, JSON.stringify(rec));
    } catch {
      /* ignore */
    }
    window.location.href = url;
  };

  const again = () => {
    setSent(null);
    setLink("");
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="rsvp dark" aria-label={site.text.rsvpTitle}>
      <Reveal>
        <h2 className="eyebrow">{site.text.rsvpTitle}</h2>
        <div className="ar titleAr">{site.text.ar.rsvp}</div>
        <p className="lede">{site.replyBy}</p>
      </Reveal>

      {sent ? (
        <Reveal threshold={0.2}>
          <div className="rsvpDone">
            <div className="hand doneName">{sent.name}</div>
            <p className="thanks">{site.text.rsvpDone(sent.yes)}</p>
            {link && (
              <a className="miniLink" href={link}>
                {site.text.sealFallback}
              </a>
            )}
            <button className="miniLink" onClick={again}>
              {site.text.rsvpChange}
            </button>
          </div>
        </Reveal>
      ) : (
        <Reveal delay={100} threshold={0.15}>
          <div className="rsvpBox">
            <div className="choice" role="group" aria-label="Reply">
              <button className={`choiceBtn ${yes === true ? "on" : ""}`} onClick={() => { setYes(true); setHint(""); }} aria-pressed={yes === true}>
                {site.text.accept}
              </button>
              <button className={`choiceBtn ${yes === false ? "on" : ""}`} onClick={() => { setYes(false); setHint(""); }} aria-pressed={yes === false}>
                {site.text.decline}
              </button>
            </div>

            <label className="nameField">
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setHint(""); }}
                placeholder={site.text.yourName}
                maxLength={60}
                autoComplete="name"
                aria-label={site.text.yourName}
              />
            </label>

            <div className={`plusRow ${yes ? "show" : ""}`} aria-hidden={!yes}>
              <div className="plusText">
                <b className="serifCaps">{site.text.plusOnes}</b>
                <small>{site.text.plusOnesHint}</small>
              </div>
              <div className="stepper">
                <button onClick={() => setPlus((n) => Math.max(0, n - 1))} aria-label="Fewer" tabIndex={yes ? 0 : -1}>
                  −
                </button>
                <span aria-live="polite">{plus}</span>
                <button onClick={() => setPlus((n) => Math.min(site.maxPlusOnes, n + 1))} aria-label="More" tabIndex={yes ? 0 : -1}>
                  +
                </button>
              </div>
            </div>

            <div className="sealWrap">
              <button
                className={`seal ${holding ? "holding" : ""}`}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start(); }}
                onPointerUp={cancel}
                onPointerCancel={cancel}
                onPointerLeave={cancel}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (valid()) finish(); } }}
                aria-label={site.text.seal}
              >
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="sealBase" cx="60" cy="60" r="54" />
                  <circle className="sealRing" cx="60" cy="60" r="54" pathLength={1} />
                </svg>
                <span className="sealMono">{initials}</span>
              </button>
              <div className="sealLabel serifCaps">{holding ? site.text.sealHolding : site.text.seal}</div>
              <div className="sealHint" aria-live="polite">{hint || " "}</div>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
