import { supabase, getPersistedSession } from "./supabase";

let currentShopId = null;

export function clearShopId() {
  currentShopId = null;
}

export async function getShopId() {
  if (currentShopId) return currentShopId;

  const session = getPersistedSession();
  const userId = session?.user?.id ?? null;
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
