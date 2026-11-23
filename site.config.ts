// ─────────────────────────────────────────────────────────────
//  EVERYTHING YOU CHANGE FOR A NEW WEDDING LIVES IN THIS FILE.
//  This is the ROAD version: a drawn coast, two childhood photos, and a date made of both.
// ─────────────────────────────────────────────────────────────


export type Place = {
  label: string; // small title, e.g. "THE GROOM"
  ar: string; // the same in Arabic
  place: string; // name of the church
  address: string; // street, town
  time: string;
  note?: string; // one short line under the time
  // Optional: exact spot. If you leave these out, the map button searches "place + address".
  lat?: number;
  lng?: number;
  mapsUrl?: string; // or paste a Google Maps link here and it is used as it is
  mirror?: boolean; // draws the church the other way round
  kind?: "church" | "hotel"; // which drawing to show (default: church)
};

export const site = {
  // Page title shown in the browser tab and when the link is shared
  pageTitle: "Karim & Dana — Save the date",
  pageDescription: "You are invited to our wedding.",

  // The two names. Shown big, in handwriting, on the first screen.
  names: { first: "Karim", second: "Dana" },
  introTop: "ARE GETTING MARRIED",
  namesAr: { first: "كريم", second: "دانا" },

  // The wedding day (month is 1–12)
  date: { year: 2027, month: 6, day: 5 },
  time: "4:30 PM",
  venue: "Domaine des Roses",
  place: "Batroun, Lebanon",
  weekStartsOn: 1 as 0 | 1,

  // ── The two places: the groom's side and the bride's side ──
  locations: [
    {
      label: "THE GROOM",
      ar: "العريس",
      place: "Saint Joseph Church",
      address: "Batroun, Lebanon",
      time: "3:30 PM",
      note: "We leave from the groom's house at 3:00 PM.",
    },
    {
      label: "THE BRIDE",
      ar: "العروس",
      place: "Grand Hotel",
      address: "Jounieh, Lebanon",
      time: "3:00 PM",
      note: "The bride leaves from the hotel. The ceremony starts at 3:30 PM.",
      kind: "hotel",
    },
  ] as Place[],

  dressCode: { title: "Dress code", line: "Black tie optional", note: "Ivory is reserved for the bride." },

  // ── RSVP: the answer opens WhatsApp with the message already written ──
  // Put the number with the country code, digits only (Lebanon = 961, no zero at the start).
  whatsapp: "96170000000",
  maxPlusOnes: 5,
  replyBy: "Kindly reply by 1 May 2027",

  // The two photos inside the date (put the files in /public/photos)
  photoHim: "/photos/him.jpg",
  photoHer: "/photos/her.jpg",

  // Words
  text: {
    scroll: "SLIDE UP",
    quickWishes: [
      { label: "Mabrouk", ar: "مبروك", text: "Mabrouk!" },
      { label: "Allah yehniyon", ar: "الله يهنيهم", text: "Allah yehniyon!" },
    ],
    ar: {
      intro: "نتشرف بدعوتكم",
      story: "قصتنا",
      date: "احفظوا الموعد",
      places: "مكان الحفل",
      rsvp: "تأكيد الحضور",
      wishes: "اتركوا لنا أمنية",
      camera: "صوّروا معنا",
    },
    inviteLine: "Together with their families, invite you to celebrate their wedding.",
    storyTitle: "Our story",
    paintHint: "GROW THE VINE",
    paintSub: "Drag your finger along the edge",
    tapHint: "TAP THE DAY",
    paintAgain: "Show it again",
    calendarTitle: "Save the date",
    addToCalendar: "Add to my calendar",
    countdownTitle: "Until we celebrate",
    roadHint: "SLIDE UP",
    roadEnd: "Every road leads to the same day.",
    dateLines: ["Two beginnings.", "One day."],
    dateHint: "KEEP SCROLLING",
    pearlCaption: "One pearl for every day until we celebrate.",
    daysToGo: (n: number) => (n > 1 ? `${n} days to go` : n === 1 ? "Tomorrow" : n === 0 ? "Today" : ""),
    placesTitle: "Where",
    openMaps: "Open in Maps",
    openWaze: "Waze",
    rsvpTitle: "Will you join us?",
    accept: "Accept",
    decline: "Decline",
    yourName: "Your name",
    plusOnes: "Plus ones",
    plusOnesHint: "How many guests are coming with you?",
    seal: "Press & hold to send",
    sealNeedName: "Add your name first",
    sealNeedChoice: "Choose accept or decline first",
    sealHolding: "Keep holding…",
    sealOpening: "Opening WhatsApp…",
    sealFallback: "Tap here if WhatsApp did not open",
    rsvpChange: "Change my reply",
    rsvpDone: (yes: boolean) => (yes ? "Thank you. We cannot wait to celebrate with you." : "Thank you for letting us know. You will be missed."),
    // The message that arrives in the couple's WhatsApp
    rsvpMessage: (d: { name: string; yes: boolean; plus: number; names: string; date: string }) =>
      [
        `Hello! 💌`,
        `RSVP for ${d.names}'s wedding — ${d.date}`,
        ``,
        `Name: ${d.name}`,
        `Reply: ${d.yes ? "✅ Accepts" : "❌ Regretfully declines"}`,
        ...(d.yes ? [`Plus ones: ${d.plus}`, `Total coming: ${d.plus + 1}`] : []),
      ].join("\n"),
    wishesTitle: "Leave us a wish",
    wishesSub: "Write a few words, then flick the card onto the pile.",
    wishPlaceholder: "Write your wish here…",
    wishNamePlaceholder: "Your name",
    wishFlick: "Flick up to send",
    wishThanks: "Thank you. It is on the table.",
    wishLimit: "Thank you. That is all the cards we can fit from you.",
    onTheTable: (n: number) => (n === 1 ? "1 wish on the table" : `${n} wishes on the table`),
    cameraTitle: "Take a photo",
    cameraSub: "Take up to three photos at the wedding. They go straight to the couple.",
    cameraOpen: "Open the camera",
    shotsLeft: (n: number) => (n === 1 ? "1 shot left" : `${n} shots left`),
    footer: "Created by Linky",
  },
};

export type Site = typeof site;
