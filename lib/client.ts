"use client";

// Everything the guest's phone needs to talk to the saving side.
// If Supabase is not connected yet, it falls back to "demo mode":
// things are kept only on that phone so you can test the whole flow.

export const MAX_WISHES = 3;
export const MAX_PHOTOS = 3;

const K = {
  device: "linky_device",
  name: "linky_name",
  wishes: "linky_wishes_sent",
  photos: "linky_photos_taken",
  demo: "linky_demo_store",
};

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage can be blocked in some in-app browsers; ignore */
  }
}

export function getDeviceId(): string {
  let id = lsGet(K.device);
  if (!id) {
    id =
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36)) || "anon";
    lsSet(K.device, id);
  }
  return id;
}

export const getSavedName = () => lsGet(K.name) || "";
export const setSavedName = (n: string) => lsSet(K.name, n.trim().slice(0, 40));

// ── what this guest already did (kept on their phone) ──
export const getWishesSent = (): number => parseInt(lsGet(K.wishes) || "0", 10) || 0;
export const bumpWishesSent = () => lsSet(K.wishes, String(getWishesSent() + 1));

export type OwnPhoto = { thumb: string; at: number };
export function getOwnPhotos(): OwnPhoto[] {
  try {
    return JSON.parse(lsGet(K.photos) || "[]");
  } catch {
    return [];
  }
}
export function addOwnPhoto(p: OwnPhoto) {
  const list = getOwnPhotos();
  list.push(p);
  lsSet(K.photos, JSON.stringify(list.slice(0, MAX_PHOTOS)));
}

// ── demo store ──
type DemoStore = {
  wishes: { id: string; name: string; message: string; created_at: string }[];
  photos: { id: string; name: string; url: string; created_at: string }[];
};
export function getDemoStore(): DemoStore {
  try {
    const s = JSON.parse(lsGet(K.demo) || "null");
    if (s && s.wishes && s.photos) return s;
  } catch {
    /* ignore */
  }
  return { wishes: [], photos: [] };
}
function saveDemoStore(s: DemoStore) {
  lsSet(K.demo, JSON.stringify(s));
}

// ── status ──
export type Status = { configured: boolean; wishCount: number };
let statusCache: Promise<Status> | null = null;

export function getStatus(force = false): Promise<Status> {
  if (!statusCache || force) {
    statusCache = fetch("/api/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { configured: false, wishCount: 0 }))
      .catch(() => ({ configured: false, wishCount: 0 }));
  }
  return statusCache;
}

// ── wishes ──
export async function sendWish(name: string, message: string): Promise<{ ok: boolean; error?: string; wishCount?: number }> {
  const status = await getStatus();
  if (!status.configured) {
    const s = getDemoStore();
    s.wishes.push({ id: String(Date.now()), name, message, created_at: new Date().toISOString() });
    saveDemoStore(s);
    return { ok: true, wishCount: s.wishes.length };
  }
  try {
    const r = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: getDeviceId(), name, message }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || "Something went wrong" };
    return { ok: true, wishCount: j.wishCount };
  } catch {
    return { ok: false, error: "No connection. Try again." };
  }
}

// ── photos ──
export async function sendPhoto(blob: Blob, thumbDataUrl: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const status = await getStatus();
  if (!status.configured) {
    const s = getDemoStore();
    const url = await blobToDataUrl(blob);
    s.photos.push({ id: String(Date.now()), name, url, created_at: new Date().toISOString() });
    saveDemoStore(s);
    return { ok: true };
  }
  try {
    const fd = new FormData();
    fd.append("deviceId", getDeviceId());
    fd.append("name", name);
    fd.append("photo", blob, "portrait.jpg");
    const r = await fetch("/api/photos", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error || "Something went wrong" };
    return { ok: true };
  } catch {
    return { ok: false, error: "No connection. Try again." };
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}
