import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { magazineIssues } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { v4 as uuid } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const THUMB_DIR = "mag-cover-thumbnails";
const PDF_DIR = "magazines";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(magazineIssues)
      .orderBy(desc(magazineIssues.releaseDate));
    return NextResponse.json({ issues: rows });
  } catch (err) {
    console.error("[api/magazines GET]", err);
    return NextResponse.json({ issues: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin required" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const releaseDateRaw = formData.get("releaseDate") as string;
    const blurb = (formData.get("blurb") as string)?.trim() || null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const pdfFile = formData.get("pdf") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    const releaseDate = releaseDateRaw ? new Date(releaseDateRaw) : new Date();
    if (isNaN(releaseDate.getTime())) {
      return NextResponse.json({ error: "Invalid release date" }, { status: 400 });
    }
    if (!pdfFile || pdfFile.size === 0) {
      return NextResponse.json({ error: "PDF file required" }, { status: 400 });
    }
    const pdfExt = path.extname(pdfFile.name).toLowerCase();
    if (pdfExt !== ".pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let attempt = 0;
    const existing = await db.select().from(magazineIssues);
    const slugs = new Set(existing.map((r) => r.slug));
    while (slugs.has(slug)) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const publicDir = path.join(process.cwd(), "public");

    let thumbnailUrl: string | null = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(thumbnailFile.name) || ".jpg";
      const filename = `${slug}${ext}`;
      const dir = path.join(publicDir, THUMB_DIR);
      await mkdir(dir, { recursive: true });
      const filepath = path.join(dir, filename);
      await writeFile(filepath, buffer);
      thumbnailUrl = `/${THUMB_DIR}/${filename}`;
    }

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfBytes);
    const pdfFilename = `${slug}.pdf`;
    const pdfDir = path.join(publicDir, PDF_DIR);
    await mkdir(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, pdfFilename);
    await writeFile(pdfPath, pdfBuffer);
    const pdfUrl = `/${PDF_DIR}/${pdfFilename}`;

    const id = uuid();
    const maxOrder = existing.length === 0 ? 0 : Math.max(...existing.map((r) => r.sortOrder ?? 0), 0);

    await db.insert(magazineIssues).values({
      id,
      slug,
      title,
      releaseDate,
      blurb,
      thumbnailUrl,
      pdfUrl,
      sortOrder: maxOrder + 1,
    });

    const [created] = await db.select().from(magazineIssues).where(eq(magazineIssues.id, id)).limit(1);
    return NextResponse.json({ issue: created });
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && (err as { digest?: string }).digest === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("[api/magazines POST]", err);
    const message = err instanceof Error ? err.message : "Failed to create magazine issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
