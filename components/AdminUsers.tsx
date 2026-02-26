"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Sort = "signup" | "signupAsc" | "avgScore" | "postCount";

export default function AdminUsers() {
  const [users, setUsers] = useState<{
    id: string;
    username: string;
    email: string;
    phone: string | null;
    lastIpAddress: string | null;
    postCount: number;
    avgScore: number;
    createdAt: string;
    banned: boolean | null;
    isModerator: boolean;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<Sort>("signup");
  const [authorModal, setAuthorModal] = useState<{ userId: string; username: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadUsers();
  }, [sort]);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch(`/api/admin/users?sort=${sort}`, { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleAction(action: string, userId: string, banUntil?: string) {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action, userId, banUntil }),
    });
    if (res.ok) loadUsers();
  }

  async function handleAuthor(userId: string, categoryId: string) {
    const res = await fetch(`/api/admin/users/${userId}/moderator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ categoryId }),
    });
    if (res.ok) {
      setAuthorModal(null);
      setSelectedCategory("");
      loadUsers();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed");
    }
  }

  return (
    <div className="glass-panel" style={{ padding: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <label style={{ fontSize: "0.85rem", color: "var(--gold-dim)" }}>Sort by:</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          style={{
            padding: "0.35rem 0.75rem",
            background: "var(--glass)",
            border: "1px solid var(--glass-border)",
            borderRadius: "6px",
            color: "var(--gold-bright)",
            fontSize: "0.85rem",
          }}
        >
          <option value="signup">Newest first</option>
          <option value="signupAsc">Oldest first</option>
          <option value="avgScore">Avg score (high→low)</option>
          <option value="postCount">Post count (high→low)</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: "var(--gold-dim)", padding: "2rem" }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.85rem", color: "var(--gold-dim)" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid var(--glass-border)" }}>
                <th style={{ padding: "0.5rem 0.5rem 0.5rem 0" }}>Username</th>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}>Phone</th>
                <th style={{ padding: "0.5rem" }}>IP Address</th>
                <th style={{ padding: "0.5rem" }}>Posts</th>
                <th style={{ padding: "0.5rem" }}>Avg Score</th>
                <th style={{ padding: "0.5rem" }}>Joined</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.5rem 0.5rem 0.5rem 0" }}>
                    <Link href={`/u/${u.username}`} style={{ color: "var(--gold-bright)" }}>
                      {u.username}
                    </Link>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{u.email}</td>
                  <td style={{ padding: "0.5rem" }}>{u.phone || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>{u.lastIpAddress || "—"}</td>
                  <td style={{ padding: "0.5rem" }}>{u.postCount}</td>
                  <td style={{ padding: "0.5rem" }}>{u.avgScore}</td>
                  <td style={{ padding: "0.5rem" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {u.banned ? (
                      <span style={{ color: "#e5534b" }}>Banned</span>
                    ) : u.isModerator ? (
                      <span style={{ color: "var(--mag-primary, var(--gold))" }}>Author</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {u.banned ? (
                      <button
                        onClick={() => handleAction("unban", u.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          background: "var(--glass)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "4px",
                          color: "var(--gold-bright)",
                          cursor: "pointer",
                        }}
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("ban", u.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          background: "rgba(229,83,75,0.2)",
                          border: "1px solid #e5534b",
                          borderRadius: "4px",
                          color: "#e5534b",
                          cursor: "pointer",
                        }}
                      >
                        Ban
                      </button>
                    )}
                    <button
                      onClick={() => setAuthorModal({ userId: u.id, username: u.username })}
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "var(--glass)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "4px",
                        color: "var(--gold-bright)",
                        cursor: "pointer",
                      }}
                    >
                      Author
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Permanently delete this user?")) handleAction("delete", u.id);
                      }}
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "rgba(229,83,75,0.2)",
                        border: "1px solid #e5534b",
                        borderRadius: "4px",
                        color: "#e5534b",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {authorModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setAuthorModal(null)}
        >
          <div
            className="glass-panel"
            style={{ padding: "1.5rem", minWidth: "320px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", color: "var(--mag-primary, var(--gold))" }}>
              Make {authorModal.username} author of
            </h3>
            <input
              type="text"
              placeholder="Category ID (e.g. delicious-food)"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginBottom: "1rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid var(--glass-border)",
                borderRadius: "6px",
                color: "var(--gold-bright)",
                fontSize: "0.9rem",
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--gold-dim)", marginBottom: "1rem" }}>
              Toggle: add author for a category or remove if already author. Enter category ID.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setAuthorModal(null)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--glass)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  color: "var(--gold-dim)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => selectedCategory && handleAuthor(authorModal.userId, selectedCategory)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--mag-primary, #530b0f)",
                  border: "1px solid var(--mag-primary, #530b0f)",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Add / Toggle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
