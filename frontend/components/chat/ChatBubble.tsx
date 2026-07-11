"use client";

import { AgentStepTimeline } from "@/components/chat/AgentStepTimeline";
import { SourcePanel } from "@/components/chat/SourcePanel";
import type { ChatMessage } from "@/lib/types/chat";
import { formatMessageTime } from "@/lib/types/chat";

type Props = {
  message: ChatMessage;
  liveSteps?: boolean;
};

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
      <div className="chat-bubble__head">
        <span className="chat-bubble__role">{isUser ? "You" : "Assistant"}</span>
        {message.createdAt ? (
          <time className="chat-bubble__time" dateTime={message.createdAt}>
            {formatMessageTime(message.createdAt)}
          </time>
        ) : null}
      </div>
      <p className="chat-bubble__text">{message.text}</p>
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
    </li>
  );
}
