import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// SINIR API base — all endpoints are relative to this
const SINIR_BASE = "https://mtr.sinir.gov.br";

// ---------- helpers ----------
async function getGovToken(serviceClient: any, userId: string): Promise<string | null> {
  const { data } = await serviceClient
    .from("company_settings")
    .select("gov_api_token")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.gov_api_token || null;
}

async function sinirFetch(path: string, govToken: string, options: RequestInit = {}) {
  const url = `${SINIR_BASE}${path}`;
  console.log(`[sinir-api] ${options.method || "GET"} ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${govToken}`,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  // SINIR sometimes returns HTML instead of JSON when unstable
  if (!res.ok || text.trimStart().startsWith("<")) {
    console.error(`[sinir-api] ${res.status} response:`, text.substring(0, 500));
    return {
      ok: false,
      status: res.status,
      error: text.trimStart().startsWith("<")
        ? "Portal SINIR temporariamente indisponível. Tente novamente em alguns minutos."
        : `Erro SINIR (${res.status}): ${text.substring(0, 200)}`,
      data: null,
    };
  }

  try {
    const json = JSON.parse(text);
    return { ok: true, status: res.status, error: null, data: json };
  } catch {
    return { ok: false, status: res.status, error: "Resposta inválida do SINIR", data: null };
  }
}

// ---------- action handlers ----------

async function handleListaResiduo(govToken: string) {
  return sinirFetch("/retornaListaResiduo", govToken);
}

async function handleListaClasse(govToken: string) {
  return sinirFetch("/retornaListaClasse", govToken);
}

async function handleListaClassePorResiduo(govToken: string, body: any) {
  return sinirFetch("/retornaListaClassePorResiduo", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleListaEstadoFisico(govToken: string) {
  return sinirFetch("/retornaListaEstadoFisico", govToken);
}

async function handleListaAcondicionamento(govToken: string) {
  return sinirFetch("/retornaListaAcondicionamento", govToken);
}

async function handleListaAcondicionamentoPorEstadoFisico(govToken: string, body: any) {
  return sinirFetch("/retornaListaAcondicionamentoPorEstadoFisico", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleListaTratamento(govToken: string) {
  return sinirFetch("/retornaListaTratamento", govToken);
}

async function handleListaUnidade(govToken: string) {
  return sinirFetch("/retornaListaUnidade", govToken);
}

async function handleMunicipioPeloCep(govToken: string, body: any) {
  return sinirFetch("/retornaMunicipioPeloCep", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleSalvarManifestoLote(govToken: string, body: any) {
  return sinirFetch("/salvarManifestoLote", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleDownloadManifesto(govToken: string, body: any) {
  // Download returns a PDF — handle differently
  const url = `${SINIR_BASE}/downloadManifesto`;
  console.log(`[sinir-api] POST ${url}`);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${govToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[sinir-api] download error ${res.status}:`, text.substring(0, 500));
    return {
      ok: false,
      status: res.status,
      error: `Erro ao baixar manifesto (${res.status})`,
      data: null,
    };
  }

  // Return base64 encoded PDF
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const pdfBase64 = btoa(binary);

  return {
    ok: true,
    status: 200,
    error: null,
    data: { pdf_base64: pdfBase64, content_type: res.headers.get("content-type") || "application/pdf" },
  };
}

async function handleReceberManifestoLote(govToken: string, body: any) {
  return sinirFetch("/receberManifestoLote", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleAlteraRecebimento(govToken: string, body: any) {
  return sinirFetch("/alteraRecebimento", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleAceiteAlteracaoRecebimento(govToken: string, body: any) {
  return sinirFetch("/aceiteAlteracaoRecebimento", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function handleGetToken(govToken: string, body: any) {
  return sinirFetch("/gettoken", govToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---------- main handler ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get gov token
    const govToken = await getGovToken(serviceClient, userId);
    if (!govToken) {
      return new Response(
        JSON.stringify({ error: "Token SINIR não configurado. Vá em Configurações > Integrações." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse action from body
    const body = await req.json().catch(() => ({}));
    const { action, ...payload } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Campo "action" é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route to handler
    const actionMap: Record<string, (govToken: string, payload: any) => Promise<any>> = {
      "lista-residuo": handleListaResiduo,
      "lista-classe": handleListaClasse,
      "lista-classe-por-residuo": handleListaClassePorResiduo,
      "lista-estado-fisico": handleListaEstadoFisico,
      "lista-acondicionamento": handleListaAcondicionamento,
      "lista-acondicionamento-por-estado-fisico": handleListaAcondicionamentoPorEstadoFisico,
      "lista-tratamento": handleListaTratamento,
      "lista-unidade": handleListaUnidade,
      "municipio-por-cep": handleMunicipioPeloCep,
      "salvar-manifesto-lote": handleSalvarManifestoLote,
      "download-manifesto": handleDownloadManifesto,
      "receber-manifesto-lote": handleReceberManifestoLote,
      "altera-recebimento": handleAlteraRecebimento,
      "aceite-alteracao-recebimento": handleAceiteAlteracaoRecebimento,
      "get-token": handleGetToken,
    };

    const handler = actionMap[action];
    if (!handler) {
      return new Response(
        JSON.stringify({ error: `Ação "${action}" não reconhecida.`, actions: Object.keys(actionMap) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await handler(govToken, payload);

    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : result.status || 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[sinir-api] Internal error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
