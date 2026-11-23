import { NextResponse } from "next/server";
import { MAX_WISHES_PER_DEVICE, cleanText, db, isConfigured, validDevice } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isConfigured()) return NextResponse.json({ error: "Saving is not connected yet." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const name = cleanText(body.name, 40);
  const message = cleanText(body.message, 280);
  if (!validDevice(body.deviceId) || !name || message.length < 2) {
    return NextResponse.json({ error: "Please add your name and a few words." }, { status: 400 });
  }

  const supabase = db();
  const { count: mine } = await supabase
    .from("wishes")
    .select("id", { count: "exact", head: true })
    .eq("device_id", body.deviceId);
  if ((mine ?? 0) >= MAX_WISHES_PER_DEVICE) {
    return NextResponse.json({ error: "That is all the cards we can fit from you. Thank you!" }, { status: 429 });
  }

  const { error } = await supabase.from("wishes").insert({ device_id: body.deviceId, name, message });
  if (error) return NextResponse.json({ error: "Could not save your wish. Try again." }, { status: 500 });

  const { count } = await supabase.from("wishes").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, wishCount: count ?? 0 });
}
