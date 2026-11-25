import { auth } from "../../firebase/firebase";

/** Backend address; set VITE_API_BASE in .env for a deployed backend. */
export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5000").replace(/\/$/, "");

/** fetch() against the backend, sending the signed-in user's Firebase ID token. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  await auth.authStateReady();
  const headers = new Headers(init.headers);
  const user = auth.currentUser;
  if (user) headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/** POST JSON and return the parsed reply; throws with the backend's error message. */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

/** POST a FormData body (file uploads) and return the parsed reply. */
export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const res = await apiFetch(path, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}
