import { site, type Place } from "@/site.config";
import { Reveal } from "./Reveal";
import { Church } from "./Church";
import { Hotel } from "./Hotel";
import { Vines } from "./Vines";

function mapsLink(p: Place) {
  if (p.mapsUrl) return p.mapsUrl;
  if (p.lat != null && p.lng != null) return `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.place} ${p.address}`)}`;
}
function wazeLink(p: Place) {
  if (p.lat != null && p.lng != null) return `https://waze.com/ul?ll=${p.lat},${p.lng}&navigate=yes`;
  return `https://waze.com/ul?q=${encodeURIComponent(`${p.place} ${p.address}`)}&navigate=yes`;
}

/** The groom's side and the bride's side: a drawing that draws itself (church or hotel), the time, and map buttons. */
export function Locations() {
  const dc = site.dressCode;
  return (
    <section className="places paper vined" aria-label={site.text.placesTitle}>
      <Vines seed={5} />
      <Reveal>
        <h2 className="eyebrow">{site.text.placesTitle}</h2>
        <div className="ar titleAr">{site.text.ar.places}</div>
      </Reveal>

      {site.locations.map((p) => (
        <article className="place" key={p.label}>
          <Reveal threshold={0.3}>
            <div className="placeLabel serifCaps">
              <span>{p.label}</span>
              <i />
              <b className="ar">{p.ar}</b>
            </div>
          </Reveal>
          <div className="churchBox">
            {p.kind === "hotel" ? <Hotel mirror={p.mirror} label={`${p.place}`} /> : <Church mirror={p.mirror} label={`${p.place}`} />}
          </div>
          <Reveal delay={150} threshold={0.4}>
            <div className="hand placeName">{p.place}</div>
            <div className="placeTime serifCaps">{p.time}</div>
            <div className="placeAddr">{p.address}</div>
            {p.note && <p className="placeNote">{p.note}</p>}
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
        <div className="dress">
          <div className="serifCaps dressTitle">{dc.title}</div>
          <div className="hand dressLine">{dc.line}</div>
          <p className="dressNote">{dc.note}</p>
        </div>
      </Reveal>
    </section>
  );
}
