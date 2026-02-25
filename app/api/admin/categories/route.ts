import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const categoryId = body.categoryId as string | undefined;
  const rulesGuidelines = body.rulesGuidelines;
  if (categoryId && typeof rulesGuidelines === "string") {
    const [cat] = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    await db.update(categories).set({ rulesGuidelines: rulesGuidelines || null }).where(eq(categories.id, categoryId));
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid PATCH body" }, { status: 400 });
}
