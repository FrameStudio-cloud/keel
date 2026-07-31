import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, apikey, x-client-info",
};

const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json" };

const GRAPH_API = "https://graph.facebook.com/v21.0";
const MAX_PRODUCTS = 200;
const MAX_MATCHES = 3;
const PRO_PLANS = ["pro", "beta"];

const STOPWORDS = new Set([
  "how", "much", "is", "the", "a", "an", "do", "you", "have", "has", "price", "prices",
  "bei", "ngapi", "cost", "gharama", "stock", "available", "iko", "ziko", "opo", "unayo",
  "mnayo", "una", "in", "of", "for", "what", "which", "nini", "wapi", "sells", "sell",
  "please", "tafadhali", "kwa", "na", "to", "me", "kani", "ki", "i", "want", "nataka",
  "buy", "order", "nanunua", "looking", "for", "x", "kama", "ya", "gani", "aina",
]);

const INTENTS = [
  {
    key: "greeting",
    patterns: ["hello", "hi", "hey", "habari", "hujambo", "mambo", "niaje", "jambo", "sasa", "good morning", "good afternoon", "good evening", "shikamoo"],
  },
  {
    key: "thanks",
    patterns: ["thank", "thanks", "asante", "merci", "shukran"],
  },
  {
    key: "product",
    patterns: ["price", "how much", "cost", "bei", "ngapi", "gharama", "stock", "available", "iko", "ziko", "opo", "unayo", "mnayo", "in stock", "out of stock", "catalogue", "products", "product", "sell", "sells", "uza", "una", "have"],
  },
  {
    key: "hours",
    patterns: ["hours", "open", "opens", "closes", "close", "saa ngapi", "mnafungua", "mnafunga", "fungua", "funga", "working hours", "operating"],
  },
  {
    key: "location",
    patterns: ["where", "location", "address", "wapi", "iko wapi", "poa", "found"],
  },
  {
    key: "delivery",
    patterns: ["delivery", "deliver", "shipping", "courier", "wasilisha", "deliveries", "send it"],
  },
  {
    key: "payment",
    patterns: ["pay", "payment", "malipo", "mpesa", "m-pesa", "lipa", "paypal", "accept", "how do i pay"],
  },
  {
    key: "contact",
    patterns: ["phone", "call", "contact", "number", "nambari", "simu", "email", "talk to", "agent", "human", "staff", "reach you"],
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method === "GET") {
    return handleVerify(req);
  }

  if (req.method === "POST") {
    return handleMessage(req);
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: JSON_HEADERS,
  });
});

function ack(): Response {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS });
}

async function getSupabase() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  return createClient(supabaseUrl, supabaseKey);
}

async function handleVerify(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const envToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
  if (mode === "subscribe" && token) {
    if (envToken && token === envToken) {
      return new Response(challenge, { status: 200, headers: CORS_HEADERS });
    }
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("chat_config")
      .select("shop_id")
      .eq("whatsapp_verify_token", token)
      .limit(1);
    if (data && data.length > 0) {
      return new Response(challenge, { status: 200, headers: CORS_HEADERS });
    }
  }

  return new Response("Verification failed", { status: 403, headers: CORS_HEADERS });
}

async function handleMessage(req: Request) {
  try {
    const payload = await req.json();
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const messages = value?.messages;

    if (!value || !messages || messages.length === 0) return ack();

    const phoneNumberId = value?.metadata?.phone_number_id;
    if (!phoneNumberId) return ack();

    const msg = messages[0];
    if (!msg || msg.type !== "text") return ack();

    const text = (msg.text?.body || "").trim();
    const from = msg.from;
    if (!text || !from) return ack();

    const supabase = await getSupabase();

    const { data: config } = await supabase
      .from("chat_config")
      .select("shop_id, whatsapp_token, whatsapp_bot_enabled, welcome_message, plan_tier")
      .eq("whatsapp_phone_id", phoneNumberId)
      .maybeSingle();

    if (!config || !config.whatsapp_bot_enabled) return ack();
    if (!PRO_PLANS.includes(config.plan_tier)) return ack();

    const sendToken = config.whatsapp_token || await getGlobalToken(supabase);
    if (!sendToken) return ack();

    const { data: settings } = await supabase
      .from("store_settings")
      .select("store_name, currency_symbol, store_address, store_phone, whatsapp, email, business_hours, payment_methods, default_payment")
      .eq("shop_id", config.shop_id)
      .maybeSingle();

    const { data: products } = await supabase
      .from("products")
      .select("name, price, sale_price, sale_ends_at, stock")
      .eq("shop_id", config.shop_id)
      .order("created_at", { ascending: false })
      .limit(MAX_PRODUCTS);

    const { data: faqs } = await supabase
      .from("chat_faqs")
      .select("question, answer")
      .eq("shop_id", config.shop_id)
      .order("sort_order", { ascending: true })
      .limit(50);

    const reply = await buildReply(text, {
      config,
      settings,
      products: products || [],
      faqs: faqs || [],
    });

    if (reply) {
      const sent = await sendReply(sendToken, phoneNumberId, from, reply);
      if (sent) {
        await logMessage(supabase, config.shop_id, text, reply, msg);
      }
    }

    return ack();
  } catch (err) {
    console.error("whatsapp-bot error:", err);
    return ack();
  }
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

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function matchesAny(text: string, tokens: string[], patterns: string[]): boolean {
  return patterns.some((p) => {
    if (p.length <= 3) return tokens.includes(p);
    return text.includes(p);
  });
}

function detectIntent(text: string): string | null {
  const tokens = tokenize(text);
  for (const intent of INTENTS) {
    if (matchesAny(text, tokens, intent.patterns)) return intent.key;
  }
  return null;
}

function scoreProduct(queryTokens: string[], name: string): number {
  const nameTokens = tokenize(name).filter((t) => t.length > 1);
  let score = 0;
  for (const t of nameTokens) {
    if (queryTokens.includes(t)) {
      score += 2;
    } else if (queryTokens.some((qt) => qt.length > 3 && (qt.includes(t) || t.startsWith(qt) || qt.startsWith(t)))) {
      score += 1;
    }
  }
  return score;
}

function findProducts(text: string, products: any[]): any[] {
  const tokens = tokenize(text).filter((t) => t.length > 1 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];

  const scored = products
    .map((p) => ({ product: p, score: scoreProduct(tokens, p.name) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_MATCHES).map((s) => s.product);
}

function formatPrice(amount: number | string, currency?: string): string {
  const sym = currency || "KSh";
  const num = Number(amount);
  const formatted = Number.isInteger(num)
    ? num.toLocaleString("en-US")
    : num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return `${sym} ${formatted}`;
}

function productLine(p: any, currency?: string): string {
  let price = formatPrice(p.price, currency);
  if (p.sale_price && (!p.sale_ends_at || new Date(p.sale_ends_at) > new Date())) {
    price = `${formatPrice(p.sale_price, currency)} (was ${formatPrice(p.price, currency)})`;
  }
  const stock = Number(p.stock);
  const stockText = stock <= 0 ? "Out of stock" : `${stock} in stock`;
  return `${p.name} — ${price} • ${stockText}`;
}

function findFaq(text: string, faqs: any[]): string | null {
  const tokens = tokenize(text).filter((t) => t.length > 2);
  if (tokens.length === 0) return null;

  let best: any = null;
  let bestScore = 0;
  for (const faq of faqs) {
    const score = scoreProduct(tokens, faq.question);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return bestScore >= 2 ? best.answer : null;
}

function hoursString(businessHours: any): string | null {
  if (!businessHours || Object.keys(businessHours).length === 0) return null;
  const days = [
    { key: "mon", label: "Mon" },
    { key: "tue", label: "Tue" },
    { key: "wed", label: "Wed" },
    { key: "thu", label: "Thu" },
    { key: "fri", label: "Fri" },
    { key: "sat", label: "Sat" },
    { key: "sun", label: "Sun" },
  ];
  const lines = days.map((d) => {
    const h = businessHours[d.key];
    if (!h || h.active === false) return `${d.label}: Closed`;
    return `${d.label}: ${h.open || "08:00"} – ${h.close || "17:00"}`;
  });
  return lines.join("\n");
}

function paymentString(settings: any): string {
  const methods = Array.isArray(settings?.payment_methods) && settings.payment_methods.length > 0
    ? settings.payment_methods
    : [settings?.default_payment || "Cash", "M-Pesa"];
  return methods.join(", ");
}

async function aiReply(_shopId: string, _text: string): Promise<string | null> {
  // Stub — future Groq-powered fallback using chat_config.groq_api_key
  return null;
}

async function buildReply(text: string, ctx: {
  config: any;
  settings: any;
  products: any[];
  faqs: any[];
}): Promise<string | null> {
  const intent = detectIntent(text);
  const currency = ctx.settings?.currency_symbol || "KSh";

  if (intent === "greeting") {
    return `${ctx.config.welcome_message || "Hi! How can we help you today?"}\n\nYou can ask me about prices, stock, delivery, or our opening hours.`;
  }

  if (intent === "thanks") {
    return "You're welcome! Anything else I can help with?";
  }

  const faqAnswer = findFaq(text, ctx.faqs);
  if (faqAnswer) return faqAnswer;

  if (intent === "hours") {
    const hours = hoursString(ctx.settings?.business_hours);
    return hours ? `Our opening hours:\n${hours}` : "Our hours are Mon–Sat 8:00 AM – 5:00 PM. Reach out anytime on WhatsApp and we'll reply as soon as we're open.";
  }

  if (intent === "location") {
    const addr = ctx.settings?.store_address;
    return addr ? `You'll find us at: ${addr}` : "We're currently operating online via WhatsApp. Message us and we'll share our location.";
  }

  if (intent === "delivery") {
    return "We offer delivery — tell us your area and we'll confirm the cost and timeline. You can also pick up in store.";
  }

  if (intent === "payment") {
    return `We accept: ${paymentString(ctx.settings)}.`;
  }

  if (intent === "contact") {
    const phone = ctx.settings?.store_phone || ctx.settings?.whatsapp || "our WhatsApp";
    const email = ctx.settings?.email ? ` or ${ctx.settings.email}` : "";
    return `You can reach us at ${phone}${email}. A member of our team will help you shortly.`;
  }

  if (intent === "product" || true) {
    const matches = findProducts(text, ctx.products);
    if (matches.length > 0) {
      const lines = matches.map((p) => productLine(p, currency));
      const header = matches.length > 1 ? "Here's what I found:\n" : "";
      return `${header}${lines.join("\n")}\n\nWant more details? Just ask!`;
    }
    if (intent === "product") {
      const sample = ctx.products.slice(0, 5).map((p) => p.name.trim()).filter(Boolean);
      if (sample.length > 0) {
        return `I didn't catch which product you mean. Here are a few we stock:\n\n${sample.join("\n")}\n\nReply with a product name and I'll check the price and stock for you.`;
      }
      return "I couldn't find that product in our catalogue right now. Try a different name, or contact us and we'll check for you.";
    }
  }

  const ai = await aiReply(ctx.config.shop_id, text);
  if (ai) return ai;

  const storeName = ctx.settings?.store_name || "us";
  return `Sorry, I didn't quite get that. I can help with prices, stock, delivery, payment and our opening hours.\n\nTry sending a product name like "iPhone 13" or ask "bei ngapi".\n\nIf you need ${storeName}'s team, just say "talk to a human".`;
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

async function logMessage(supabase: any, shopId: string, question: string, answer: string, msg: any) {
  const customerName = msg?.contacts?.[0]?.profile?.name || null;
  await supabase.from("chat_messages").insert({
    shop_id: shopId,
    question,
    answer,
    customer_name: customerName,
    status: "answered",
  });
}
