import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import AdminPanel from "@/components/AdminPanel";

type Props = { searchParams: Promise<{ admin?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  if (params.admin === "1") {
    const admin = await getAdminSession();
    if (admin) {
      return (
        <main style={{ padding: "1.5rem" }}>
          <h1 style={{ marginBottom: "0.5rem", color: "var(--gold)" }}>Admin Panel</h1>
          <p style={{ color: "var(--gold-dim)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Logged in as {admin.user.email}
          </p>
          <AdminPanel />
        </main>
      );
    }
  }

  return (
    <main
      style={{
        padding: "2rem 1.5rem",
        textAlign: "center",
        maxWidth: "900px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h1 style={{ marginBottom: "0.5rem", color: "var(--mag-primary)" }}>
        Food and Travel Magazine
      </h1>
      <p style={{ color: "var(--gold-dim)", marginBottom: "2rem" }}>
        Food · Travel · Destinations · Culinary
      </p>
      <Link
        href="/c/all-main-page"
        style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          background: "var(--glass)",
          border: "1px solid var(--glass-border)",
          borderRadius: "8px",
          color: "var(--gold-bright)",
        }}
      >
        Browse Categories →
      </Link>
    </main>
  );
}
