import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
  if (authHeader !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { shop_id } = await req.json();
    if (!shop_id) {
      return new Response(JSON.stringify({ error: "Missing shop_id" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: settings } = await supabase
      .from("store_settings")
      .select("store_name, notification_preferences")
      .eq("shop_id", shop_id)
      .maybeSingle();

    const prefs = settings?.notification_preferences || {};
    if (prefs.daily_summary_email === false) {
      return new Response(JSON.stringify({ ok: true, skipped: "daily_summary_email disabled" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let recipientEmail = prefs.email || "";
    if (!recipientEmail) {
      const { data: userData } = await supabase
        .from("users").select("email").eq("shop_id", shop_id).limit(1).single();
      if (userData?.email) recipientEmail = userData.email;
    }
    if (!recipientEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: "no email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const [salesRes, lowStockRes] = await Promise.all([
      supabase.from("sales").select("amount, quantity").eq("shop_id", shop_id).gte("created_at", todayISO),
      supabase.from("products").select("id, name, stock").eq("shop_id", shop_id).lte("stock", 6).limit(20),
    ]);

    const sales = salesRes.data || [];
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalSales = sales.length;
    const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);
    const lowStock = lowStockRes.data || [];

    const storeName = settings?.store_name || "Your Store";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Keel <keel@keel.framestudio.co.ke>",
        to: recipientEmail,
        subject: `Daily Summary — ${storeName}`,
        html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f8fafc">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
<tr><td style="padding:32px 32px 0">
<h1 style="font-size:20px;font-weight:600;color:#1e293b;margin:0">Daily Summary</h1>
<p style="font-size:14px;color:#64748b;margin:4px 0 0">${storeName} · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}</p>
</td></tr>
<tr><td style="padding:24px 32px">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="padding:16px;background:#f0f9ff;border-radius:8px;width:50%;text-align:center;border:1px solid #bae6fd">
<p style="font-size:11px;color:#0369a1;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Revenue</p>
<p style="font-size:28px;font-weight:700;color:#075985;margin:0">KSh ${totalRevenue.toLocaleString()}</p>
</td>
<td style="width:16px"></td>
<td style="padding:16px;background:#f0fdf4;border-radius:8px;width:50%;text-align:center;border:1px solid #bbf7d0">
<p style="font-size:11px;color:#15803d;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Sales</p>
<p style="font-size:28px;font-weight:700;color:#166534;margin:0">${totalSales}</p>
</td>
</tr>
</table>
<p style="font-size:13px;color:#475569;margin:16px 0 4px"><strong>${totalItems}</strong> items sold today</p>
${lowStock.length > 0 ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
<tr><td style="padding:12px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca">
<p style="font-size:12px;font-weight:600;color:#991b1b;margin:0 0 8px">Low Stock Products (${lowStock.length})</p>
${lowStock.slice(0, 10).map(p => `<p style="font-size:12px;color:#7f1d1d;margin:2px 0;display:flex;justify-content:space-between"><span>${p.name}</span><span style="font-weight:600">${p.stock} left</span></p>`).join("")}
${lowStock.length > 10 ? `<p style="font-size:11px;color:#991b1b;margin:4px 0 0">+${lowStock.length - 10} more</p>` : ""}
</td></tr></table>` : ""}
</td></tr>
<tr><td style="padding:0 32px 32px">
<a href="https://keel.framestudio.co.ke" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-size:13px;font-weight:500;padding:10px 24px;border-radius:8px">View Dashboard</a>
<p style="font-size:11px;color:#94a3b8;margin:12px 0 0">Keel — Inventory management for growing shops</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend error:", res.status, errBody);
      return new Response(JSON.stringify({ error: "Failed to send" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-daily-summary error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
