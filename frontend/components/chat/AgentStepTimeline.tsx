"use client";

import type { AgentStep } from "@/lib/types/chat";
import { AGENT_LABELS } from "@/lib/types/chat";

type Props = {
  steps: AgentStep[];
  live?: boolean;
};

export function AgentStepTimeline({ steps, live = false }: Props) {
  if (!steps.length && !live) return null;

  const display = live && steps.length === 0
    ? [{ agent: "history_analyst", label: "History Analyst", status: "running", detail: "Analyzing conversation…" }]
    : steps;

  return (
    <div className="agent-steps" aria-label="Agent pipeline steps">
      <p className="agent-steps__title">Multi-agent pipeline</p>
      <ol className="agent-steps__list">
        {display.map((step, i) => (
          <li key={`${step.agent}-${i}`} className="agent-steps__item">
            <span className="agent-steps__dot" aria-hidden="true" />
            <div className="agent-steps__body">
              <span className="agent-steps__label">
                {step.label || AGENT_LABELS[step.agent] || step.agent}
              </span>
              <span className="agent-steps__detail">{step.detail}</span>
              {step.duration_ms != null ? (
                <span className="agent-steps__time">{step.duration_ms} ms</span>
              ) : null}
            </div>
          </li>
        ))}
        {live ? (
          <li className="agent-steps__item agent-steps__item--live">
            <span className="agent-steps__dot agent-steps__dot--pulse" aria-hidden="true" />
            <div className="agent-steps__body">
              <span className="agent-steps__label">Working…</span>
            </div>
          </li>
        ) : null}
      </ol>
    </div>
  );
}
