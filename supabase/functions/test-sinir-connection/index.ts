import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claims.claims.sub as string;

    // Fetch gov_api_token using service role to bypass RLS
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: settings, error: dbError } = await serviceClient
      .from("company_settings")
      .select("gov_api_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Erro ao buscar token no banco de dados." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const govToken = settings?.gov_api_token;
    if (!govToken) {
      return new Response(
        JSON.stringify({ error: "Token API não encontrado. Salve seu token primeiro." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Test connection to SINIR API (placeholder URL — adjust later)
    const SINIR_API_URL = "https://mtr.sinir.gov.br/api/v1/status";

    try {
      const sinirResponse = await fetch(SINIR_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${govToken}`,
          Accept: "application/json",
        },
      });

      if (sinirResponse.ok) {
        const body = await sinirResponse.text();
        return new Response(
          JSON.stringify({ success: true, status: sinirResponse.status, message: "Conexão com o SINIR estabelecida com sucesso!" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        const body = await sinirResponse.text();
        console.error("SINIR response:", sinirResponse.status, body);

        if (sinirResponse.status === 401 || sinirResponse.status === 403) {
          return new Response(
            JSON.stringify({ success: false, error: "Token inválido ou expirado." }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: `Erro na API do SINIR (${sinirResponse.status}).` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(
        JSON.stringify({ success: false, error: "Não foi possível conectar à API do SINIR. Verifique a URL." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Internal error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
