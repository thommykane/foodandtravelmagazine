import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { magazineIssues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import MagazineFlipbook from "@/components/MagazineFlipbook";

const GUEST_PAGE_LIMIT = 6;

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function MagazineIssuePage({ params }: Props) {
  const { slug } = await params;
  const [issue] = await db.select().from(magazineIssues).where(eq(magazineIssues.slug, slug)).limit(1);
  if (!issue?.pdfUrl) notFound();

  const admin = await getAdminSession();
  const limitPages = admin ? 0 : GUEST_PAGE_LIMIT;

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: "1rem" }}>
      <MagazineFlipbook
        pdfUrl={issue.pdfUrl}
        title={issue.title}
        limitPages={limitPages}
      />
    </div>
  );
}
