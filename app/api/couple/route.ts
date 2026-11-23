import { NextResponse } from "next/server";
import { BUCKET, coupleOk, db, isConfigured } from "@/lib/server";

export const dynamic = "force-dynamic";

// Only the couple can read wishes and portraits. Guests can only add.
export async function POST(req: Request) {
  if (!isConfigured()) return NextResponse.json({ configured: false });

  let body: { password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body = wrong password below */
  }
  if (!coupleOk(body.password)) {
    // small delay makes guessing slower
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const supabase = db();
  const [wishes, photos] = await Promise.all([
    supabase.from("wishes").select("id,name,message,created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("photos").select("id,name,path,created_at").order("created_at", { ascending: false }).limit(1000),
  ]);

  const rows = photos.data ?? [];
  let urls: Record<string, string> = {};
  if (rows.length) {
    const signed = await supabase.storage.from(BUCKET).createSignedUrls(
      rows.map((r) => r.path),
      60 * 60
    );
    for (const s of signed.data ?? []) if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
  }

  return NextResponse.json({
    configured: true,
    wishes: wishes.data ?? [],
    photos: rows.map((r) => ({ id: r.id, name: r.name, created_at: r.created_at, url: urls[r.path] || "" })).filter((p) => p.url),
  });
}
