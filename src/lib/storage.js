import { supabase } from "./supabase";

const BUCKET = "product-images";

function extractPath(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const idx = parts.indexOf("public");
    if (idx === -1) return null;
    return parts.slice(idx + 2).join("/");
  } catch {
    return null;
  }
}

export async function uploadImage(file, shopId) {
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${shopId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { contentType: file.type });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  return publicUrl.publicUrl;
}

export async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  const path = extractPath(imageUrl);
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
