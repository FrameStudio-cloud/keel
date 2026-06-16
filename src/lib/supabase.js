import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const customFetch = (...args) => {
  console.log("[FETCH] calling fetch:", args[0]?.slice(0, 80));
  return window.fetch(...args);
};

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
  global: {
    fetch: customFetch,
  },
  accessToken: async () => {
    console.log("[ACCESSTOKEN] called");
    const token = getAccessToken();
    console.log("[ACCESSTOKEN] token:", token?.slice(0, 20) || "null");
    return token;
  },
});
