"use client";

import { useCallback, useEffect, useRef } from "react";

type Props = {
  inputId: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatComposer({
  inputId,
  value,
  onChange,
  onSubmit,
  busy,
  disabled = false,
  placeholder = "Message DotSquares AI…",
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !busy && !disabled) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  }

  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Your question
      </label>
      <div className="chat-composer__field">
        <div className="chat-composer__textarea-wrap">
          <textarea
            ref={textareaRef}
            id={inputId}
            className="chat-composer__textarea"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy || disabled}
            rows={1}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="chat-composer__send"
          aria-label="Send message"
          disabled={busy || disabled || !value.trim()}
        >
          {busy ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          )}
        </button>
      </div>
      {busy ? (
        <div className="chat-composer__loading">
          <span className="chat-composer__loading-dot" />
          <span className="chat-composer__loading-dot" />
          <span className="chat-composer__loading-dot" />
        </div>
      ) : (
        <p className="chat-composer__hint">
          Press <kbd className="kbd">Enter</kbd> to send, <kbd className="kbd">Shift+Enter</kbd> for new line
        </p>
      )}
    </form>
  );
}
