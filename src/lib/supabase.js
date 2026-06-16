import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

function getAccessToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch { /* noop */ }
}

export function clearPersistedSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    const mfaKey = STORAGE_KEY.replace("-auth-token", "-mfa-token");
    localStorage.removeItem(mfaKey);
    const expiresKey = STORAGE_KEY.replace("-auth-token", "-expires-at");
    localStorage.removeItem(expiresKey);
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
