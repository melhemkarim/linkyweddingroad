import { site } from "@/site.config";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const { year, month, day } = site.date;

export const weddingDate = new Date(year, month - 1, day);
export const weekdayName = WEEKDAYS[weddingDate.getDay()];
export const monthName = MONTHS[month - 1];

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Days from today (local) to the wedding day. Negative if it already happened. */
export function daysUntil(): number {
  const now = new Date();
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(year, month - 1, day);
  return Math.round((b - a) / 86400000);
}

/** Cells for the month grid: null = empty slot, number = day. */
export function monthCells(): (number | null)[] {
  const first = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const lead = (first - site.weekStartsOn + 7) % 7;
  const total = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function weekdayLetters(): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) out.push(WEEKDAYS[(i + site.weekStartsOn) % 7].slice(0, 1));
  return out;
}

/** An .ics file so guests can add the wedding to their phone calendar. */
export function buildIcs(): string {
  const d = `${year}${pad(month)}${pad(day)}`;
  const next = new Date(year, month - 1, day + 1);
  const dEnd = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  const title = `${site.names.first} & ${site.names.second}'s wedding`;
  const where = [site.venue, site.place].filter(Boolean).join(", ");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Linky//Wedding//EN",
    "BEGIN:VEVENT",
    `UID:${d}-wedding@linky`,
    `DTSTAMP:${d}T000000Z`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${dEnd}`,
    `SUMMARY:${title}`,
    `LOCATION:${where}`,
    `DESCRIPTION:${site.time}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** The exact moment of the wedding (uses site.time like "4:30 PM"). */
export function weddingMoment(): Date {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(site.time);
  let h = m ? Number(m[1]) : 0;
  const min = m ? Number(m[2]) : 0;
  if (m && m[3]) {
    const pm = m[3].toUpperCase() === "PM";
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  return new Date(year, month - 1, day, h, min, 0);
}
