"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/site.config";
import { Reveal } from "./Reveal";
import { buildIcs, daysUntil, monthName, pad, weddingMoment, weekdayName } from "@/lib/dates";

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

/** Under the date: day and time, the countdown and the calendar buttons. */
export function DateDetails() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(daysUntil()), []);
  const { year, month, day } = site.date;

  const downloadIcs = () => {
    const file = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${site.names.first}-${site.names.second}-wedding.ics`;
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
    <section className="dd" aria-label="Details">
      <Reveal>
        <div className="ar ddAr">{site.text.ar.date}</div>
        <p className="ddInvite">{site.text.inviteLine}</p>
        <div className="ddWeek">{weekdayName}</div>
        <div className="ddBig">
          {day} {monthName.toUpperCase()} {year}
        </div>
        <div className="ddSub">
          {site.time}
          {site.venue ? ` · ${site.venue}` : ""}
        </div>
        <div className="ddSub">{site.place}</div>
        {days !== null && days >= 0 && <div className="ddCount">{site.text.daysToGo(days)}</div>}
      </Reveal>
      <Reveal delay={150}>
        <Countdown />
        <button className="pill" onClick={downloadIcs}>
          {site.text.addToCalendar}
        </button>
        <a className="miniLink" href={gcal} target="_blank" rel="noreferrer">
          Google Calendar
        </a>
      </Reveal>
    </section>
  );
}
