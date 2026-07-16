export const ACCESS_TOKEN_KEY = "access_token";
export const USER_SNAPSHOT_KEY = "rag_chatbot_user";
export const CURRENT_SESSION_KEY = "rag_chatbot_session_id";

export type UserSnapshot = {
  user_id: number;
  email: string;
  display_name: string | null;
  roles?: string[];
  profile_image_url?: string | null;
};

export function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function setAuthSession(token: string, user: UserSnapshot): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_SNAPSHOT_KEY);
  localStorage.removeItem(CURRENT_SESSION_KEY);
}

export function getUserSnapshot(): UserSnapshot | null {
  const raw = localStorage.getItem(USER_SNAPSHOT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSnapshot;
  } catch {
    return null;
  }
}

/** Patch fields on the cached user (e.g. after profile refresh or update). */
export function mergeUserSnapshot(patch: Partial<UserSnapshot>): void {
  const cur = getUserSnapshot();
  if (!cur) return;
  const next = { ...cur, ...patch };
  localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(next));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("user-snapshot-updated", { detail: next }));
  }
}

export function getCurrentSessionId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function setCurrentSessionId(id: number): void {
  localStorage.setItem(CURRENT_SESSION_KEY, String(id));
}

export function clearCurrentSessionId(): void {
  localStorage.removeItem(CURRENT_SESSION_KEY);
}
