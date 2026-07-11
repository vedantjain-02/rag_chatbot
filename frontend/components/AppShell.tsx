"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ApiKeySetupNotice } from "@/components/ApiKeySetupNotice";
import { isPublicApiKeyConfigured } from "@/lib/api";
import {
  clearAuthSession,
  getAccessToken,
  getUserSnapshot,
  UserSnapshot,
} from "@/lib/auth-storage";
import {
  listChatSessions,
  backfillSessionTitles,
  updateSessionTitle,
  deleteSession,
} from "@/lib/chat-api";
import type { ChatSessionRow } from "@/lib/types/chat";
import { groupSessionsByDate } from "@/lib/types/chat";

type NavKey = "dashboard" | "profile";

const navItems: { href: string; label: string; key: NavKey }[] = [
  { href: "/profile", label: "Profile", key: "profile" },
];

const MAX_RECENTS = 20;

function getActiveSessionId(pathname: string, search: string): number | null {
  if (!pathname.startsWith("/dashboard")) return null;
  const m = search.match(/[?&]session=(\d+)/);
  return m ? Number(m[1]) : null;
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<UserSnapshot | null>(null);
  const [sessions, setSessions] = useState<ChatSessionRow[]>([]);

  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [recentsOpen, setRecentsOpen] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSessionId = getActiveSessionId(
    pathname ?? "",
    searchParams?.toString() ? `?${searchParams!.toString()}` : "",
  );

  const refreshSessions = useCallback(async () => {
    if (!getAccessToken()) return;
    try {
      const data = await listChatSessions();
      setSessions(data?.sessions ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const t = getAccessToken();
    const next =
      pathname && pathname.startsWith("/")
        ? pathname
        : "/dashboard";
    if (!t) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setSnapshot(getUserSnapshot());
    setReady(true);
  }, [router, pathname]);

  useEffect(() => {
    if (!ready) return;
    backfillSessionTitles().catch(() => {});
    refreshSessions();
  }, [ready, refreshSessions]);

  useEffect(() => {
    function handleRefresh() {
      refreshSessions();
    }
    window.addEventListener("chat-sessions-changed", handleRefresh);
    return () => {
      window.removeEventListener("chat-sessions-changed", handleRefresh);
    };
  }, [refreshSessions]);

  useEffect(() => {
    if (menuOpen === null) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (renamingId !== null && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  function logout() {
    clearAuthSession();
    router.replace("/login");
  }

  function handleNewChat() {
    window.dispatchEvent(new CustomEvent("new-chat-requested"));
  }

  function openMenu(e: React.MouseEvent, sessionId: number) {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(sessionId);
  }

  async function handleRename(id: number) {
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    setRenamingId(id);
    setRenameValue(session.title || "");
    setMenuOpen(null);
  }

  async function commitRename() {
    if (renamingId === null) return;
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== (sessions.find((s) => s.id === renamingId)?.title || "")) {
      try {
        await updateSessionTitle(renamingId, trimmed);
        setSessions((prev) =>
          prev.map((s) => (s.id === renamingId ? { ...s, title: trimmed } : s)),
        );
      } catch {
        // silent
      }
    }
    setRenamingId(null);
    setRenameValue("");
  }

  async function handleDelete(id: number) {
    setMenuOpen(null);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        clearCurrentSessionId();
        router.push("/dashboard");
      }
    } catch {
      // silent
    }
  }

  function clearCurrentSessionId() {
    try {
      localStorage.removeItem("rag_chatbot_session_id");
    } catch {
      // silent
    }
  }

  if (!ready) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  const needsKeyBanner = !isPublicApiKeyConfigured();
  const displaySessions = sessions.slice(0, MAX_RECENTS);
  const grouped = groupSessionsByDate(displaySessions);

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Main navigation">
        {/* 1. Logo */}
        <div className="app-sidebar__brand">
          <Link href="/dashboard" className="app-sidebar__logo">
            <img
              src="/images/dotsquares-icon-40.png"
              alt=""
              className="app-sidebar__logo-mark"
              width={40}
              height={40}
            />
            <span className="app-sidebar__logo-text">DS Chatbot</span>
          </Link>
        </div>

        {/* 2. User email */}
        {snapshot?.email && (
          <p className="app-sidebar__user">{snapshot.email}</p>
        )}

        {/* 3. Profile link */}
        <nav className="app-sidebar__nav">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href) ?? false;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "app-sidebar__link app-sidebar__link--active"
                    : "app-sidebar__link"
                }
              >
                <SidebarIcon tab={item.key} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 4. New Chat button */}
        <button
          type="button"
          className="app-sidebar__new-chat"
          onClick={handleNewChat}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>

        {/* 5. Recents (collapsible) */}
        <div className="app-sidebar__recents">
          <button
            type="button"
            className="app-sidebar__recents-toggle"
            onClick={() => setRecentsOpen((o) => !o)}
            aria-expanded={recentsOpen}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Recents
            <svg
              className="app-sidebar__recents-chevron"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div
            className={`app-sidebar__recents-body ${recentsOpen ? "app-sidebar__recents-body--open" : ""}`}
          >
            <div className="app-sidebar__recents-inner">
              {grouped.length > 0 ? (
                grouped.map((group) => (
                  <div key={group.label} className="app-sidebar__group">
                    <p className="app-sidebar__group-label">{group.label}</p>
                    {group.sessions.map((s) => {
                      const isActive = s.id === activeSessionId;
                      const isRenaming = s.id === renamingId;
                      return (
                        <div
                          key={s.id}
                          className={`app-sidebar__session-wrap ${isActive ? "app-sidebar__session-wrap--active" : ""}`}
                        >
                          {isRenaming ? (
                            <input
                              ref={renameRef}
                              className="app-sidebar__rename-input"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={commitRename}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRename();
                                if (e.key === "Escape") setRenamingId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <Link
                              href={`/dashboard?session=${s.id}`}
                              className="app-sidebar__session"
                              title={s.title || "Chat"}
                            >
                              <span className="app-sidebar__session-title">
                                {s.title || "Chat"}
                              </span>
                            </Link>
                          )}
                          {!isRenaming && (
                            <button
                              type="button"
                              className="app-sidebar__session-menu-btn"
                              onClick={(e) => openMenu(e, s.id)}
                              aria-label="Session options"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="app-sidebar__recents-empty">No conversations yet</p>
              )}
            </div>
          </div>
        </div>

        {/* 6. Logout */}
        <div className="app-sidebar__footer">
          <button
            type="button"
            className="app-sidebar__logout"
            onClick={logout}
          >
            <SidebarLogoutIcon />
            Log out
          </button>
        </div>
      </aside>

      {/* Context menu */}
      {menuOpen !== null && (
        <div
          ref={menuRef}
          className="app-sidebar__context-menu"
          style={{ top: menuPos.y, left: menuPos.x }}
        >
          <button
            type="button"
            className="app-sidebar__context-menu-item"
            onClick={() => handleRename(menuOpen)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Rename
          </button>
          <button
            type="button"
            className="app-sidebar__context-menu-item app-sidebar__context-menu-item--danger"
            onClick={() => handleDelete(menuOpen)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            Delete
          </button>
        </div>
      )}

      <div className="app-shell__main">
        {needsKeyBanner && (
          <div className="app-shell__banner">
            <ApiKeySetupNotice scenario="missing-frontend-env" />
          </div>
        )}
        <main id="main-content" className="app-shell__content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="loading-screen"><p>Loading…</p></div>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

function SidebarIcon({ tab }: { tab: NavKey }) {
  switch (tab) {
    case "profile":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function SidebarLogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
