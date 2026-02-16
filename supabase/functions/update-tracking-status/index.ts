import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  enviado: ["em_transito"],
  em_transito: ["aguardando_validacao"],
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { manifest_id, tracking_token, new_status, action } = await req.json();

    // Input validation
    if (!manifest_id || !tracking_token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS since this is a public endpoint with token auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch manifest and validate token
    const { data: manifest, error: fetchError } = await supabase
      .from("waste_manifests")
      .select("id, status, tracking_token")
      .eq("id", manifest_id)
      .maybeSingle();

    if (fetchError || !manifest) {
      return new Response(
        JSON.stringify({ error: "Manifest not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate tracking token
    if (!manifest.tracking_token || manifest.tracking_token !== tracking_token) {
      return new Response(
        JSON.stringify({ error: "Invalid tracking token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If action is "validate", just return the current status
    if (action === "validate") {
      return new Response(
        JSON.stringify({ success: true, status: manifest.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!new_status) {
      return new Response(
        JSON.stringify({ error: "Missing new_status" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate new_status is an allowed value
    const allowedStatuses = ["em_transito", "aguardando_validacao"];
    if (!allowedStatuses.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: "Invalid status transition" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[manifest.status];
    if (!allowed || !allowed.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: `Cannot transition from '${manifest.status}' to '${new_status}'` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform the update
    const { error: updateError } = await supabase
      .from("waste_manifests")
      .update({ status: new_status })
      .eq("id", manifest_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, status: new_status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("update-tracking-status error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
