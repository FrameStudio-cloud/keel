import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Keel Assistant — an expandable AI copilot for shop owners.
 *
 * Extending it is intentional and cheap: append a Tool to the TOOLS registry
 * below. Each tool states what questions it answers (`triggers`), how it pulls
 * live data from Supabase (`fetch`), how to render that data into the prompt
 * (`render`), and what widget payload the dashboard should show
 * (`renderWidget`).
 *
 * Security model:
 *  - Tenant isolation: shop_id is resolved from the SUPABASE JWT (sub → users),
 *    never from the request body.
 *  - The caller supplies the docs snippets; the model only answers from what
 *    it is given, so it never invents numbers or shop facts.
 *
 * Endpoints:
 *   POST /keel-assistant  body = { question, docs?, mode? }
 *     mode === "chat" → returns { answer, docs, data: { toolName: widget } }
 *     otherwise       → returns { answer }
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 260;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, x-client-info, content-type",
};
const JSON_HEADERS = { ...CORS, "Content-Type": "application/json" };

type Supabase = ReturnType<typeof createClient>;

type ToolContext = { supabase: Supabase; shopId: string };

type Tool<D = unknown> = {
  name: string;
  triggers: RegExp[];
  fetch: (ctx: ToolContext) => Promise<D>;
  render: (data: D) => string;
  renderWidget: (data: D) => Record<string, unknown>;
};

/* ------------------------------------------------------------------ */
/* TOOL REGISTRY — append a new Tool object to teach the copilot a new   */
/* topic. The Assistant page renders widgets by `data.tool` equality.     */
/* ------------------------------------------------------------------ */

const TOOLS: Tool[] = [
  {
    name: "overview",
    triggers: [
      /how (is|are) (my|the) (shop|store|business)/i,
      /(shop|store|business) (overview|summary|performance)/i,
      /how (am i|did i|is everything) (doing|performing)/i,
      /(tell|show) me.*(overview|summary|how.*doing)/i,
      /sales (today|this week)/i,
    ],
    async fetch({ supabase, shopId }) {
      const { data, error } = await supabase.rpc("get_dashboard_summary", {
        p_shop_id: shopId,
        p_threshold: 6,
      });
      if (error) throw error;
      return data;
    },
    render(d) {
      const r = d as any;
      const sales = r?.todaySales ?? {};
      const top = Array.isArray(r?.topProducts) ? r.topProducts : [];
      return [
        `Today: ${sales.amount ?? 0} (qty ${sales.quantity ?? 0})`,
        `Low stock count: ${r?.lowStockCount ?? 0}`,
        `Total products: ${r?.totalProducts ?? 0}`,
        `Chart data (last 7): ${JSON.stringify((r?.chartData ?? []).slice(-7))}`,
        `Top products: ${top.map((p: any) => `${p.product_name} x${p.qty}`).join(", ")}`,
      ].join("\n");
    },
    renderWidget(d) {
      const r = d as any;
      return {
        topProducts: (r?.topProducts ?? []).map((p: any) => ({
          name: p.product_name,
          percent: p.percent ?? 0,
          qty: p.qty ?? 0,
        })),
        chartData: (r?.chartData ?? []).slice(0, 14),
        stats: {
          todaySales: r?.todaySales ?? { amount: 0 },
          lowStockCount: r?.lowStockCount ?? 0,
          totalProducts: r?.totalProducts ?? 0,
        },
      };
    },
  },

  {
    name: "profit_loss",
    triggers: [
      /profit/i,
      /\bp&l\b/,
      /\bmargins?\b/i,
      /earning/i,
      /how much (did|do) i (make|earn)/i,
      /(revenue|income|costs?|expenses?)/i,
    ],
    async fetch({ supabase, shopId }) {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const start = since.toISOString();
      const end = new Date().toISOString();
      const [salesRes, expRes] = await Promise.all([
        supabase.from("sales").select("amount").eq("shop_id", shopId).gte("created_at", start).lte("created_at", end),
        supabase.from("expenses").select("amount").eq("shop_id", shopId).gte("expense_date", start).lte("expense_date", end),
      ]);
      const revenue = (salesRes.data ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
      const expenses = (expRes.data ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
      return { revenue, expenses, profit: revenue - expenses };
    },
    render(d) {
      const r = d as { revenue: number; expenses: number; profit: number };
      return `Last 30 days — revenue ${r.revenue}, expenses ${r.expenses}, profit ${r.profit}.`;
    },
    renderWidget(d) {
      const r = d as { revenue: number; expenses: number; profit: number };
      return { revenue: r.revenue, expenses: r.expenses, profit: r.profit };
    },
  },

  {
    name: "low_stock",
    triggers: [
      /low stock/i,
      /out of stock/i,
      /restock/i,
      /(what|which).*(running low|almost out|out of)/i,
    ],
    async fetch({ supabase, shopId }) {
      const { data, error } = await supabase.rpc("get_low_stock_products", {
        p_shop_id: shopId,
        p_threshold: 6,
      });
      if (error) throw error;
      return { items: data ?? [] };
    },
    render(d) {
      const items = (d as any)?.items ?? [];
      return items.length
        ? `Products at or below the low-stock threshold:\n${items.map((i: any) => `- ${i.name}: ${i.stock}`).join("\n")}`
        : "No products below the low-stock threshold.";
    },
    renderWidget(d) {
      return { items: ((d as any)?.items ?? []).slice(0, 10) };
    },
  },

  {
    name: "website_analytics",
    triggers: [
      /website/i,
      /website.*(traffic|visitors|views)/i,
      /page views/i,
      /top (products|pages).*website/i,
    ],
    async fetch({ supabase, shopId }) {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const { data, error } = await supabase
        .from("page_views")
        .select("page, product_name, created_at")
        .eq("shop_id", shopId)
        .gte("created_at", since.toISOString())
        .limit(200);
      if (error) throw error;
      const byPage: Record<string, number> = {};
      for (const v of data ?? []) {
        const key = v.product_name || v.page || "home";
        byPage[key] = (byPage[key] ?? 0) + 1;
      }
      return { totalViews: (data ?? []).length, top: Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 5) };
    },
    render(d) {
      const r = d as any;
      return `Last 7 days — ${r.totalViews} page views. Top: ${r.top.map(([k, v]: [string, number]) => `${k} (${v})`).join(", ")}`;
    },
    renderWidget(d) {
      const r = d as any;
      return { totalViews: r.totalViews, top: r.top.map(([k, v]: [string, number]) => ({ page: k, views: v })) };
    },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

/** Extract the user `sub` (UUID) from a Bearer JWT. */
function jwtSub(authorization: string | null): string | null {
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const payload = authorization.slice(7).split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}

async function resolveShop(supabase: Supabase, authUserId: string | null) {
  if (!authUserId) throw new Error("missing_identity");
  const { data: row, error } = await supabase.from("users").select("shop_id").eq("auth_user_id", authUserId).maybeSingle();
  if (error) throw error;
  if (!row?.shop_id) throw new Error("no_shop");
  return String(row.shop_id);
}

async function resolveGroqKey(supabase: Supabase): Promise<string | null> {
  const env = Deno.env.get("GROQ_API_KEY");
  if (env?.trim()) return env.trim();
  const { data: cfg } = await supabase.from("app_config").select("key, value").eq("key", "groq_api_key").maybeSingle();
  if (cfg?.value) return String(cfg.value);
  const { data: chat } = await supabase.from("chat_config").select("groq_api_key").limit(1).maybeSingle();
  if (chat?.groq_api_key) return String(chat.groq_api_key);
  return null;
}

async function isPro(supabase: Supabase, shopId: string): Promise<boolean> {
  const { data, error } = await supabase.from("chat_config").select("plan_tier").eq("shop_id", shopId).maybeSingle();
  if (error) throw error;
  return data?.plan_tier === "pro" || data?.plan_tier === "beta";
}

async function askGroq(apiKey: string, prompt: string, question: string): Promise<string> {
  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "system",
          content:
            "You are Keel Assistant, the AI copilot built into Keel, a POS & business dashboard for small shops in Kenya. " +
            "Answer the shop owner's question in plain, friendly, concise English (max ~4 sentences). " +
            "Use the LIVE SHOP DATA block as ground truth; never invent numbers. " +
            "If the data is absent or insufficient, say plainly what you can't see and what to check in the dashboard. " +
            "End with one short, concrete next action when sensible.",
        },
        { role: "user", content: `${prompt}\n\nQUESTION: ${question}` },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`groq ${res.status}: ${body.slice(0, 300)}`);
  }
  const jsonBody = await res.json();
  return jsonBody?.choices?.[0]?.message?.content ?? "";
}

/* ------------------------------------------------------------------ */
/* Main handler                                                        */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authUserId = jwtSub(req.headers.get("authorization"));
    const shopId = await resolveShop(supabase, authUserId);

    const body = await req.json();
    const question = String(body?.question ?? "").trim();
    if (!question) return json({ error: "empty_question" }, 400);
    const mode = body?.mode === "chat" ? "chat" : "quick";
    const docs: string[] = Array.isArray(body?.docs) ? body.docs.map(String) : [];

    if (!(await isPro(supabase, shopId))) {
      return json({ error: "plan_required", plan: "pro" }, 403);
    }

    const apiKey = await resolveGroqKey(supabase);
    if (!apiKey) return json({ error: "no_provider_key" }, 500);

    // Run the matching tools, build the live-data prompt and widgets.
    const matched = TOOLS.filter((t) => t.triggers.some((re) => re.test(question)));
    const blocks: string[] = [];
    const widgets: Record<string, unknown> = {};
    for (const tool of matched) {
      try {
        const data = await tool.fetch({ supabase, shopId });
        blocks.push(tool.render(data));
        widgets[tool.name] = tool.renderWidget(data);
      } catch (e) {
        console.error(`assistant tool "${tool.name}" failed`, e);
      }
    }

    const dataBlock = blocks.length
      ? "— LIVE SHOP DATA —\n" + blocks.join("\n\n") + "\n— END LIVE SHOP DATA —"
      : "(no live data was fetched for this question)";
    const docBlock = docs.length ? "\n\n— OFFICIAL KEEL DOCS REFERENCE —\n" + docs.join("\n\n———\n\n") : "";

    const answer = await askGroq(apiKey, dataBlock + docBlock, question);

    if (mode === "chat") {
      return json({ answer, docs, data: widgets }, 200);
    }
    return json({ answer }, 200);
  } catch (e: any) {
    console.error("keel-assistant", e);
    const code = String(e?.message ?? "internal");
    const status = code === "missing_identity" ? 401 : code === "no_shop" ? 403 : 500;
    return json({ error: code === "internal" ? "internal" : code, message: "Something went wrong. Try again." }, status);
  }
});