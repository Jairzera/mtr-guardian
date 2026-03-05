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

    // Parse body for optional token to save
    let newToken: string | null = null;
    try {
      const body = await req.json();
      if (body?.gov_api_token && typeof body.gov_api_token === "string") {
        newToken = body.gov_api_token.trim();
        if (newToken.length === 0 || newToken.length > 500) {
          return new Response(
            JSON.stringify({ error: "Token inválido." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } catch {
      // No body or invalid JSON — proceed without saving
    }

    // Use service role to read/write gov_api_token (never exposed to client)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Save token if provided (upsert to handle users without existing settings)
    if (newToken) {
      const { error: saveError } = await serviceClient
        .from("company_settings")
        .upsert(
          { user_id: userId, gov_api_token: newToken },
          { onConflict: "user_id" }
        );

      if (saveError) {
        console.error("Save error:", saveError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar o token." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch token
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

    // Test connection using a lightweight list endpoint
    const SINIR_TEST_URL = "https://mtr.sinir.gov.br/retornaListaUnidade";

    try {
      const sinirResponse = await fetch(SINIR_TEST_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${govToken}`,
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
