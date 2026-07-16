"use client";

import { Suspense, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { DotSquaresBrandLogo } from "@/components/DotSquaresBrandLogo";
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

const ALL_SUGGESTED_PROMPTS = [
  "What are the company policies?",
  "Explain the leave and attendance policy.",
  "What is the work from home policy?",
  "Who is the CEO and Founder of DotSquares?",
  "Who are the Directors of DotSquares?",
  "Tell me about DotSquares.",
  "What services does DotSquares provide?",
  "Explain the company code of conduct.",
  "What is the privacy policy?",
  "What are the information security policies?",
  "Explain the employee onboarding process.",
  "What are the project management guidelines?",
  "What coding standards should developers follow?",
  "What is the QA process at DotSquares?",
  "What are the HR policies?",
  "What are the company values?",
  "Explain the appraisal process.",
  "What are the office working hours?",
  "What is the leave approval process?",
];

function DashboardInner() {
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
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

  const suggestedPrompts = useMemo(() => {
    const shuffled = [...ALL_SUGGESTED_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, []);

  const scrollToBottom = useCallback(() => {
    queueMicrotask(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

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

  async function sendQuestion(e: React.FormEvent, overrideText?: string) {
    e.preventDefault();
    const q = (overrideText ?? input).trim();
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

  function handleSuggestedPrompt(prompt: string) {
    setInput(prompt);
    sendQuestion({ preventDefault: () => {} } as React.FormEvent, prompt);
  }

  if (booting) {
    return (
      <div className="chat-page">
        <p className="muted">Starting chat session…</p>
      </div>
    );
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="chat-page">
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="chat-page__surface">
        <div
          className="chat-thread"
          ref={listRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {showWelcome ? (
            <div className="chat-page__welcome">
              <DotSquaresBrandLogo />
              <h1>How can I help you today?</h1>
              <p>
                Ask me anything about Dotsquares projects, policies, or achivements.
              </p>
              <div className="suggested-prompts">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="suggested-prompt"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <span className="suggested-prompt__icon" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </span>
                    {prompt}
                  </button>
                ))}
              </div>
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
          placeholder="Message DotSquares AI…"
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
