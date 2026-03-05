import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function sinirAction(action: string, payload: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke("sinir-api", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || "Erro na comunicação com o SINIR");
  if (!data?.ok) throw new Error(data?.error || "Erro ao consultar SINIR");
  return data.data;
}

export function useSinirResiduos(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-residuo"],
    queryFn: () => sinirAction("lista-residuo"),
    enabled,
    staleTime: 1000 * 60 * 60, // 1h cache
    retry: 1,
  });
}

export function useSinirClasses(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-classe"],
    queryFn: () => sinirAction("lista-classe"),
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirClassesPorResiduo(residuoId: string | null) {
  return useQuery({
    queryKey: ["sinir", "lista-classe-por-residuo", residuoId],
    queryFn: () => sinirAction("lista-classe-por-residuo", { residuoId }),
    enabled: !!residuoId,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirEstadosFisicos(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-estado-fisico"],
    queryFn: () => sinirAction("lista-estado-fisico"),
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirAcondicionamentos(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-acondicionamento"],
    queryFn: () => sinirAction("lista-acondicionamento"),
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirAcondicionamentosPorEstadoFisico(estadoFisicoId: string | null) {
  return useQuery({
    queryKey: ["sinir", "lista-acondicionamento-por-estado-fisico", estadoFisicoId],
    queryFn: () => sinirAction("lista-acondicionamento-por-estado-fisico", { estadoFisicoId }),
    enabled: !!estadoFisicoId,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirTratamentos(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-tratamento"],
    queryFn: () => sinirAction("lista-tratamento"),
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

export function useSinirUnidades(enabled = true) {
  return useQuery({
    queryKey: ["sinir", "lista-unidade"],
    queryFn: () => sinirAction("lista-unidade"),
    enabled,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}

// Utility function for one-off calls
export async function sinirSalvarManifestoLote(payload: Record<string, any>) {
  return sinirAction("salvar-manifesto-lote", payload);
}

export async function sinirDownloadManifesto(payload: Record<string, any>) {
  return sinirAction("download-manifesto", payload);
}

export async function sinirReceberManifestoLote(payload: Record<string, any>) {
  return sinirAction("receber-manifesto-lote", payload);
}

export async function sinirAlteraRecebimento(payload: Record<string, any>) {
  return sinirAction("altera-recebimento", payload);
}

export async function sinirAceiteAlteracaoRecebimento(payload: Record<string, any>) {
  return sinirAction("aceite-alteracao-recebimento", payload);
}

export async function sinirMunicipioPorCep(cep: string) {
  return sinirAction("municipio-por-cep", { cep });
}
