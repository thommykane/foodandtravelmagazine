"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AnnouncementBanner from "./AnnouncementBanner";

type Issue = {
  id: string;
  slug: string;
  title: string;
  releaseDate: string;
  blurb: string | null;
  thumbnailUrl: string | null;
  pdfUrl: string;
};

export default function RecentIssuesPage({ categoryName }: { categoryName: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [blurb, setBlurb] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [magRes, meRes] = await Promise.all([
        fetch("/api/magazines"),
        fetch("/api/me", { credentials: "include" }),
      ]);
      const magData = await magRes.json();
      const meData = await meRes.json();
      setIssues(magData.issues ?? []);
      setIsAdmin(!!meData.user?.isAdmin);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!pdfFile || pdfFile.size === 0) {
      setError("Please select a PDF file.");
      return;
    }
    setError(null);
    setPosting(true);
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("releaseDate", releaseDate);
      form.set("blurb", blurb.trim());
      if (thumbnailFile && thumbnailFile.size > 0) form.set("thumbnail", thumbnailFile);
      form.set("pdf", pdfFile);

      const res = await fetch("/api/magazines", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post magazine.");
        return;
      }
      setShowForm(false);
      setTitle("");
      setBlurb("");
      setThumbnailFile(null);
      setPdfFile(null);
      await load();
    } finally {
      setPosting(false);
    }
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: "900px",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    textAlign: "left",
  };

  const headingStyle: React.CSSProperties = {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--gold)",
    margin: 0,
    marginBottom: "1rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const issueItemStyle: React.CSSProperties = {
    marginBottom: "1.5rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid var(--glass-border)",
  };

  const thumbLinkStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.75rem",
  };

  const thumbImgStyle: React.CSSProperties = {
    maxWidth: "280px",
    width: "100%",
    height: "auto",
    borderRadius: "8px",
    border: "1px solid var(--glass-border)",
  };

  const releaseStyle: React.CSSProperties = {
    color: "var(--gold-dim)",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  };

  const blurbStyle: React.CSSProperties = {
    color: "var(--gold-dim)",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  };

  return (
    <div style={containerStyle}>
      <AnnouncementBanner />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <h1 style={headingStyle}>{categoryName}</h1>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "0.5rem 1rem",
              background: showForm ? "var(--glass)" : "var(--mag-primary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "6px",
              color: "var(--gold-bright)",
              cursor: "pointer",
            }}
          >
            {showForm ? "Cancel" : "Post new issue"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "2rem",
            padding: "1.25rem",
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", margin: "0 0 1rem", color: "var(--gold)" }}>New magazine issue</h2>
          {error && (
            <p style={{ color: "var(--error, #e55)", marginBottom: "0.75rem", fontSize: "0.9rem" }}>{error}</p>
          )}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--gold-dim)" }}>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "0.5rem",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
                borderRadius: "6px",
                color: "var(--gold-bright)",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--gold-dim)" }}>Release date</label>
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              style={{
                padding: "0.5rem",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
                borderRadius: "6px",
                color: "var(--gold-bright)",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--gold-dim)" }}>Blurb</label>
            <textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "0.5rem",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid var(--glass-border)",
                borderRadius: "6px",
                color: "var(--gold-bright)",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--gold-dim)" }}>
              Thumbnail image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              style={{ color: "var(--gold-dim)" }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.25rem", color: "var(--gold-dim)" }}>
              PDF file *
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              required
              style={{ color: "var(--gold-dim)" }}
            />
          </div>
          <button
            type="submit"
            disabled={posting}
            style={{
              padding: "0.5rem 1.25rem",
              background: "var(--mag-primary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "6px",
              color: "#fff",
              cursor: posting ? "wait" : "pointer",
            }}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: "var(--gold-dim)" }}>Loading…</p>
      ) : issues.length === 0 ? (
        <p style={{ color: "var(--gold-dim)" }}>No magazine issues yet.</p>
      ) : (
        <div className="fat-magazine-issues-list">
          {issues.map((issue) => {
            const releaseFormatted = issue.releaseDate
              ? new Date(issue.releaseDate).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : "";
            return (
              <article key={issue.id} style={issueItemStyle} className="fat-magazine-issue-item">
                <h2 style={{ fontSize: "1.2rem", margin: "0 0 0.5rem", color: "var(--gold-bright)" }}>
                  {issue.title}
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                  <div className="fat-magazine-issue-thumb">
                    <Link href={`/magazine/${issue.slug}`} style={thumbLinkStyle}>
                      {issue.thumbnailUrl ? (
                        <img
                          src={issue.thumbnailUrl}
                          alt={issue.title}
                          style={thumbImgStyle}
                        />
                      ) : (
                        <div
                          style={{
                            ...thumbImgStyle,
                            width: 200,
                            height: 260,
                            background: "var(--glass)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--gold-dim)",
                          }}
                        >
                          No cover
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="fat-magazine-issue-blurb" style={{ flex: "1", minWidth: 200 }}>
                    {releaseFormatted && (
                      <p style={releaseStyle}>Release date: {releaseFormatted}</p>
                    )}
                    {issue.blurb ? (
                      <p style={blurbStyle}>{issue.blurb}</p>
                    ) : (
                      <p style={blurbStyle}>Read the latest issue of Food & Travel Magazine.</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
