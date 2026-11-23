import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "crypto";

export const BUCKET = "portraits";
export const MAX_WISHES_PER_DEVICE = 3;
export const MAX_PHOTOS_PER_DEVICE = 3;

export function isConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function db() {
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Compares the couple's password without leaking timing. */
export function coupleOk(password: unknown): boolean {
  const expected = process.env.COUPLE_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  const a = createHash("sha256").update(password).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function cleanText(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // remove control characters, keep normal text and line breaks
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

export function validDevice(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v);
}
