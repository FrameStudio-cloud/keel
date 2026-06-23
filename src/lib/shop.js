import { supabase, getPersistedSession } from "./supabase";

let currentShopId = null;
let pendingPromise = null;

export function clearShopId() {
  currentShopId = null;
  pendingPromise = null;
}

export async function getShopId() {
  if (currentShopId) return currentShopId;
  if (pendingPromise) return pendingPromise;

  pendingPromise = (async () => {
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
  })();

  try {
    return await pendingPromise;
  } finally {
    pendingPromise = null;
  }
}

export function withShop(payload) {
  if (!currentShopId) return payload;
  return { ...payload, shop_id: currentShopId };
}
