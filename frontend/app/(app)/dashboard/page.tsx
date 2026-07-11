"use client";

import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import {
  apiErrorMessage,
  isForbiddenApiKeyError,
} from "@/lib/api";
import {
  createChatSession,
  getChatMessages,
  sendChatMessage,
} from "@/lib/chat-api";
import {
  getAccessToken,
  getCurrentSessionId,
  setCurrentSessionId,
  clearCurrentSessionId,
} from "@/lib/auth-storage";
import type { ChatMessage } from "@/lib/types/chat";
import { mapMessageRows } from "@/lib/types/chat";

function DashboardInner() {
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const newChatRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get("session");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("New Chat");
  const [domainKey, setDomainKey] = useState<string>("rera");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [pendingAssistantId, setPendingAssistantId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    queueMicrotask(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  useEffect(() => {
    function handleNewChatRequest() {
      if (newChatRef.current) return;
      newChatRef.current = true;

      setMessages([]);
      setError(null);
      setInput("");
      setPendingAssistantId(null);
      if (busyRef.current) {
        setBusy(false);
        busyRef.current = false;
      }

      createChatSession({ domain_key: "rera" })
        .then((created) => {
          if (!created?.session) {
            setError("Could not start a new chat session.");
            return;
          }
          setCurrentSessionId(created.session.id);
          setSessionId(created.session.id);
          setSessionTitle(created.session.title);
          setDomainKey(created.session.domain_key);
          router.push(`/dashboard?session=${created.session.id}`, { scroll: false });
          window.dispatchEvent(new CustomEvent("chat-sessions-changed"));
          requestAnimationFrame(() => {
            document.getElementById(inputId)?.focus();
          });
        })
        .catch((e: unknown) => {
          setError(apiErrorMessage(e));
        })
        .finally(() => {
          newChatRef.current = false;
        });
    }
    window.addEventListener("new-chat-requested", handleNewChatRequest);
    return () => {
      window.removeEventListener("new-chat-requested", handleNewChatRequest);
    };
  }, [router, inputId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAccessToken()) {
        setBooting(false);
        return;
      }
      setError(null);

      const urlSid = sessionParam ? Number(sessionParam) : NaN;

      if (Number.isFinite(urlSid) && urlSid > 0) {
        try {
          const data = await getChatMessages(urlSid);
          if (cancelled) return;
          if (!data?.session) {
            clearCurrentSessionId();
            setSessionId(null);
            setMessages([]);
            setError("Session not found.");
          } else {
            setCurrentSessionId(urlSid);
            setSessionId(data.session.id);
            setSessionTitle(data.session.title);
            setDomainKey(data.session.domain_key);
            setMessages(mapMessageRows(data.messages ?? []));
          }
        } catch (e: unknown) {
          if (cancelled) return;
          if (isForbiddenApiKeyError(e)) {
            setError(
              "API key rejected — check NEXT_PUBLIC_X_API_KEY matches the backend X_API_KEY.",
            );
          } else {
            setError(apiErrorMessage(e));
          }
        } finally {
          if (!cancelled) setBooting(false);
        }
        return;
      }

      const storedSid = getCurrentSessionId();
      if (storedSid !== null) {
        router.replace(`/dashboard?session=${storedSid}`, { scroll: false });
        if (!cancelled) setBooting(false);
        return;
      }

      try {
        const created = await createChatSession({ domain_key: "rera" });
        if (cancelled) return;
        if (!created?.session) {
          setError("Could not start a chat session.");
        } else {
          setCurrentSessionId(created.session.id);
          setSessionId(created.session.id);
          setSessionTitle(created.session.title);
          setDomainKey(created.session.domain_key);
          setMessages([]);
          window.dispatchEvent(new CustomEvent("chat-sessions-changed"));
          router.replace(`/dashboard?session=${created.session.id}`, {
            scroll: false,
          });
        }
      } catch (e: unknown) {
        if (cancelled) return;
        if (isForbiddenApiKeyError(e)) {
          setError(
            "API key rejected — check NEXT_PUBLIC_X_API_KEY matches the backend X_API_KEY.",
          );
        } else {
          setError(apiErrorMessage(e));
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionParam, router]);

  async function sendQuestion(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busyRef.current || sessionId == null) return;
    busyRef.current = true;

    const userMsg: ChatMessage = {
      id: `u-${crypto.randomUUID()}`,
      role: "user",
      text: q,
      createdAt: new Date().toISOString(),
    };
    const placeholderId = `a-pending-${crypto.randomUUID()}`;
    const placeholder: ChatMessage = {
      id: placeholderId,
      role: "assistant",
      text: "",
      sources: { agent_steps: [] },
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setPendingAssistantId(placeholderId);
    setInput("");
    scrollToBottom();
    setBusy(true);
    setError(null);

    try {
      const data = await sendChatMessage(sessionId, q);
      if (!data?.assistant_message) {
        throw new Error("No assistant reply");
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: `a-${data.assistant_message.id}`,
                role: "assistant",
                text: data.assistant_message.content,
                sources: data.assistant_message.sources ?? undefined,
                createdAt: data.assistant_message.created_at,
              }
            : m,
        ),
      );
      if (sessionTitle === "New Chat") {
        const newTitle = q.trim().replace(/\s+/g, " ").slice(0, 50) + (q.trim().replace(/\s+/g, " ").length > 50 ? "…" : "");
        setSessionTitle(newTitle);
        window.dispatchEvent(new CustomEvent("chat-sessions-changed"));
      }
      scrollToBottom();
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.filter((m) => m.id !== userMsg.id && m.id !== placeholderId),
      );
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
      setPendingAssistantId(null);
      busyRef.current = false;
    }
  }

  if (booting) {
    return (
      <div className="chat-page">
        <p className="muted">Starting chat session…</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-page__header">
        <div className="chat-page__badges">
          <span className="chat-badge chat-badge--agents">Multi-agent RAG</span>
          <span className="chat-badge">{domainKey}</span>
        </div>
        <h1 className="chat-page__title">{sessionTitle || "RERA project assistant"}</h1>
        <p className="chat-page__subtitle muted">
          LangGraph agents analyze your conversation history, retrieve records, grade relevance,
          and synthesize answers from the Document knowledge base.
        </p>
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="chat-page__surface card">
        <div
          className="chat-thread"
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty__icon" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
                  <path d="M12 3a9 9 0 019 9c0 5-4 9-9 11-5-2-9-6-9-11a9 9 0 019-9z" strokeLinejoin="round" />
                  <path d="M9 11h6M9 15h6" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="chat-empty__title">Ask About the Company Policies</h2>
              <p className="chat-empty__text muted">
                Try follow-ups like &ldquo;What is the company&rsquo;s code of conduct?&rdquo;              </p>
            </div>
          ) : (
            <ul className="chat-messages">
              {messages.map((m) => (
                <ChatBubble
                  key={m.id}
                  message={m}
                  liveSteps={busy && m.id === pendingAssistantId}
                />
              ))}
            </ul>
          )}
        </div>

        <ChatComposer
          inputId={inputId}
          value={input}
          onChange={setInput}
          onSubmit={sendQuestion}
          busy={busy}
          disabled={sessionId == null}
          placeholder="Ask anything"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="chat-page">
          <p className="muted">Loading dashboard…</p>
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
