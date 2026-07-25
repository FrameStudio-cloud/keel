import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization, apikey, x-client-info",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { reference, shop_id } = await req.json();

    if (!reference || !shop_id) {
      return new Response(JSON.stringify({ error: "Missing reference or shop_id" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(JSON.stringify({
        error: "Payment not confirmed",
        gateway_response: verifyData.data?.gateway_response,
      }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const amountKobo = verifyData.data.amount;
    if (amountKobo !== 50000 && amountKobo !== 100000) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const isPro = amountKobo === 100000;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: shop, error: fetchError } = await supabase
      .from("shops")
      .select("subscription_expires_at")
      .eq("id", shop_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch shop:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to verify shop" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (!shop) {
      return new Response(JSON.stringify({ error: "Shop not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const current = shop.subscription_expires_at
      ? new Date(shop.subscription_expires_at)
      : now;
    const newExpiry = new Date(
      Math.max(current.getTime(), now.getTime()) + 30 * 86400000
    ).toISOString();

    const { error: updateError } = await supabase
      .from("shops")
      .update({ subscription_expires_at: newExpiry })
      .eq("id", shop_id);

    if (updateError) {
      console.error("Failed to update subscription:", updateError);
      return new Response(JSON.stringify({ error: "Database update failed" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    if (isPro) {
      const { error: planError } = await supabase
        .from("chat_config")
        .upsert(
          { shop_id, plan_tier: "pro", pro_until: newExpiry },
          { onConflict: "shop_id" }
        );

      if (planError) {
        console.error("Failed to update plan_tier:", planError);
      }
    }

    return new Response(JSON.stringify({ success: true, new_expiry: newExpiry }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-paystack-subscription error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
