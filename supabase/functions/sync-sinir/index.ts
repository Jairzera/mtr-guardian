import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SINIR WebService base URLs
const SINIR_WS_BASE = "https://mtr.sinir.gov.br/ws/rest/v1";
const SINIR_API_BASE = "https://mtr.sinir.gov.br/api/v1";

interface SinirMTR {
  manNumero: string;
  manData: string;
  manQtde: number;
  manUnidade: string;
  resDescricao: string;
  resCodigo: string;
  parRazaoSocialGerador: string;
  parRazaoSocialTransportador: string;
  parRazaoSocialDestinador: string;
  parCnpjDestinador: string;
  manSituacao: string;
  manTratamento: string;
}

interface SinirCDF {
  cdfNumero: string;
  cdfDataEmissao: string;
  cdfSituacao: string;
  mtrsVinculados: string[];
  parRazaoSocialDestinador: string;
}

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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch user's SINIR API token
    const { data: settings, error: dbError } = await serviceClient
      .from("company_settings")
      .select("gov_api_token, razao_social, cnpj")
      .eq("user_id", userId)
      .maybeSingle();

    if (dbError || !settings?.gov_api_token) {
      return new Response(
        JSON.stringify({ error: "Token SINIR não configurado. Vá em Configurações > Integrações." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const govToken = settings.gov_api_token;
    const sinirAuth = `Bearer ${govToken}`;

    const results = {
      mtrs_synced: 0,
      cdfs_synced: 0,
      errors: [] as string[],
      mtrs: [] as any[],
      cdfs: [] as any[],
    };

    // 1. Try fetching MTRs from SINIR
    try {
      const mtrsResponse = await fetch(`${SINIR_WS_BASE}/consultar/mtrs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: sinirAuth,
        },
      });

      if (mtrsResponse.ok) {
        const mtrsBody = await mtrsResponse.json();
        const sinirMtrs: SinirMTR[] = mtrsBody?.objetoResposta || mtrsBody?.data || [];

        for (const mtr of sinirMtrs) {
          try {
            // Check if MTR already exists
            const { data: existing } = await serviceClient
              .from("waste_manifests")
              .select("id")
              .eq("user_id", userId)
              .eq("mtr_number", mtr.manNumero)
              .maybeSingle();

            if (!existing) {
              // Map SINIR status to internal status
              const statusMap: Record<string, string> = {
                "EMITIDO": "pendente",
                "EM_TRANSPORTE": "em_transito",
                "RECEBIDO": "received",
                "DESTINADO": "completed",
                "CANCELADO": "pendente",
              };

              const { data: inserted, error: insertErr } = await serviceClient
                .from("waste_manifests")
                .insert({
                  user_id: userId,
                  mtr_number: mtr.manNumero,
                  waste_class: mtr.resDescricao || mtr.resCodigo || "Não classificado",
                  weight_kg: mtr.manQtde || 0,
                  unit: mtr.manUnidade?.toLowerCase() === "litros" ? "L" : "kg",
                  transporter_name: mtr.parRazaoSocialTransportador || settings.razao_social || "",
                  destination_type: mtr.manTratamento || "Reciclagem",
                  destination_company_name: mtr.parRazaoSocialDestinador || null,
                  destination_cnpj: mtr.parCnpjDestinador || null,
                  status: statusMap[mtr.manSituacao] || "pendente",
                  origin: "sinir_sync",
                  transport_date: mtr.manData || null,
                })
                .select("id")
                .single();

              if (!insertErr && inserted) {
                results.mtrs_synced++;
                results.mtrs.push({
                  id: inserted.id,
                  mtr_number: mtr.manNumero,
                  status: mtr.manSituacao,
                });
              }
            }
          } catch (e) {
            results.errors.push(`MTR ${mtr.manNumero}: ${e.message}`);
          }
        }
      } else {
        const body = await mtrsResponse.text();
        console.error("SINIR MTRs response:", mtrsResponse.status, body);
        results.errors.push(`Erro ao buscar MTRs do SINIR (${mtrsResponse.status})`);
      }
    } catch (e) {
      console.error("MTR fetch error:", e);
      results.errors.push(`Falha na conexão com SINIR para MTRs: ${e.message}`);
    }

    // 2. Try fetching CDFs from SINIR
    try {
      const cdfsResponse = await fetch(`${SINIR_WS_BASE}/consultar/cdfs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: sinirAuth,
        },
      });

      if (cdfsResponse.ok) {
        const cdfsBody = await cdfsResponse.json();
        const sinirCdfs: SinirCDF[] = cdfsBody?.objetoResposta || cdfsBody?.data || [];

        for (const cdf of sinirCdfs) {
          try {
            // Check if CDF already exists
            const { data: existing } = await serviceClient
              .from("cdfs")
              .select("id")
              .eq("cdf_number", cdf.cdfNumero)
              .eq("generator_id", userId)
              .maybeSingle();

            if (!existing) {
              const { data: inserted, error: insertErr } = await serviceClient
                .from("cdfs")
                .insert({
                  cdf_number: cdf.cdfNumero,
                  generator_id: userId,
                  receiver_id: userId,
                  issue_date: cdf.cdfDataEmissao || new Date().toISOString().split("T")[0],
                  status: cdf.cdfSituacao === "CANCELADO" ? "CANCELLED" : "VALID",
                })
                .select("id")
                .single();

              if (!insertErr && inserted) {
                results.cdfs_synced++;
                results.cdfs.push({
                  id: inserted.id,
                  cdf_number: cdf.cdfNumero,
                });

                // Link MTRs to this CDF
                if (cdf.mtrsVinculados?.length) {
                  for (const mtrNum of cdf.mtrsVinculados) {
                    await serviceClient
                      .from("waste_manifests")
                      .update({ cdf_id: inserted.id, status: "completed" })
                      .eq("mtr_number", mtrNum)
                      .eq("user_id", userId);
                  }
                }
              }
            }
          } catch (e) {
            results.errors.push(`CDF ${cdf.cdfNumero}: ${e.message}`);
          }
        }
      } else {
        const body = await cdfsResponse.text();
        console.error("SINIR CDFs response:", cdfsResponse.status, body);
        results.errors.push(`Erro ao buscar CDFs do SINIR (${cdfsResponse.status})`);
      }
    } catch (e) {
      console.error("CDF fetch error:", e);
      results.errors.push(`Falha na conexão com SINIR para CDFs: ${e.message}`);
    }

    // 3. Also try the general status endpoint to verify connection
    let connectionOk = false;
    try {
      const statusRes = await fetch(`${SINIR_API_BASE}/status`, {
        method: "GET",
        headers: { Authorization: sinirAuth, Accept: "application/json" },
      });
      connectionOk = statusRes.ok;
      await statusRes.text(); // consume body
    } catch {
      connectionOk = false;
    }

    return new Response(
      JSON.stringify({
        success: true,
        connection_ok: connectionOk,
        mtrs_synced: results.mtrs_synced,
        cdfs_synced: results.cdfs_synced,
        mtrs: results.mtrs,
        cdfs: results.cdfs,
        errors: results.errors,
        message: results.mtrs_synced + results.cdfs_synced > 0
          ? `Sincronização concluída: ${results.mtrs_synced} MTR(s) e ${results.cdfs_synced} CDF(s) importados.`
          : results.errors.length > 0
            ? `Sincronização concluída com erros. Verifique seu token SINIR.`
            : "Nenhum dado novo encontrado no SINIR.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Internal error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
