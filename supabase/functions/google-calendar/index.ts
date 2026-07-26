import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, apikey, x-client-info",
};

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

function toRFC3339(dt: string): string {
  if (!dt) return dt;
  if (dt.includes("T")) {
    const d = new Date(dt);
    if (!isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const offset = -d.getTimezoneOffset();
      const sign = offset >= 0 ? "+" : "-";
      const tz = `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${tz}`;
    }
  }
  return dt;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(req.url);

  // GET = OAuth callback from Google
  if (req.method === "GET") {
    return handleOAuthCallback(url);
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  return handlePost(req);
});

async function handleOAuthCallback(url: URL) {
  try {
    const code = url.searchParams.get("code");
    const shopId = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      return Response.redirect(`${Deno.env.get("PUBLIC_APP_URL") || "https://keel.framestudio.co.ke"}/settings?calendar=error`, 302);
    }

    if (!code || !shopId) {
      console.error("Missing code or shop_id");
      return new Response("Missing parameters", { status: 400 });
    }

    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const redirectUri = Deno.env.get("GOOGLE_REDIRECT_URI") || `${url.origin}/functions/v1/google-calendar`;

    if (!clientId || !clientSecret) {
      console.error("Google OAuth not configured on server");
      return new Response("Server configuration error", { status: 500 });
    }

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.refresh_token) {
      console.error("No refresh_token received:", tokenData);
      return new Response("Authentication failed", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("google_integrations").upsert({
      shop_id: shopId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      google_email: tokenData.email || null,
      scope: tokenData.scope || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "shop_id" });

    return Response.redirect(
      `${Deno.env.get("PUBLIC_APP_URL") || "https://keel.framestudio.co.ke"}/settings?calendar=connected`,
      302
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return new Response("Internal error", { status: 500 });
  }
}

async function handlePost(req: Request) {
  try {
    const { action, shop_id, order_id, title, description, start_time, end_time, event_id } = await req.json();

    if (!shop_id || !action) {
      return new Response(JSON.stringify({ error: "Missing shop_id or action" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: integration, error: fetchError } = await supabase
      .from("google_integrations")
      .select("access_token, refresh_token, token_expires_at, calendar_id")
      .eq("shop_id", shop_id)
      .maybeSingle();

    if (fetchError || !integration) {
      return new Response(JSON.stringify({ error: "Google Calendar not connected" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    let accessToken = integration.access_token;

    // Refresh if expired
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      accessToken = await refreshAccessToken(integration.refresh_token);
      await supabase.from("google_integrations").update({
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("shop_id", shop_id);
    }

    const calendarId = integration.calendar_id || "primary";

    if (action === "create-event" || action === "update-event") {
      const fmtStart = toRFC3339(start_time);
      const fmtEnd = toRFC3339(end_time || start_time);

      if (!title || !fmtStart) {
        return new Response(JSON.stringify({ error: "Missing title or start_time" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const event = {
        summary: title,
        description: description || "",
        start: { dateTime: fmtStart, timeZone: "Africa/Nairobi" },
        end: { dateTime: fmtEnd, timeZone: "Africa/Nairobi" },
      };

      let calRes;
      if (action === "update-event" && event_id) {
        calRes = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${event_id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });
      } else {
        calRes = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });
      }

      const calData = await calRes.json();

      if (!calRes.ok) {
        console.error("Calendar API error:", calData);
        return new Response(JSON.stringify({ error: calData.error?.message || "Calendar API error" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      // Store event_id on the order
      if (order_id && calData.id) {
        await supabase.from("service_orders").update({
          calendar_event_id: calData.id,
          updated_at: new Date().toISOString(),
        }).eq("id", order_id).eq("shop_id", shop_id);
      }

      return new Response(JSON.stringify({
        success: true,
        event_id: calData.id,
        html_link: calData.htmlLink,
      }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (action === "delete-event") {
      if (!event_id) {
        return new Response(JSON.stringify({ error: "Missing event_id" }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const delRes = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${event_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!delRes.ok && delRes.status !== 410) {
        console.error("Delete event error:", await delRes.text());
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("google-calendar error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh token");
  return data.access_token;
}
