import { supabase } from "./supabase";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/keel-ai`;

export async function aiWriteWeek(shopId, platform) {
  const { data: session } = supabase.auth.getSession();
  const token = (await session)?.access_token;

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || "anon"}`,
    },
    body: JSON.stringify({ shop_id: shopId, action: "write_week", platform }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate week");
  }

  return res.json();
}

export async function aiGenerateVariants(shopId, productId, platform) {
  const { data: session } = supabase.auth.getSession();
  const token = (await session)?.access_token;

  const res = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || "anon"}`,
    },
    body: JSON.stringify({
      shop_id: shopId,
      action: "generate_variants",
      product_id: productId,
      platform,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to generate variants");
  }

  return res.json();
}
