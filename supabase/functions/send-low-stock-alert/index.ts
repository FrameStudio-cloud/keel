import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AlertPayload {
  shop_id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: AlertPayload = await req.json();
    const { shop_id, product_id, product_name, current_stock, threshold } = payload;

    if (!shop_id || !product_id || !product_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data: settings, error: settingsError } = await supabase
      .from("store_settings")
      .select("store_name, notification_preferences")
      .eq("shop_id", shop_id)
      .maybeSingle();

    if (settingsError) throw settingsError;

    const prefs = settings?.notification_preferences || {};
    if (prefs.low_stock_email === false) {
      return new Response(JSON.stringify({ ok: true, skipped: "low_stock_email disabled" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let recipientEmail = prefs.email || "";

    if (!recipientEmail) {
      const { data: userData } = await supabase
        .from("users")
        .select("email")
        .eq("shop_id", shop_id)
        .limit(1)
        .single();

      if (userData?.email) {
        recipientEmail = userData.email;
      }
    }

    if (!recipientEmail) {
      return new Response(JSON.stringify({ ok: true, skipped: "no email configured" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

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
        subject: `⚠️ Low Stock Alert — ${product_name}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f8fafc">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <tr>
          <td style="padding:32px 32px 0">
            <h1 style="font-size:20px;font-weight:600;color:#1e293b;margin:0 0 4px">Low Stock Alert</h1>
            <p style="font-size:14px;color:#64748b;margin:0">${storeName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:16px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:13px;color:#991b1b;padding-bottom:8px"><strong>${product_name}</strong></td>
                    </tr>
                    <tr>
                      <td style="font-size:32px;font-weight:700;color:#dc2626;padding-bottom:4px">${current_stock}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px;color:#b91c1c">units remaining (threshold: ${threshold})</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px">
            <p style="font-size:13px;color:#475569;margin:0 0 12px;line-height:1.5">
              This product has dropped below your low-stock threshold of <strong>${threshold}</strong>.
              <a href="https://keel.framestudio.co.ke/inventory" style="color:#2563eb;text-decoration:underline">View in Keel</a>
            </p>
            <p style="font-size:12px;color:#94a3b8;margin:0">
              Keel — Inventory management for growing shops
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend API error:", res.status, errBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-low-stock-alert error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
