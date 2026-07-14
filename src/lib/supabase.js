import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const STORAGE_KEY = `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;

export const STORAGE_KEY_EXPORTED = STORAGE_KEY;

let refreshPromise = null;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  accessToken: async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!session?.access_token) return null;
      if (session.expires_at && Date.now() >= session.expires_at - 60000) {
        if (!session.refresh_token) {
          clearPersistedSession();
          return null;
        }
        if (refreshPromise) return refreshPromise;
        refreshPromise = (async () => {
          const res = await window.fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
            method: "POST",
            headers: { apikey: supabaseKey, "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: session.refresh_token }),
          });
          if (!res.ok) { clearPersistedSession(); return null; }
          const data = await res.json();
          saveSession(data);
          refreshPromise = null;
          return data.access_token;
        })();
        const token = await refreshPromise;
        refreshPromise = null;
        return token;
      }
      return session.access_token;
    } catch (err) {
      console.error("[supabase] accessToken getter failed:", err);
      return null;
    }
  },
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...session,
      expires_at: Date.now() + ((parseInt(session.expires_in) || 3600) * 1000),
    }));
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

export function parseHashParams() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  const expires_in = params.get("expires_in");
  const type = params.get("type");
  if (!access_token) return null;
  return { access_token, refresh_token, expires_in: parseInt(expires_in), type };
}

export async function fetchUserData(accessToken) {
  const res = await window.fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function refreshAccessToken() {
  const session = getPersistedSession();
  if (!session?.refresh_token) throw new Error("No refresh token available");

  const res = await window.fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: supabaseKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  if (!res.ok) {
    clearPersistedSession();
    throw new Error("Session expired");
  }

  const data = await res.json();
  saveSession(data);
  return data.access_token;
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
  try {
    await window.fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    /* server request may fail, session still cleared below */
  }
  clearPersistedSession();
}

export async function authUpdatePassword(accessToken, newPassword) {
  const res = await window.fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.msg || data.error_description || "Password update failed");
  }
}
