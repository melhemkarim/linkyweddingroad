"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { MAX_WISHES, bumpWishesSent, getSavedName, getStatus, getWishesSent, sendWish, setSavedName, getDemoStore } from "@/lib/client";

// small, stable "random" so the pile looks the same on every render
const seeded = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const initials = `${site.names.first.slice(0, 1)} & ${site.names.second.slice(0, 1)}`;

export function Wishes() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [sentLocal, setSentLocal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [justSent, setJustSent] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, dx: 0, dy: 0, moved: false, vy: 0, ly: 0, lt: 0 });

  useEffect(() => {
    setName(getSavedName());
    setSentLocal(getWishesSent());
    getStatus().then((s) => {
      setConfigured(s.configured);
      setCount(s.configured ? s.wishCount : getDemoStore().wishes.length);
    });
  }, []);

  const finished = sentLocal >= MAX_WISHES;

  const reset = (soft = true) => {
    const c = cardRef.current;
    if (!c) return;
    c.style.transition = soft ? "transform .55s cubic-bezier(.2,.8,.2,1)" : "none";
    c.style.transform = "none";
  };

  const trySend = async (dx: number, dy: number) => {
    const c = cardRef.current;
    if (!c || busy) return;
    if (!name.trim() || msg.trim().length < 2) {
      setShake(true);
      setError(!name.trim() ? "Add your name first." : "Write a few words first.");
      setTimeout(() => setShake(false), 600);
      reset();
      return;
    }
    setError("");
    setBusy(true);
    const res = await sendWish(name.trim(), msg.trim());
    if (!res.ok) {
      setBusy(false);
      setError(res.error || "Something went wrong.");
      reset();
      return;
    }
    setSavedName(name);

    // fly the card onto the pile
    const pile = pileRef.current?.getBoundingClientRect();
    const cur = c.getBoundingClientRect();
    if (pile) {
      const ex = pile.left + pile.width / 2 - (cur.left + cur.width / 2);
      const ey = pile.top + pile.height / 2 - (cur.top + cur.height / 2);
      const rot = (Math.random() * 16 - 8).toFixed(1);
      c.style.transition = "transform .95s cubic-bezier(.55,0,.25,1), opacity .5s ease .55s";
      c.style.transform = `translate(${dx + ex}px, ${dy + ey}px) scale(.42) rotate(${rot}deg)`;
      c.style.opacity = "0";
    }
    setTimeout(
      () => {
        bumpWishesSent();
        setSentLocal(getWishesSent());
        setCount((n) => (typeof res.wishCount === "number" && configured ? res.wishCount : n + 1));
        setMsg("");
        setBusy(false);
        setJustSent(true);
        setTimeout(() => setJustSent(false), 4200);
      },
      pile ? 1000 : 0
    );
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const d = drag.current;
    d.on = true;
    d.sx = e.clientX;
    d.sy = e.clientY;
    d.dx = 0;
    d.dy = 0;
    d.moved = false;
    d.vy = 0;
    d.ly = e.clientY;
    d.lt = performance.now();
    if (cardRef.current) cardRef.current.style.transition = "none";
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.on) return;
    d.dx = e.clientX - d.sx;
    d.dy = Math.min(e.clientY - d.sy, 40);
    if (Math.abs(d.dx) > 6 || Math.abs(d.dy) > 6) d.moved = true;
    const now = performance.now();
    const dt = now - d.lt;
    if (dt > 0) d.vy = (e.clientY - d.ly) / dt;
    d.ly = e.clientY;
    d.lt = now;
    if (cardRef.current) cardRef.current.style.transform = `translate(${d.dx}px, ${d.dy}px) rotate(${d.dx * 0.05}deg)`;
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const flick = !d.moved || d.dy < -80 || d.vy < -0.8;
    if (flick) trySend(d.dx, Math.min(d.dy, 0));
    else reset();
  };

  const pileN = Math.min(count, 16);

  return (
    <section className="wishes dark" aria-label={site.text.wishesTitle}>
      <Reveal>
        <h2 className="eyebrow">{site.text.wishesTitle}</h2>
        <div className="ar titleAr">{site.text.ar.wishes}</div>
        <p className="lede">{site.text.wishesSub}</p>
      </Reveal>

      <div className="pile" ref={pileRef}>
        {pileN === 0 && <div className="pileEmpty" />}
        {Array.from({ length: pileN }).map((_, i) => {
          const rot = +((seeded(i, 1) - 0.5) * 34).toFixed(1);
          const x = +((seeded(i, 2) - 0.5) * 54).toFixed(1);
          const y = +((seeded(i, 3) - 0.5) * 22).toFixed(1);
          return (
            <div key={i} className="pileCard" style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg)` }}>
              <span className="script">{initials}</span>
            </div>
          );
        })}
      </div>
      <div className="pileCount">{count > 0 ? site.text.onTheTable(count) : " "}</div>

      <div className="tableTop">
        {!finished && (
          <div className="quick">
            {site.text.quickWishes.map((q) => (
              <button
                key={q.label}
                type="button"
                className="quickBtn"
                disabled={busy}
                onClick={() => setMsg((m) => (m.includes(q.text) ? m : `${m}${m && !/\s$/.test(m) ? " " : ""}${q.text}`).slice(0, 280))}
              >
                <span>{q.label}</span>
                <b className="ar">{q.ar}</b>
              </button>
            ))}
          </div>
        )}
        {!finished ? (
          <div key={sentLocal} className={`wishCard enter ${shake ? "shake" : ""}`} ref={cardRef}>
            <div className="wishFor">
              {site.names.first} & {site.names.second}
            </div>
            <textarea
              className="wishText"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder={site.text.wishPlaceholder}
              maxLength={280}
              rows={4}
              disabled={busy}
              aria-label="Your wish"
            />
            <div className="wishFrom">
              <span>—</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={site.text.wishNamePlaceholder}
                maxLength={40}
                disabled={busy}
                aria-label="Your name"
                autoComplete="name"
              />
            </div>
            <div
              className="flickBar"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="button"
              aria-label={site.text.wishFlick}
            >
              <i />
              <span>{busy ? "…" : site.text.wishFlick}</span>
            </div>
          </div>
        ) : (
          <p className="thanks">{site.text.wishLimit}</p>
        )}
        <div className="wishNote" aria-live="polite">
          {error ? <span className="err">{error}</span> : justSent ? site.text.wishThanks : " "}
        </div>
      </div>

      {configured === false && <p className="demoNote">Demo mode: wishes stay on this phone until Supabase is connected (see README).</p>}
    </section>
  );
}
