import { supabase } from "./supabase";

let currentShopId = null;

function getPersistedUserId() {
  try {
    const key = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user?.id ?? null;
  } catch {
    return null;
  }
}

export function clearShopId() {
  currentShopId = null;
}

export async function getShopId() {
  console.log("[TRACE] getShopId called, currentShopId:", currentShopId);
  if (currentShopId) return currentShopId;

  const userId = getPersistedUserId();
  console.log("[TRACE] getShopId userId:", userId);
  if (!userId) return null;

  console.log("[TRACE] getShopId about to query supabase");

  // TEST: Try raw window.fetch instead of supabase client
  try {
    const url = "https://hmcowpwfefeeossztuem.supabase.co/rest/v1/users?select=shop_id&auth_user_id=eq." + userId + "&limit=1";
    console.log("[TRACE] raw fetch URL:", url);
    const res = await window.fetch(url, {
      headers: {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY293cHdmZWZlZW9zc3p0dWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTU4NjUsImV4cCI6MjA5NzE3MTg2NX0.J4QwDvMVAyE7bJL_cUeTKRvlqLeU2CX0xeo5CElAoqI",
        "Authorization": "Bearer " + (() => {
          try {
            const key = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
            return key ? JSON.parse(localStorage.getItem(key))?.access_token : "";
          } catch { return ""; }
        })()
      }
    });
    console.log("[TRACE] raw fetch status:", res.status);
    const json = await res.json();
    console.log("[TRACE] raw fetch result:", json);
    if (json && json.length > 0) {
      currentShopId = json[0].shop_id;
      return json[0].shop_id;
    }
    return null;
  } catch (e) {
    console.error("[TRACE] raw fetch error:", e);
  }

  // Fallback to supabase client
  console.log("[TRACE] trying supabase client");
  const { data } = await supabase
    .from("users")
    .select("shop_id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  console.log("[TRACE] getShopId query result:", data);

  if (data) {
    currentShopId = data.shop_id;
    return data.shop_id;
  }

  return null;
}

export function withShop(payload) {
  if (!currentShopId) throw new Error("Shop not loaded yet");
  return { ...payload, shop_id: currentShopId };
}
