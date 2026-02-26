"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

type UserInfo = { username: string; isAdmin: boolean; isModerator: boolean };
type CategoryChild = { id: string; name: string; slug?: string; children?: CategoryChild[] };
type CategoryWithSection = { id: string; name: string; menuSection?: string; children: CategoryChild[] };
type Section = { id: string; name: string; sortOrder?: number };

const MENU_PRIMARY = "#530b0f";

export default function Sidebar() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [categoryTree, setCategoryTree] = useState<CategoryWithSection[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  function loadData() {
    const cacheBust = `_t=${Date.now()}`;
    const safeJson = (r: Response) => r.text().then((t) => { try { return t ? JSON.parse(t) : {}; } catch { return {}; } });
    Promise.all([
      fetch(`/api/categories?${cacheBust}`, { cache: "no-store" }).then(safeJson),
      fetch(`/api/menu-sections?${cacheBust}`, { cache: "no-store" }).then(safeJson),
    ])
      .then(([catData, secData]) => {
        setCategoryTree(Array.isArray(catData?.tree) ? catData.tree : []);
        const secs = Array.isArray(secData?.sections) ? secData.sections : [];
        setSections(secs.length > 0 ? secs : [{ id: "main", name: "Main", sortOrder: 0 }]);
      })
      .catch(() => {
        setCategoryTree([]);
        setSections([{ id: "main", name: "Main", sortOrder: 0 }]);
      });
  }

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("categories-updated", handler);
    return () => window.removeEventListener("categories-updated", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      fetch("/api/me", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => setUser(d.user))
        .catch(() => setUser(null));
    };
    window.addEventListener("user-updated", handler);
    return () => window.removeEventListener("user-updated", handler);
  }, []);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const norm = (s: string | null | undefined) => (s == null ? "" : String(s).trim().toLowerCase());

  return (
    <aside
      className="glass-panel scrollbar-thin"
      style={{
        width: "280px",
        minWidth: "280px",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        borderRadius: 0,
        borderRight: `1px solid ${MENU_PRIMARY}33`,
        background: `linear-gradient(180deg, ${MENU_PRIMARY}22 0%, ${MENU_PRIMARY}11 100%)`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      {/* Logo on solid white so black logo is visible */}
      <Link
        href="/"
        style={{
          padding: "1rem",
          borderBottom: `1px solid ${MENU_PRIMARY}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          background: "#fff",
        }}
      >
        <Image
          src="/logo.png"
          alt="Food and Travel Magazine"
          width={180}
          height={80}
          style={{ objectFit: "contain" }}
        />
      </Link>

      {user && (
        <Link
          href={user.isAdmin ? "/dashboard" : `/u/${user.username}`}
          style={{
            display: "block",
            padding: "0.5rem 1rem",
            fontSize: "0.8rem",
            color: "var(--gold-dim)",
            borderBottom: `1px solid ${MENU_PRIMARY}33`,
          }}
        >
          {user.isAdmin ? "Admin" : user.isModerator ? "Author" : "Member"}
        </Link>
      )}

      <nav style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {(sections.length > 0 || categoryTree.length > 0)
          ? (() => {
              const sectionList = sections.length > 0 ? sections : [{ id: "main", name: "Main", sortOrder: 0 }];
              const sectionIds = new Set(sectionList.map((s) => norm(s.id)));
              const hasOther = categoryTree.some((cat) => !sectionIds.has(norm(cat.menuSection ?? "main")));
              const sectionsToRender = [
                ...sectionList,
                ...(hasOther ? [{ id: "__other__", name: "Other", sortOrder: 999 }] : []),
              ];
              return sectionsToRender.map((sec, sectionIndex) => {
                const secIdNorm = norm(sec.id);
                const catsInSection = categoryTree
                  .filter((cat) => {
                    const catSection = norm(cat.menuSection ?? "main");
                    if (sec.id === "__other__") return !sectionIds.has(catSection);
                    return catSection === secIdNorm;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name));

                return (
                  <div key={sec.id}>
                    <div
                      style={{
                        background: MENU_PRIMARY,
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textAlign: "left",
                        marginTop: sectionIndex > 0 ? "0.5rem" : 0,
                      }}
                    >
                      {sec.name}
                    </div>
                    {secIdNorm === "main" && (
                      <>
                        <Link
                          href="/"
                          style={{
                            display: "block",
                            padding: "0.5rem 1rem",
                            borderBottom: `1px solid ${MENU_PRIMARY}22`,
                            color: "var(--gold-bright)",
                            fontSize: "0.9rem",
                          }}
                        >
                          Home
                        </Link>
                        <Link
                          href="/c/all-random"
                          style={{
                            display: "block",
                            padding: "0.5rem 1rem",
                            borderBottom: `1px solid ${MENU_PRIMARY}22`,
                            color: "var(--gold-bright)",
                            fontSize: "0.9rem",
                          }}
                        >
                          Discover
                        </Link>
                      </>
                    )}
                    {catsInSection.map((cat) => {
                      const isOpen = openIds.has(cat.id);
                      const isLeaf = !cat.children || cat.children.length === 0;
                      if (isLeaf) {
                        return (
                          <Link
                            key={cat.id}
                            href={`/c/${cat.id}`}
                            style={{
                              display: "block",
                              padding: "0.5rem 1rem",
                              borderBottom: `1px solid ${MENU_PRIMARY}22`,
                              color: "var(--gold-bright)",
                              fontSize: "0.9rem",
                            }}
                          >
                            {cat.name}
                          </Link>
                        );
                      }
                      return (
                        <div key={cat.id}>
                          <button
                            onClick={() => toggle(cat.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "0.5rem 1rem",
                              background: "transparent",
                              border: "none",
                              borderBottom: `1px solid ${MENU_PRIMARY}22`,
                              color: "var(--gold-bright)",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              textAlign: "left",
                              minWidth: 0,
                            }}
                          >
                            <span style={{ flex: 1, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{cat.name}</span>
                            <span style={{ color: "var(--gold-dim)", fontSize: "1rem", lineHeight: 1 }}>
                              {isOpen ? "−" : "+"}
                            </span>
                          </button>
                          {isOpen && (
                            <div style={{ paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "0.5rem", animation: "fadeIn 0.3s ease-out" }}>
                              {cat.children.map((ch) =>
                                ch.children && ch.children.length > 0 ? (
                                  <div key={ch.id}>
                                    <button
                                      type="button"
                                      onClick={() => toggle(ch.id)}
                                      style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0.35rem 0",
                                        background: "none",
                                        border: "none",
                                        color: "var(--gold-dim)",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                        textAlign: "left",
                                      }}
                                    >
                                      <span>{ch.name}</span>
                                      <span style={{ fontSize: "0.9rem" }}>{openIds.has(ch.id) ? "−" : "+"}</span>
                                    </button>
                                    {openIds.has(ch.id) && (
                                      <div style={{ paddingLeft: "0.75rem", paddingBottom: "0.35rem" }}>
                                        {ch.children.map((gch) => (
                                          <Link
                                            key={gch.id}
                                            href={`/c/${gch.id}`}
                                            style={{
                                              display: "block",
                                              padding: "0.3rem 0",
                                              fontSize: "0.8rem",
                                              color: "var(--gold-dim)",
                                              overflowWrap: "break-word",
                                              wordBreak: "break-word",
                                            }}
                                          >
                                            {gch.name}
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Link
                                    key={ch.id}
                                    href={`/c/${ch.id}`}
                                    style={{
                                      display: "block",
                                      padding: "0.4rem 0",
                                      fontSize: "0.85rem",
                                      color: "var(--gold-dim)",
                                      borderBottom: `1px solid ${MENU_PRIMARY}18`,
                                      overflowWrap: "break-word",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {ch.name}
                                  </Link>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()
          : (
            <div style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--gold-dim)" }}>
              Loading menu...
            </div>
          )}
      </nav>
    </aside>
  );
}
