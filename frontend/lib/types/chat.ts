export type SourceChunk = {
  rank: number;
  score: number;
  semantic_score?: number;
  bm25_score?: number;
  meta: Record<string, unknown>;
  preview: string;
};

export type AgentStep = {
  agent: string;
  label: string;
  status: string;
  detail: string;
  duration_ms?: number;
};

export type MessageSources = {
  chunks?: SourceChunk[];
  agent_steps?: AgentStep[];
  history_summary?: string | null;
  rewritten_query?: string | null;
};

export type ChatSessionRow = {
  id: number;
  title: string;
  domain_key: string;
  created_at: string;
  updated_at: string;
  last_preview?: string | null;
  message_count?: number | null;
};

export type ChatMessageRow = {
  id: number;
  role: string;
  content: string;
  sources?: MessageSources | null;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: MessageSources;
  createdAt?: string;
};

export function mapMessageRows(rows: ChatMessageRow[]): ChatMessage[] {
  return rows.map((m) => ({
    id: `db-${m.id}`,
    role: m.role as "user" | "assistant",
    text: m.content,
    sources: m.sources ?? undefined,
    createdAt: m.created_at,
  }));
}

export function formatMessageTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export const AGENT_LABELS: Record<string, string> = {
  history_analyst: "History Analyst",
  retriever: "Retriever",
  grader: "Relevance Grader",
  query_optimizer: "Query Optimizer",
  synthesizer: "Answer Synthesizer",
};

export type DateGroup = {
  label: string;
  sessions: ChatSessionRow[];
};

const MS_PER_DAY = 86_400_000;

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_PER_DAY);
}

export function groupSessionsByDate(sessions: ChatSessionRow[]): DateGroup[] {
  const now = new Date();
  const todayStart = startOfDay(now);

  const groups: Record<string, ChatSessionRow[]> = {
    "Today": [],
    "Yesterday": [],
    "Previous 7 Days": [],
    "Previous 30 Days": [],
    "Older": [],
  };

  for (const s of sessions) {
    const d = new Date(s.updated_at);
    const diff = daysBetween(todayStart, d);

    if (diff === 0) {
      groups["Today"].push(s);
    } else if (diff === 1) {
      groups["Yesterday"].push(s);
    } else if (diff <= 7) {
      groups["Previous 7 Days"].push(s);
    } else if (diff <= 30) {
      groups["Previous 30 Days"].push(s);
    } else {
      groups["Older"].push(s);
    }
  }

  return Object.entries(groups)
    .filter(([, sessions]) => sessions.length > 0)
    .map(([label, sessions]) => ({ label, sessions }));
}
