import { NextResponse } from "next/server";
import { db, isConfigured } from "@/lib/server";

export const dynamic = "force-dynamic";

// Tells the page whether saving is connected, and how many wishes are on the table.
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json({ configured: false, wishCount: 0 });
  }
  try {
    const { count } = await db().from("wishes").select("id", { count: "exact", head: true });
    return NextResponse.json({ configured: true, wishCount: count ?? 0 });
  } catch {
    return NextResponse.json({ configured: true, wishCount: 0 });
  }
}
