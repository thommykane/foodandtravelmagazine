import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuSections } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const FALLBACK_SECTIONS = [
  { id: "main", name: "Main", sortOrder: 0 },
  { id: "explore", name: "Explore", sortOrder: 1 },
  { id: "culinary", name: "Culinary Traveler", sortOrder: 2 },
];

export async function GET() {
  try {
    let sections = await db.select().from(menuSections).orderBy(asc(menuSections.sortOrder), asc(menuSections.id));

    if (sections.length === 0) {
      await db.insert(menuSections).values(FALLBACK_SECTIONS);
      sections = await db.select().from(menuSections).orderBy(asc(menuSections.sortOrder), asc(menuSections.id));
    }

    const res = NextResponse.json({ sections });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    return res;
  } catch (err) {
    console.error("[api/menu-sections]", err);
    const fallback = NextResponse.json({ sections: FALLBACK_SECTIONS });
    fallback.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    fallback.headers.set("Pragma", "no-cache");
    return fallback;
  }
}
