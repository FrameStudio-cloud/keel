import { supabase } from "./supabase";

let currentShopId = null;

export async function getShopId() {
  if (currentShopId) return currentShopId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("shop_id")
    .eq("auth_user_id", user.id)
    .single();

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
