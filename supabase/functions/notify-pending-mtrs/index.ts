import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all pending manifests grouped by user
    const { data: manifests, error: mError } = await supabase
      .from("waste_manifests")
      .select("user_id, status, expiration_date")
      .in("status", ["pendente"]);

    if (mError) throw mError;
    if (!manifests || manifests.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum MTR pendente encontrado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group by user_id
    const userMap: Record<string, number> = {};
    for (const m of manifests) {
      userMap[m.user_id] = (userMap[m.user_id] || 0) + 1;
    }

    const results: { email: string; success: boolean }[] = [];

    for (const [userId, count] of Object.entries(userMap)) {
      // Get user email
      const { data: userData, error: uError } = await supabase.auth.admin.getUserById(userId);
      if (uError || !userData?.user?.email) continue;

      const email = userData.user.email;

      // Get company name
      const { data: settings } = await supabase
        .from("company_settings")
        .select("razao_social")
        .eq("user_id", userId)
        .single();

      const companyName = settings?.razao_social || "sua empresa";

      // Send email via Resend
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CicloMTR <onboarding@resend.dev>",
          to: [email],
          subject: `⚠️ ${count} MTR(s) pendente(s) - ${companyName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #16a34a;">🔄 CicloMTR - Alerta de MTRs Pendentes</h2>
              <p>Olá,</p>
              <p>Identificamos que <strong>${count} MTR(s)</strong> da empresa <strong>${companyName}</strong> estão com status <strong>pendente</strong> e requerem sua atenção.</p>
              <p>Acesse o sistema para revisar e regularizar os manifestos pendentes.</p>
              <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-weight: bold;">⚠️ MTRs pendentes podem resultar em não-conformidade ambiental.</p>
              </div>
              <p style="color: #6b7280; font-size: 12px;">Este é um e-mail automático do CicloMTR. Você pode desativar alertas nas configurações do sistema.</p>
            </div>
          `,
        }),
      });

      const resendData = await resendRes.json();
      results.push({ email, success: resendRes.ok });

      if (!resendRes.ok) {
        console.error(`Failed to send to ${email}:`, resendData);
      }
    }

    return new Response(
      JSON.stringify({ sent: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
