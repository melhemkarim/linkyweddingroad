import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { BUCKET, MAX_PHOTOS_PER_DEVICE, cleanText, db, isConfigured, validDevice } from "@/lib/server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(req: Request) {
  if (!isConfigured()) return NextResponse.json({ error: "Saving is not connected yet." }, { status: 503 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const deviceId = form.get("deviceId");
  const name = cleanText(form.get("name"), 40);
  const file = form.get("photo");

  if (!validDevice(deviceId) || !name || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "That photo is too large." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // real JPEG files start with FF D8 FF
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
    return NextResponse.json({ error: "Only photos are accepted." }, { status: 415 });
  }

  const supabase = db();
  const { count: mine } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("device_id", deviceId);
  if ((mine ?? 0) >= MAX_PHOTOS_PER_DEVICE) {
    return NextResponse.json({ error: "That is your three shots. Thank you!" }, { status: 429 });
  }

  const path = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.jpg`;
  const up = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (up.error) return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });

  const { error } = await supabase.from("photos").insert({ device_id: deviceId, name, path });
  if (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "Could not save the photo. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
