"use client";

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
  placeholder = "Ask a question…",
}: Props) {
  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Your question
      </label>
      <div className="chat-composer__field">
        <input
          id={inputId}
          type="text"
          className="chat-composer__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={busy || disabled}
          autoComplete="off"
        />
        <button
          type="submit"
          className="chat-composer__send primary"
          aria-label="Send message"
          disabled={busy || disabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <p className="chat-composer__hint muted">
        {busy ? "Agents are working…" : "Press "}
        {!busy ? (
          <>
            <kbd className="kbd">Enter</kbd> to send
          </>
        ) : null}
      </p>
    </form>
  );
}
