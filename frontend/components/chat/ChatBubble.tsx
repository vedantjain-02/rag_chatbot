"use client";

import { useCallback, useState } from "react";
import { AgentStepTimeline } from "@/components/chat/AgentStepTimeline";
import { SourcePanel } from "@/components/chat/SourcePanel";
import type { ChatMessage } from "@/lib/types/chat";
import { formatMessageTime } from "@/lib/types/chat";
import Markdown from "react-markdown";

type Props = {
  message: ChatMessage;
  liveSteps?: boolean;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  }, [text]);

  return (
    <button
      type="button"
      className="code-block-copy"
      onClick={handleCopy}
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function extractTextFromCode(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractTextFromCode).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props
  ) {
    return extractTextFromCode(children.props.children);
  }
  return "";
}

export function ChatBubble({ message, liveSteps = false }: Props) {
  const isUser = message.role === "user";
  const steps = message.sources?.agent_steps ?? [];
  const chunks = (message.sources?.chunks ?? []) as import("@/lib/types/chat").SourceChunk[];

  return (
    <li
      className={
        isUser
          ? "chat-bubble chat-bubble--user"
          : "chat-bubble chat-bubble--assistant"
      }
    >
      <div className="chat-bubble__avatar" aria-hidden="true">
        {isUser ? "You" : "AI"}
      </div>
      <div className="chat-bubble__body">
        {isUser ? (
          <p className="chat-bubble__text">{message.text}</p>
        ) : (
          <div className="chat-bubble__text chat-bubble__markdown">
            <Markdown
              components={{
                pre({ children }) {
                  const child = children as React.ReactElement;
                  if (
                    child &&
                    typeof child === "object" &&
                    "props" in child &&
                    child.props
                  ) {
                    const codeText = extractTextFromCode(child.props.children);
                    const langMatch = (child.props.className || "").match(/language-(\w+)/);
                    const lang = langMatch ? langMatch[1] : "";
                    return (
                      <pre>
                        <div className="code-block-header">
                          <span>{lang}</span>
                          <CopyButton text={codeText} />
                        </div>
                        {children}
                      </pre>
                    );
                  }
                  return <pre>{children}</pre>;
                },
              }}
            >
              {message.text}
            </Markdown>
          </div>
        )}
        {!isUser && (liveSteps || steps.length > 0) ? (
          <AgentStepTimeline steps={steps} live={liveSteps} />
        ) : null}
        {!isUser && chunks.length > 0 ? (
          <SourcePanel
            chunks={chunks}
            rewrittenQuery={message.sources?.rewritten_query}
            historySummary={message.sources?.history_summary}
          />
        ) : null}
      </div>
    </li>
  );
}
