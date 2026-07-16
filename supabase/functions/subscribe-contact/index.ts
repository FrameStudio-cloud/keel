import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SEGMENT_ID = "46a8db96-684d-47c7-87a6-0d9dd1414b41";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { email, store_name, shop_id, unsubscribed } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: store_name || "",
        unsubscribed: !!unsubscribed,
        properties: {
          shop_id: shop_id || "",
          shop_name: store_name || "",
        },
        segments: [{ id: SEGMENT_ID }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend contacts API error:", res.status, errBody);
      return new Response(JSON.stringify({ error: "Failed to subscribe contact" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("subscribe-contact error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
