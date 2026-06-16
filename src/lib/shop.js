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
  if (currentShopId) return currentShopId;

  const userId = getPersistedUserId();
  if (!userId) return null;

  const { data } = await supabase
    .from("users")
    .select("shop_id")
    .eq("auth_user_id", userId)
    .maybeSingle();

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
