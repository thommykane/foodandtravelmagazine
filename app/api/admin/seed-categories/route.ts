import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { runSeed } from "@/lib/seed-categories-data";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await runSeed();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/seed-categories]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Seed failed" }, { status: 500 });
  }
}
