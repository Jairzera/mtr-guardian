import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export function useReceiverDashboard() {
  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["receiver-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("weight_kg, unit, status, waste_class, created_at, received_weight");
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    // Cargas a Receber (em trânsito)
    const pendingLoads = manifests.filter(
      (m) => m.status === "enviado" || m.status === "em_transito" || m.status === "aguardando_validacao"
    ).length;

    // Total Recebido este mês (kg → ton)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let totalReceivedKg = 0;
    let receivedCount = 0;
    for (const m of manifests) {
      if ((m.status === "received" || m.status === "completed") && new Date(m.created_at) >= monthStart) {
        totalReceivedKg += m.received_weight ?? m.weight_kg;
        receivedCount++;
      }
    }
    const totalReceivedTon = totalReceivedKg / 1000;
    const totalFormatted = totalReceivedTon.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    // Certificados emitidos (status "received" = CDF gerado)
    const certificatesCount = manifests.filter((m) => m.status === "received" || m.status === "completed").length;

    // Gráfico: Volume por tipo de resíduo (received only)
    const byClass: Record<string, number> = {};
    for (const m of manifests) {
      if (m.status === "received" || m.status === "completed") {
        const cls = m.waste_class || "Outros";
        const short = cls.length > 20 ? cls.substring(0, 18) + "…" : cls;
        byClass[short] = (byClass[short] || 0) + (m.received_weight ?? m.weight_kg);
      }
    }

    const chartData = Object.entries(byClass)
      .map(([tipo, volume]) => ({
        tipo,
        volume: Math.round((volume / 1000) * 100) / 100, // ton
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8);

    return {
      pendingLoads: String(pendingLoads),
      totalReceived: `${totalFormatted} Ton`,
      certificatesCount: String(certificatesCount),
      chartData,
    };
  }, [manifests]);

  return { ...stats, isLoading };
}
