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
