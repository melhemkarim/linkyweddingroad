"use client";

import { useEffect, useRef, useState } from "react";
import { site, type Place } from "@/site.config";
import { Reveal } from "./Reveal";

function mapsLink(p: Place) {
  if (p.mapsUrl) return p.mapsUrl;
  if (p.lat != null && p.lng != null) return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.place} ${p.address}`)}`;
}
function wazeLink(p: Place) {
  if (p.lat != null && p.lng != null) return `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
  return `https://waze.com/ul?q=${encodeURIComponent(`${p.place} ${p.address}`)}&navigate=yes`;
}

// two different little roads: from home to the place
const ROUTES = [
  { d: "M30 92 C74 14 122 116 172 64 S250 30 272 62", home: [30, 92], pin: [272, 62] },
  { d: "M30 36 C78 118 130 10 180 62 S254 96 272 58", home: [30, 36], pin: [272, 58] },
];

/** A thin gold road draws itself from home to the place, with a small light travelling along it. */
function RouteMap({ i, icon }: { i: number; icon: "church" | "hotel" }) {
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const r = ROUTES[i % ROUTES.length];
  const [hx, hy] = r.home;
  const [px, py] = r.pin;
  return (
    <svg ref={ref} className={`routeMap ${on ? "on" : ""}`} viewBox="0 0 300 130" aria-hidden="true">
      {/* faint streets */}
      <g className="rmStreets">
        <path d="M0 20 H300 M0 112 H300 M60 0 V130 M150 0 V130 M240 0 V130" />
        <path d="M0 70 C60 60 120 90 190 76 S270 90 300 80" />
      </g>
      <path id={`rmp${i}`} className="rmRoad" pathLength={1} d={r.d} />
      {/* home */}
      <g className="rmHome">
        <circle cx={hx} cy={hy} r="9" />
        <path d={`M${hx - 4} ${hy + 3} v-5 l4 -4 l4 4 v5 z`} />
      </g>
      {/* the place */}
      <g className="rmPin">
        <circle className="rmPing" cx={px} cy={py} r="7" />
        <path d={icon === "hotel" ? `M${px - 6} ${py + 7} V${py - 8} H${px + 6} V${py + 7} M${px - 3} ${py - 4} h2 M${px + 1} ${py - 4} h2 M${px - 3} ${py} h2 M${px + 1} ${py} h2` : `M${px - 6} ${py + 7} V${py - 2} L${px} ${py - 9} L${px + 6} ${py - 2} V${py + 7} M${px} ${py - 9} V${py - 14} M${px - 2.5} ${py - 12} h5`} />
      </g>
      {on && (
        <circle className="rmDot" r="3.6">
          <animateMotion dur="4.2s" begin="1.6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear">
            <mpath href={`#rmp${i}`} />
          </animateMotion>
        </circle>
      )}
    </svg>
  );
}

/** The groom's side and the bride's side. */
export function Places() {
  const dc = site.dressCode;
  return (
    <section className="plc" aria-label={site.text.placesTitle}>
      <Reveal>
        <h2 className="secTitle">{site.text.placesTitle}</h2>
        <div className="ar secAr">{site.text.ar.places}</div>
      </Reveal>

      {site.locations.map((p, i) => (
        <article className="plcCard" key={p.label}>
          <Reveal threshold={0.3}>
            <div className="plcLabel">
              <span>{p.label}</span>
              <i />
              <b className="ar">{p.ar}</b>
            </div>
          </Reveal>
          <RouteMap i={i} icon={p.kind === "hotel" ? "hotel" : "church"} />
          <Reveal delay={150} threshold={0.4}>
            <div className="plcName">{p.place}</div>
            <div className="plcTime">{p.time}</div>
            <div className="plcAddr">{p.address}</div>
            {p.note && <p className="plcNote">{p.note}</p>}
            <div className="mapBtns">
              <a className="pill" href={mapsLink(p)} target="_blank" rel="noreferrer">
                {site.text.openMaps}
              </a>
              <a className="pill ghost" href={wazeLink(p)} target="_blank" rel="noreferrer">
                {site.text.openWaze}
              </a>
            </div>
          </Reveal>
        </article>
      ))}

      <Reveal threshold={0.5}>
        <div className="plcDress">
          <div className="plcDressT">{dc.title}</div>
          <div className="plcDressL">{dc.line}</div>
          <p className="plcNote">{dc.note}</p>
        </div>
      </Reveal>
    </section>
  );
}
