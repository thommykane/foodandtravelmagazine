import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { magazineIssues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const [issue] = await db.select().from(magazineIssues).where(eq(magazineIssues.slug, slug)).limit(1);
    if (!issue) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ issue });
  } catch (err) {
    console.error("[api/magazines/[slug] GET]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
