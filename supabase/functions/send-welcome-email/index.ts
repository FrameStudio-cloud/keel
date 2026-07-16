import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, store_name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const displayName = store_name || "there";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Keel <keel@keel.framestudio.co.ke>",
        to: email,
        subject: `Welcome to Keel, ${displayName}!`,
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f8fafc">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
        <tr>
          <td style="padding:32px 32px 0;text-align:center">
            <h1 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 4px">Welcome to Keel!</h1>
            <p style="font-size:14px;color:#64748b;margin:0">${displayName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px">
            <p style="font-size:14px;color:#475569;margin:0 0 16px;line-height:1.6">
              You're all set. Here are a few things to get you started:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
                  <a href="https://keel.framestudio.co.ke/inventory" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:500">Add your products</a>
                  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0">Stock, prices, barcodes, and variants</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
                  <a href="https://keel.framestudio.co.ke/settings" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:500">Customize your shop</a>
                  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0">Store name, currency, theme, and more</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
                  <a href="https://keel.framestudio.co.ke/website" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:500">Set up your website</a>
                  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0">Banners, gallery, and chat widget</p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 0">
                  <a href="https://keel.framestudio.co.ke/storefront" style="font-size:14px;color:#2563eb;text-decoration:none;font-weight:500">Deploy a storefront</a>
                  <p style="font-size:12px;color:#94a3b8;margin:2px 0 0">A live catalogue site your customers can browse</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px">
            <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5">
              You'll receive occasional product updates, tips, and feature announcements.
              You can adjust your preferences anytime in Settings &rarr; Notifications.
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
      console.error("Resend email API error:", res.status, errBody);
      return new Response(JSON.stringify({ error: "Failed to send welcome email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-welcome-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
