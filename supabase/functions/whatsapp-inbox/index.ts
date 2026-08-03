import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, apikey, x-client-info",
};

const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

const GRAPH_API = "https://graph.facebook.com/v21.0";
const PRO_PLANS = ["pro", "beta"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();

  try {
    const authHeader = req.headers.get("authorization") || "";
    const userId = getUserFromJwt(authHeader);
    if (!userId) return json({ error: "Not authenticated" }, 401);

    const supabase = await getSupabase();
    const shopId = await getShopId(supabase, userId);
    if (!shopId) return json({ error: "No shop linked to this account" }, 400);

    if (action === "send") return await handleSend(supabase, shopId, req);
    if (action === "takeover") return await setMode(supabase, shopId, req, "human");
    if (action === "resume") return await setMode(supabase, shopId, req, "auto");
    if (action === "markread") return await markRead(supabase, shopId, req);

    return json({ error: "Unknown action" }, 404);
  } catch (err) {
    console.error("whatsapp-inbox error:", err);
    return json({ error: err.message || "Something went wrong" }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function getUserFromJwt(auth: string): string | null {
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

async function getSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  return createClient(supabaseUrl, supabaseKey);
}

async function getShopId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("shop_id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  return data?.shop_id || null;
}

async function ensurePro(supabase: any, shopId: string): Promise<boolean> {
  const { data } = await supabase
    .from("chat_config")
    .select("plan_tier")
    .eq("shop_id", shopId)
    .maybeSingle();
  return PRO_PLANS.includes(data?.plan_tier);
}

async function loadShopConfig(supabase: any, shopId: string) {
  const { data } = await supabase
    .from("chat_config")
    .select("whatsapp_phone_id, whatsapp_token, whatsapp_status, whatsapp_bot_number")
    .eq("shop_id", shopId)
    .maybeSingle();
  return data || null;
}

async function getGlobalToken(supabase: any): Promise<string | null> {
  const envToken = Deno.env.get("WHATSAPP_APP_TOKEN");
  if (envToken) return envToken;
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "whatsapp_app_token")
    .maybeSingle();
  return data?.value || null;
}

async function handleSend(supabase: any, shopId: string, req: Request) {
  if (!(await ensurePro(supabase, shopId))) {
    return json({ error: "WhatsApp inbox is a Pro feature" }, 403);
  }

  const config = await loadShopConfig(supabase, shopId);
  const phoneNumberId = config?.whatsapp_phone_id;
  if (!phoneNumberId || config?.whatsapp_status !== "connected") {
    return json({ error: "Connect a WhatsApp number first" }, 400);
  }

  const token = config.whatsapp_token || await getGlobalToken(supabase);
  if (!token) return json({ error: "WhatsApp integration not configured" }, 500);

  const { customer_phone, body, image_url, caption } = await req.json();
  const cleanPhone = String(customer_phone || "").replace(/\D/g, "");
  const cleanBody = String(body || "").trim();
  const cleanImage = String(image_url || "").trim();
  const cleanCaption = String(caption || "").trim();
  if (!cleanPhone) return json({ error: "Missing customer number" }, 400);
  if (!cleanImage && !cleanBody) return json({ error: "Nothing to send" }, 400);

  const sent = cleanImage
    ? await sendImage(token, phoneNumberId, cleanPhone, cleanImage, cleanCaption)
    : await sendReply(token, phoneNumberId, cleanPhone, cleanBody);
  if (!sent) return json({ error: "Couldn't send the message. The customer may be outside the 24-hour reply window." }, 502);

  const preview = cleanImage
    ? (cleanCaption || "Photo").slice(0, 80)
    : cleanBody.slice(0, 80);

  const { data: conversation } = await supabase
    .from("whatsapp_conversations")
    .select("*")
    .eq("shop_id", shopId)
    .eq("customer_phone", cleanPhone)
    .maybeSingle();

  if (conversation) {
    await supabase.from("whatsapp_messages").insert({
      conversation_id: conversation.id,
      shop_id: shopId,
      direction: "outbound",
      sender: "shop",
      body: cleanBody || cleanCaption,
      media_url: cleanImage || null,
    });
    await supabase.from("whatsapp_conversations").update({
      last_message_at: new Date().toISOString(),
      last_message_preview: preview,
      unread_count: 0,
    }).eq("id", conversation.id);
  }

  return json({ success: true });
}

async function setMode(supabase: any, shopId: string, req: Request, mode: string) {
  const { conversation_id } = await req.json();
  if (!conversation_id) return json({ error: "Missing conversation" }, 400);

  const { data } = await supabase
    .from("whatsapp_conversations")
    .update({ mode })
    .eq("id", conversation_id)
    .eq("shop_id", shopId)
    .select("id")
    .maybeSingle();

  if (!data) return json({ error: "Conversation not found" }, 404);
  return json({ success: true, mode });
}

async function markRead(supabase: any, shopId: string, req: Request) {
  const { conversation_id } = await req.json();
  if (!conversation_id) return json({ error: "Missing conversation" }, 400);

  await supabase
    .from("whatsapp_conversations")
    .update({ unread_count: 0 })
    .eq("id", conversation_id)
    .eq("shop_id", shopId);

  return json({ success: true });
}

async function sendReply(token: string, phoneNumberId: string, to: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    });

    if (!res.ok) {
      console.error("send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("send error:", err);
    return false;
  }
}

async function sendImage(
  token: string,
  phoneNumberId: string,
  to: string,
  link: string,
  caption: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "image",
        image: {
          link,
          ...(caption ? { caption } : {}),
        },
      }),
    });

    if (!res.ok) {
      console.error("sendImage failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendImage error:", err);
    return false;
  }
}
