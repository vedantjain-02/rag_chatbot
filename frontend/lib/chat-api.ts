import { apiJson, unwrapApiData } from "./api";
import { getAccessToken } from "./auth-storage";
import type { ChatMessageRow, ChatSessionRow } from "./types/chat";

export type { ChatMessageRow, ChatSessionRow } from "./types/chat";

const auth = () => getAccessToken();

export async function createChatSession(
  opts?: { title?: string; domain_key?: string },
): Promise<{ session: ChatSessionRow } | undefined> {
  const raw = await apiJson("/users/api/chat/sessions", {
    method: "POST",
    auth: auth(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts ?? {}),
  });
  return unwrapApiData<{ session: ChatSessionRow }>(raw);
}

export async function listChatSessions(): Promise<{ sessions: ChatSessionRow[] } | undefined> {
  const raw = await apiJson("/users/api/chat/sessions", { auth: auth() });
  return unwrapApiData<{ sessions: ChatSessionRow[] }>(raw);
}

export async function getChatMessages(sessionId: number): Promise<
  | {
      session: ChatSessionRow;
      messages: ChatMessageRow[];
    }
  | undefined
> {
  const raw = await apiJson(`/users/api/chat/sessions/${sessionId}/messages`, {
    auth: auth(),
  });
  return unwrapApiData<{ session: ChatSessionRow; messages: ChatMessageRow[] }>(
    raw,
  );
}

export async function sendChatMessage(
  sessionId: number,
  content: string,
): Promise<
  | {
      user_message: ChatMessageRow;
      assistant_message: ChatMessageRow;
    }
  | undefined
> {
  const raw = await apiJson(`/users/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    auth: auth(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return unwrapApiData<{
    user_message: ChatMessageRow;
    assistant_message: ChatMessageRow;
  }>(raw);
}

export async function updateSessionTitle(
  sessionId: number,
  title: string,
): Promise<{ session: ChatSessionRow } | undefined> {
  const raw = await apiJson(`/users/api/chat/sessions/${sessionId}`, {
    method: "PATCH",
    auth: auth(),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return unwrapApiData<{ session: ChatSessionRow }>(raw);
}

export async function backfillSessionTitles(): Promise<{ updated: number } | undefined> {
  const raw = await apiJson("/users/api/chat/sessions/backfill-titles", {
    method: "POST",
    auth: auth(),
  });
  return unwrapApiData<{ updated: number }>(raw);
}

export async function deleteSession(
  sessionId: number,
): Promise<boolean> {
  await apiJson(`/users/api/chat/sessions/${sessionId}`, {
    method: "DELETE",
    auth: auth(),
  });
  return true;
}
