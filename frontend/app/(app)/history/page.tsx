"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiErrorMessage, isForbiddenApiKeyError } from "@/lib/api";
import { listChatSessions } from "@/lib/chat-api";
import { getAccessToken } from "@/lib/auth-storage";
import type { ChatSessionRow } from "@/lib/types/chat";
import { formatMessageTime } from "@/lib/types/chat";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSessionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAccessToken()) {
        setLoading(false);
        return;
      }
      try {
        const data = await listChatSessions();
        if (cancelled) return;
        setSessions(data?.sessions ?? []);
      } catch (e: unknown) {
        if (cancelled) return;
        if (isForbiddenApiKeyError(e)) {
          setError("API key mismatch — check NEXT_PUBLIC_X_API_KEY.");
        } else {
          setError(apiErrorMessage(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="history-page">
      <header className="page-screen-header">
        <h1 className="page-screen-header__title">History</h1>
        <p className="muted">
          Past multi-agent conversations with full context — open any session to continue.
        </p>
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="muted">Loading conversations…</p>
      ) : sessions.length === 0 ? (
        <section className="card history-empty">
          <div className="history-empty__inner">
            <div className="history-empty__glyph" aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <h2>No history yet</h2>
            <p className="muted">
              Start a chat on the <Link href="/dashboard">Dashboard</Link> — sessions will appear here.
            </p>
          </div>
        </section>
      ) : (
        <ul className="history-list">
          {sessions.map((s) => (
            <li key={s.id} className="card history-card">
              <div className="history-card__main">
                <div className="history-card__top">
                  <h2 className="history-card__title">{s.title || "Chat"}</h2>
                  <span className="chat-badge">{s.domain_key}</span>
                </div>
                <p className="history-card__preview muted">
                  {s.last_preview || "No messages yet"}
                </p>
                <p className="history-card__meta hint">
                  {s.message_count ?? 0} message{(s.message_count ?? 0) === 1 ? "" : "s"} ·{" "}
                  Updated {formatMessageTime(s.updated_at)}
                </p>
              </div>
              <Link className="btn-ghost btn-sm history-card__action" href={`/dashboard?session=${s.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
