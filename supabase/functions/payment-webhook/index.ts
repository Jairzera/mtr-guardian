import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-token",
};

// Generate a deterministic temporary password from the buyer's document
function generateTempPassword(document: string): string {
  // Clean the document (remove dots, dashes, slashes)
  const cleaned = document.replace(/[.\-\/]/g, "");
  return cleaned;
}

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
    // ── 1. Parse the full payload and log it for analysis ──
    const rawBody = await req.text();
    console.log("=== WEBHOOK RAW PAYLOAD ===");
    console.log(rawBody);
    console.log("=== WEBHOOK HEADERS ===");
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

    console.log("=== WEBHOOK PARSED PAYLOAD ===");
    console.log(JSON.stringify(payload, null, 2));

    // ── 2. Token validation (will be enforced once the token is configured) ──
    const webhookToken = Deno.env.get("PAYMENT_WEBHOOK_TOKEN");
    if (webhookToken) {
      // Check multiple possible header locations
      const receivedToken =
        req.headers.get("x-webhook-token") ||
        req.headers.get("authorization")?.replace("Bearer ", "") ||
        req.headers.get("x-api-key") ||
        // Also check if it's in the payload itself
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

    // ── 3. Extract buyer data (adaptive — tries common payment platform fields) ──
    // These mappings will be refined after analyzing the first test event
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

    const name =
      buyer?.name ||
      buyer?.full_name ||
      buyer?.fullName ||
      buyer?.nome ||
      buyer?.Name ||
      payload?.name ||
      payload?.data?.name;

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

    const phone =
      buyer?.phone ||
      buyer?.phone_number ||
      buyer?.telefone ||
      buyer?.Phone ||
      payload?.phone ||
      payload?.data?.phone ||
      "";

    // Identify the event/offer for future multi-event support
    const eventType =
      payload?.event ||
      payload?.type ||
      payload?.event_type ||
      payload?.status ||
      "purchase_approved";

    const offerId =
      payload?.offer_id ||
      payload?.offer?.id ||
      payload?.data?.offer_id ||
      payload?.product_id ||
      null;

    console.log("Extracted data:", { email, name, document, phone, eventType, offerId });

    if (!email) {
      console.error("No email found in payload. Full payload logged above.");
      return new Response(
        JSON.stringify({
          error: "Email not found in payload",
          hint: "Payload logged for analysis. Will adapt mapping after review.",
        }),
        {
          status: 200, // Return 200 so the platform doesn't retry
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

    // ── 5. Idempotency — check if user already exists ──
    const { data: existingUsers } =
      await supabase.auth.admin.listUsers();
    
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email === email.toLowerCase().trim()
    );

    if (existingUser) {
      console.log("User already exists:", existingUser.id);
      return new Response(
        JSON.stringify({
          success: true,
          message: "User already exists",
          user_id: existingUser.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 6. Create user with temporary password ──
    const tempPassword = document
      ? generateTempPassword(document)
      : email.split("@")[0] + "2026!";

    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name || "",
          document: document || "",
          phone: phone || "",
          must_change_password: true,
          created_via: "payment_webhook",
          offer_id: offerId,
        },
      });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create user", detail: createError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User created:", newUser.user.id);

    // ── 7. Assign default role (generator) ──
    const { error: roleError } = await supabase.rpc("assign_user_role", {
      _user_id: newUser.user.id,
      _role: "generator",
    });

    if (roleError) {
      console.error("Error assigning role:", roleError);
    }

    // ── 8. Create company_settings entry ──
    const { error: settingsError } = await supabase
      .from("company_settings")
      .upsert(
        {
          user_id: newUser.user.id,
          razao_social: name || "",
          cnpj: document || "",
          phone: phone || "",
          responsavel: name || "",
          subscription_status: "active",
          plan: "standard",
        },
        { onConflict: "user_id" }
      );

    if (settingsError) {
      console.error("Error creating company settings:", settingsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        user_id: newUser.user.id,
      }),
      {
        status: 201,
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
