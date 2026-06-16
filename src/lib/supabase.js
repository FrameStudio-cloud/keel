import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getAccessToken() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw)?.access_token ?? null;
  } catch {
    return null;
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => getAccessToken(),
});

export function getPersistedSession() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(session));
  } catch { /* noop */ }
}

export function clearPersistedSession() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (key) localStorage.removeItem(key);
    const mfaKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-mfa-token"));
    if (mfaKey) localStorage.removeItem(mfaKey);
    const expiresKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-expires-at"));
    if (expiresKey) localStorage.removeItem(expiresKey);
  } catch { /* noop */ }
}

export async function authSignUp(email, password) {
  const res = await window.fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: supabaseKey },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.error_description || "Sign up failed");
  return { user: data.user || data, session: data.access_token ? data : null };
}

export async function authResetPassword(email) {
  const res = await window.fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: supabaseKey },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.msg || data.error_description || "Reset failed");
  }
}

export async function authLogin(email, password) {
  const res = await window.fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: supabaseKey },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || err.msg || "Login failed");
  }
  const data = await res.json();
  saveSession(data);
  return data;
}

export async function authLogout(accessToken) {
  await window.fetch(`${supabaseUrl}/auth/v1/logout`, {
    method: "POST",
    headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
  });
  clearPersistedSession();
}
