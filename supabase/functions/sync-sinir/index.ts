import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * sync-sinir — NEW ARCHITECTURE
 * 
 * CicloMTR is the source of truth. The SINIR API does NOT provide a "list all MTRs" endpoint.
 * This function now handles:
 * 1. Downloading PDFs for MTRs created by CicloMTR that don't have a PDF yet
 * 2. Validating the SINIR connection is active
 * 
 * MTRs are only created via /salvarManifestoLote through the sinir-api edge function.
 */

const SINIR_BASE = "https://mtr.sinir.gov.br";

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

    // Get gov token
    const { data: settings } = await serviceClient
      .from("company_settings")
      .select("gov_api_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (!settings?.gov_api_token) {
      return new Response(
        JSON.stringify({ error: "Token SINIR não configurado. Vá em Configurações > Integrações." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const govToken = settings.gov_api_token;
    const results = { pdfs_downloaded: 0, errors: [] as string[] };

    // Find MTRs created by CicloMTR that have an mtr_number but no pdf_url
    const { data: mtrsWithoutPdf } = await serviceClient
      .from("waste_manifests")
      .select("id, mtr_number")
      .eq("user_id", userId)
      .eq("origin", "ciclomtr")
      .not("mtr_number", "is", null)
      .is("pdf_url", null)
      .limit(50);

    if (mtrsWithoutPdf?.length) {
      for (const mtr of mtrsWithoutPdf) {
        try {
          const res = await fetch(`${SINIR_BASE}/downloadManifesto`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${govToken}`,
            },
            body: JSON.stringify({ manNumero: mtr.mtr_number }),
          });

          if (res.ok) {
            const pdfBuffer = await res.arrayBuffer();
            const filePath = `sinir-pdfs/${userId}/${mtr.mtr_number}.pdf`;

            await serviceClient.storage
              .from("mtr_documents")
              .upload(filePath, new Uint8Array(pdfBuffer), {
                contentType: "application/pdf",
                upsert: true,
              });

            const { data: signedUrl } = await serviceClient.storage
              .from("mtr_documents")
              .createSignedUrl(filePath, 365 * 24 * 60 * 60); // 1 year

            if (signedUrl?.signedUrl) {
              await serviceClient
                .from("waste_manifests")
                .update({ pdf_url: signedUrl.signedUrl })
                .eq("id", mtr.id);
              results.pdfs_downloaded++;
            }
          } else {
            const body = await res.text();
            console.error(`PDF download failed for ${mtr.mtr_number}:`, res.status, body.substring(0, 200));
            results.errors.push(`PDF ${mtr.mtr_number}: erro ${res.status}`);
          }
        } catch (e) {
          results.errors.push(`PDF ${mtr.mtr_number}: ${e.message}`);
        }
      }
    }

    // Test connection
    let connectionOk = false;
    try {
      const res = await fetch(`${SINIR_BASE}/retornaListaUnidade`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${govToken}`,
        },
      });
      connectionOk = res.ok;
      await res.text();
    } catch {
      connectionOk = false;
    }

    return new Response(
      JSON.stringify({
        success: true,
        connection_ok: connectionOk,
        pdfs_downloaded: results.pdfs_downloaded,
        errors: results.errors,
        message: results.pdfs_downloaded > 0
          ? `Sincronização concluída: ${results.pdfs_downloaded} PDF(s) baixados.`
          : results.errors.length > 0
            ? "Sincronização concluída com erros."
            : "Tudo sincronizado. Nenhum PDF pendente.",
        architecture: "CicloMTR é a fonte da verdade. MTRs são criados via /salvarManifestoLote.",
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
