import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── 1. Parse payload and log for analysis ──
    const rawBody = await req.text();
    console.log("=== REFUSED WEBHOOK RAW PAYLOAD ===");
    console.log(rawBody);
    console.log("=== REFUSED WEBHOOK HEADERS ===");
    const headerEntries: Record<string, string> = {};
    req.headers.forEach((v, k) => (headerEntries[k] = v));
    console.log(JSON.stringify(headerEntries, null, 2));

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("=== REFUSED WEBHOOK PARSED PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));

    // ── 2. Token validation ──
    const webhookToken = Deno.env.get("PAYMENT_WEBHOOK_TOKEN");
    if (webhookToken) {
      const receivedToken =
        req.headers.get("x-webhook-token") ||
        req.headers.get("authorization")?.replace("Bearer ", "") ||
        req.headers.get("x-api-key") ||
        payload?.token ||
        payload?.webhook_token;

      if (receivedToken !== webhookToken) {
        console.error("Token validation failed. Received:", receivedToken);
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("Token validation passed.");
    } else {
      console.warn(
        "PAYMENT_WEBHOOK_TOKEN not configured — accepting all requests for testing."
      );
    }

    // ── 3. Extract buyer identification (adaptive) ──
    const buyer =
      payload.customer ||
      payload.buyer ||
      payload.client ||
      payload.data?.customer ||
      payload.data?.buyer ||
      payload.data?.client ||
      payload;

    const email =
      buyer?.email ||
      buyer?.Email ||
      payload?.email ||
      payload?.data?.email;

    const document =
      buyer?.document ||
      buyer?.doc ||
      buyer?.cpf ||
      buyer?.cnpj ||
      buyer?.cpf_cnpj ||
      buyer?.taxId ||
      buyer?.tax_id ||
      buyer?.Document ||
      payload?.document ||
      payload?.data?.document;

    const eventType =
      payload?.event ||
      payload?.type ||
      payload?.event_type ||
      payload?.status ||
      "purchase_refused";

    console.log("Extracted data:", { email, document, eventType });

    if (!email && !document) {
      console.error("No identifier found in payload.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No identifier found. Event logged for analysis.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 4. Supabase admin client ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 5. Find user by email ──
    let targetUserId: string | null = null;

    if (email) {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const found = usersData?.users?.find(
        (u: any) => u.email === email.toLowerCase().trim()
      );
      if (found) targetUserId = found.id;
    }

    // Fallback: search by document in company_settings
    if (!targetUserId && document) {
      const cleaned = document.replace(/[.\-\/]/g, "");
      const { data: settings } = await supabase
        .from("company_settings")
        .select("user_id")
        .eq("cnpj", cleaned)
        .limit(1)
        .maybeSingle();

      if (settings) targetUserId = settings.user_id;
    }

    if (!targetUserId) {
      console.log("User not found. No action taken. Event logged.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "User not found. Event logged.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User found:", targetUserId);

    // ── 6. Check idempotency — already blocked? ──
    const { data: currentSettings } = await supabase
      .from("company_settings")
      .select("subscription_status")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (currentSettings?.subscription_status === "blocked") {
      console.log("User already blocked. Idempotent — no action.");
      return new Response(
        JSON.stringify({
          success: true,
          message: "User already blocked",
          user_id: targetUserId,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 7. Block user — ban via Auth Admin (invalidates all sessions) ──
    const { error: banError } = await supabase.auth.admin.updateUserById(
      targetUserId,
      { ban_duration: "876600h" } // ~100 years = effectively permanent
    );

    if (banError) {
      console.error("Error banning user:", banError);
      return new Response(
        JSON.stringify({ error: "Failed to ban user", detail: banError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User banned via Auth Admin:", targetUserId);

    // ── 8. Update company_settings status to blocked ──
    const { error: updateError } = await supabase
      .from("company_settings")
      .update({ subscription_status: "blocked" })
      .eq("user_id", targetUserId);

    if (updateError) {
      console.error("Error updating company_settings:", updateError);
    }

    console.log("User fully blocked:", targetUserId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User blocked successfully",
        user_id: targetUserId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
