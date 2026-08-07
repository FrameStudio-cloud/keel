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

    if (action === "provision") return await handleProvision(supabase, shopId, req);
    if (action === "verify") return await handleVerify(supabase, shopId, req);
    if (action === "deactivate") return await handleDeactivate(supabase, shopId, req);

    return json({ error: "Unknown action" }, 404);
  } catch (err) {
    console.error("whatsapp-onboard error:", err);
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

async function loadGlobalConfig(supabase: any) {
  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", ["whatsapp_app_token", "whatsapp_waba_id"]);

  const map: Record<string, string> = {};
  for (const row of data || []) map[row.key] = row.value;
  return map;
}

async function ensurePro(supabase: any, shopId: string): Promise<boolean> {
  const { data } = await supabase
    .from("chat_config")
    .select("plan_tier")
    .eq("shop_id", shopId)
    .maybeSingle();
  return PRO_PLANS.includes(data?.plan_tier);
}

async function handleProvision(supabase: any, shopId: string, req: Request) {
  if (!(await ensurePro(supabase, shopId))) {
    return json({ error: "WhatsApp bot is a Pro feature" }, 403);
  }

  const globalConfig = await loadGlobalConfig(supabase);
  const token = globalConfig["whatsapp_app_token"];
  const wabaId = globalConfig["whatsapp_waba_id"];
  if (!token || !wabaId) return json({ error: "WhatsApp integration not configured" }, 500);

  const { cc, phone_number, code_method } = await req.json();
  const cleanNumber = String(phone_number || "").replace(/\D/g, "");
  const countryCode = String(cc || "254").replace(/\D/g, "");
  if (!cleanNumber) return json({ error: "Enter your WhatsApp number" }, 400);

  const codeMethod = code_method === "VOICE" ? "VOICE" : "SMS";

  const { data: shop } = await supabase
    .from("shops")
    .select("name")
    .eq("id", shopId)
    .maybeSingle();
  const verifiedName = (shop?.name || "Keel Shop").trim().slice(0, 80);

  // Cancel any in-flight provisioning first so we don't leak numbers on the WABA.
  const { data: existing } = await supabase
    .from("chat_config")
    .select("whatsapp_phone_id, whatsapp_status")
    .eq("shop_id", shopId)
    .maybeSingle();
  if (existing?.whatsapp_phone_id && existing.whatsapp_status === "code_sent") {
    await graphCall(token, `${existing.whatsapp_phone_id}/deregister`, {
      messaging_product: "whatsapp",
    });
  }

  // Step 1: create the number on our WABA.
  const created = await graphCall(token, `${wabaId}/phone_numbers`, {
    cc: countryCode,
    phone_number: cleanNumber,
    verified_name: verifiedName,
  });
  const phoneId = created?.id;
  if (!phoneId) return json({ error: "Meta could not add that number. It may already be on WhatsApp — the number must not be registered on the WhatsApp app." }, 400);

  // Step 2: ask Meta to send a verification code (SMS or voice call).
  const codeRes = await graphCall(token, `${phoneId}/request_code`, {
    code_method: codeMethod,
  });

  await supabase.from("chat_config").upsert({
    shop_id: shopId,
    whatsapp_phone_id: phoneId,
    whatsapp_bot_number: `+${countryCode} ${cleanNumber}`,
    whatsapp_status: "code_sent",
    whatsapp_bot_enabled: false,
    whatsapp_connected_at: null,
  }, { onConflict: "shop_id" });

  return json({
    success: true,
    phone_id: phoneId,
    code_sent: codeRes?.success !== false,
    masked: maskNumber(`+${countryCode} ${cleanNumber}`),
  });
}

async function handleVerify(supabase: any, shopId: string, req: Request) {
  const { phone_id, code } = await req.json();
  if (!phone_id || !code) return json({ error: "Missing phone ID or verification code" }, 400);
  const cleanCode = String(code).replace(/\D/g, "");
  if (cleanCode.length !== 6) return json({ error: "Enter the 6-digit code" }, 400);

  const globalConfig = await loadGlobalConfig(supabase);
  const token = globalConfig["whatsapp_app_token"];
  if (!token) return json({ error: "WhatsApp integration not configured" }, 500);

  const { data: cfg } = await supabase
    .from("chat_config")
    .select("whatsapp_phone_id, whatsapp_status")
    .eq("shop_id", shopId)
    .maybeSingle();
  if (!cfg || cfg.whatsapp_phone_id !== phone_id || cfg.whatsapp_status !== "code_sent") {
    return json({ error: "No pending connection for this number. Start again from the top." }, 400);
  }

  // Step 3: verify ownership with the code Meta sent.
  const verifyRes = await graphCall(token, `${phone_id}/verify_code`, { code: cleanCode });
  if (verifyRes?.success === false) return json({ error: "That code didn't work. Double-check it and try again." }, 400);

  // Step 4: register the number with a PIN Keel generates and stores.
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  const registerRes = await graphCall(token, `${phone_id}/register`, {
    messaging_product: "whatsapp",
    pin,
  });
  if (registerRes?.success === false) return json({ error: "Meta couldn't register this number yet. Try again in a few minutes." }, 400);

  await supabase.from("chat_config").update({
    whatsapp_pin: pin,
    whatsapp_status: "connected",
    whatsapp_bot_enabled: true,
    whatsapp_connected_at: new Date().toISOString(),
  }).eq("shop_id", shopId);

  return json({ success: true });
}

async function handleDeactivate(supabase: any, shopId: string, req: Request) {
  const globalConfig = await loadGlobalConfig(supabase);
  const token = globalConfig["whatsapp_app_token"];

  const { data: cfg } = await supabase
    .from("chat_config")
    .select("whatsapp_phone_id, whatsapp_pin")
    .eq("shop_id", shopId)
    .maybeSingle();

  if (token && cfg?.whatsapp_phone_id) {
    try {
      await graphCall(token, `${cfg.whatsapp_phone_id}/deregister`, {
        messaging_product: "whatsapp",
        pin: cfg.whatsapp_pin || "000000",
      });
    } catch (err) {
      console.error("deregister failed (ignored):", err);
    }
  }

  await supabase.from("chat_config").update({
    whatsapp_phone_id: "",
    whatsapp_pin: "",
    whatsapp_status: "",
    whatsapp_bot_number: "",
    whatsapp_bot_enabled: false,
    whatsapp_connected_at: null,
  }).eq("shop_id", shopId);

  return json({ success: true });
}

async function graphCall(token: string, path: string, body: Record<string, unknown>) {
  const res = await fetch(`${GRAPH_API}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `Meta API error (${res.status})`;
    const error = new Error(msg);
    (error as any).status = res.status;
    throw error;
  }
  return data;
}

function maskNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 6) return num;
  return `+${digits.slice(0, digits.length - 4)} XXX ${digits.slice(-4)}`;
}
