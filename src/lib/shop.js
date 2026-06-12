import { supabase } from "./supabase";

let currentShopId = null;

export async function getShopId() {
  if (currentShopId) return currentShopId;
  const { data } = await supabase
    .from("shops")
    .select("id")
    .limit(1)
    .single();
  if (data) {
    currentShopId = data.id;
    return data.id;
  }
  return null;
}

export function withShop(payload) {
  if (!currentShopId) throw new Error("Shop not loaded yet");
  return { ...payload, shop_id: currentShopId };
}
