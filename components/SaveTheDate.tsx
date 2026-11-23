"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { buildIcs, daysUntil, monthCells, monthName, pad, weddingMoment, weekdayLetters, weekdayName } from "@/lib/dates";
import { Vines } from "./Vines";


function Countdown() {
  const [left, setLeft] = useState<number | null>(null);
  const [seen, setSeen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, weddingMoment().getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const v = left ?? 0;
  const dayCount = Math.min(366, Math.ceil(v / 86400000));
  const parts = [
    ["Days", Math.floor(v / 86400000)],
    ["Hours", Math.floor(v / 3600000) % 24],
    ["Minutes", Math.floor(v / 60000) % 60],
    ["Seconds", Math.floor(v / 1000) % 60],
  ] as const;
  return (
    <div className="countdown" aria-label={site.text.countdownTitle} ref={boxRef}>
      <div className="cdRow">
        {parts.map(([label, n]) => (
          <div className="cdBox" key={label}>
            <b>{left === null ? "–" : pad(n)}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={`pearls ${seen ? "in" : ""}`} aria-hidden="true">
        {Array.from({ length: left === null ? 0 : dayCount }).map((_, i, all) => (
          <i key={i} className={i === all.length - 1 ? "last" : ""} style={{ ["--i" as string]: Math.min(i * 0.011, 2.6).toFixed(3) + "s" }} />
        ))}
      </div>
      <div className="cdCap">{site.text.pearlCaption}</div>
    </div>
  );
}

/**
 * The month is a grid of small red dashes. One of them is bigger and pulses:
 * tap it and a big red dash is painted over the wedding day.
 */
export function SaveTheDate() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(false);
  const [days, setDays] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const touched = useRef(false);

  const cells = monthCells();
  const letters = weekdayLetters();
  const { year, month, day } = site.date;

  useEffect(() => setDays(daysUntil()), []);

  // if nobody taps, paint it for them after a few seconds in view
  useEffect(() => {
    const el = stageRef.current;
    if (!el || painted) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        const inView = entries.some((e) => e.isIntersecting);
        clearTimeout(timer);
        if (inView) timer = setTimeout(() => !touched.current && setPainted(true), reduce ? 200 : 700);
      },
      { threshold: 0.75 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, [painted, round]);

  const paint = () => {
    touched.current = true;
    setPainted(true);
  };
  const again = () => {
    touched.current = false;
    setPainted(false);
    setRound((r) => r + 1);
  };

  const downloadIcs = () => {
    const blobFile = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blobFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const next = new Date(year, month - 1, day + 1);
  const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const gcal =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`${site.names.first} & ${site.names.second}'s wedding`)}` +
    `&dates=${ymd(new Date(year, month - 1, day))}/${ymd(next)}` +
    `&location=${encodeURIComponent([site.venue, site.place].filter(Boolean).join(", "))}`;

  return (
    <section className="date paper vined" aria-label={site.text.calendarTitle}>
      <Vines seed={2} />
      <Reveal>
        <h2 className="eyebrow">{site.text.calendarTitle}</h2>
        <div className="ar titleAr">{site.text.ar.date}</div>
        <p className="lede inviteLine">{site.text.inviteLine}</p>
      </Reveal>

      <div className="calStage" ref={stageRef}>
        <div className="calHead">
          <span className="calMonth">{monthName}</span>
          <span className="calYear">{year}</span>
        </div>

        <div className="dGrid" role="grid">
          {letters.map((l, i) => (
            <div key={`h${i}`} className="dDow">
              {l}
            </div>
          ))}
          {cells.map((c, i) =>
            c === null ? (
              <div key={i} className="dCell" />
            ) : c === day ? (
              <div key={i} className={`dCell isDate ${painted ? "painted" : ""}`}>
                <span className="dNum dateNum" style={{ ["--n" as string]: i }}>{c}</span>
                <div className="ringDrop" aria-hidden="true">
                  <span className="ringShadow" />
                  <span className="ringBurst" />
                  <svg className="ringSvg" viewBox="-50 -50 100 100">
                    <defs>
                      <linearGradient id="goldBand" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#fff3c4" />
                        <stop offset="0.45" stopColor="#e8c262" />
                        <stop offset="1" stopColor="#a8802f" />
                      </linearGradient>
                    </defs>
                    <circle cx="0" cy="6" r="26" fill="none" stroke="url(#goldBand)" strokeWidth="9" />
                    <circle cx="0" cy="6" r="26" fill="none" stroke="#fff8dc" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="38 200" strokeDashoffset="-98" />
                    <circle cx="0" cy="6" r="21.6" fill="none" stroke="#7a5a1c" strokeOpacity="0.55" strokeWidth="1" />
                    <path d="M0 -29 L9 -36 L5 -45 L-5 -45 L-9 -36 Z" fill="#f4fbff" stroke="#c8d8e8" strokeWidth="1" />
                    <path d="M-9 -36 L9 -36 M0 -29 L-3 -45 M0 -29 L3 -45" stroke="#9fb4cc" strokeWidth="0.8" fill="none" />
                  </svg>
                  {[0, 60, 120, 180, 240, 300].map((a) => (
                    <i key={a} className="ringSpark" style={{ ["--a" as string]: `${a}deg` }} />
                  ))}
                </div>
                <span className="ringNum">{c}</span>
              </div>
            ) : (
              <div key={i} className="dCell">
                <span className="dNum" style={{ ["--n" as string]: i }}>{c}</span>
              </div>
            )
          )}
        </div>

      </div>

      <div className={`dateDetails ${painted ? "in" : ""}`}>
        <div className="dateWeek serifCaps">{weekdayName}</div>
        <div className="hand dateBig">
          {day} {monthName.toUpperCase()} {year}
        </div>
        <div className="dateSub serifCaps">
          {site.time}
          {site.venue ? ` · ${site.venue}` : ""}
        </div>
        <div className="dateSub serifCaps">{site.place}</div>
        {days !== null && days >= 0 && <div className="dateCount serifCaps">{site.text.daysToGo(days)}</div>}

        <Countdown />

        <button className="pill" onClick={downloadIcs}>
          {site.text.addToCalendar}
        </button>
        <a className="miniLink" href={gcal} target="_blank" rel="noreferrer">
          Google Calendar
        </a>
        <button className="miniLink" onClick={again}>
          {site.text.paintAgain}
        </button>
      </div>
    </section>
  );
}
