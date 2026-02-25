import Link from "next/link";

export default function HomePage() {
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
