"use client";

import { useState } from "react";

import type { SourceChunk } from "@/lib/types/chat";

type Props = {
  chunks: SourceChunk[];
  rewrittenQuery?: string | null;
  historySummary?: string | null;
};

export function SourcePanel({ chunks, rewrittenQuery, historySummary }: Props) {
  const [open, setOpen] = useState(false);

  if (!chunks.length && !rewrittenQuery && !historySummary) return null;

  return (
    <div className="source-panel">
      <button
        type="button"
        className="source-panel__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {chunks.length} source{chunks.length === 1 ? "" : "s"}
        {open ? " ▴" : " ▾"}
      </button>

      {open ? (
        <div className="source-panel__body">
          {historySummary ? (
            <p className="source-panel__meta">
              <strong>Context used:</strong> {historySummary}
            </p>
          ) : null}
          {rewrittenQuery ? (
            <p className="source-panel__meta">
              <strong>Search query:</strong> {rewrittenQuery}
            </p>
          ) : null}
          <ul className="source-panel__list">
            {chunks.map((c) => (
              <li key={c.rank} className="source-panel__chunk">
                <div className="source-panel__chunk-head">
                  <span>#{c.rank}</span>
                  <span className="source-panel__score">
                    hybrid {c.score.toFixed(3)}
                    {(c.semantic_score ?? c.meta?.semantic_score) != null
                      ? ` · sem ${Number(c.semantic_score ?? c.meta?.semantic_score).toFixed(2)}`
                      : ""}
                    {(c.bm25_score ?? c.meta?.bm25_score) != null
                      ? ` · bm25 ${Number(c.bm25_score ?? c.meta?.bm25_score).toFixed(2)}`
                      : ""}
                  </span>
                </div>
                <p className="source-panel__preview">{c.preview}</p>
                {c.meta && Object.keys(c.meta).length > 0 ? (
                  <dl className="source-panel__meta-grid">
                    {Object.entries(c.meta)
                      .slice(0, 6)
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{String(v)}</dd>
                        </div>
                      ))}
                  </dl>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
