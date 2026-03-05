import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WasteCost {
  id: string;
  waste_class: string;
  cost_per_kg: number;
  transport_cost: number;
  contract_reference: string;
}

export interface ABCRow {
  wasteClass: string;
  volumeTon: number;
  volumePct: number;
  totalCost: number;
  costPct: number;
  cumulativePct: number;
  classification: "A" | "B" | "C";
}

type PeriodFilter = "month" | "quarter" | "year";

function periodStart(filter: PeriodFilter): string {
  const now = new Date();
  if (filter === "month") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  if (filter === "quarter") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    return new Date(now.getFullYear(), q, 1).toISOString();
  }
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export function useWasteCosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["waste_costs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_costs" as any)
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []) as unknown as WasteCost[];
    },
  });
}

export function useABCAnalysis(period: PeriodFilter) {
  const { user } = useAuth();
  const { data: costs = [] } = useWasteCosts();

  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["abc_manifests", user?.id, period],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("waste_class, weight_kg, unit, destination_cost, created_at")
        .eq("user_id", user!.id)
        .gte("created_at", periodStart(period));
      if (error) throw error;
      return data || [];
    },
  });

  const costMap = useMemo(() => {
    const m: Record<string, WasteCost> = {};
    costs.forEach((c) => (m[c.waste_class] = c));
    return m;
  }, [costs]);

  const { rows, totalCost, totalVolume, classCount } = useMemo(() => {
    const grouped: Record<string, { volume: number; cost: number }> = {};

    manifests.forEach((m: any) => {
      const cls = m.waste_class || "Outros";
      const weightKg = Number(m.weight_kg) || 0;
      const costEntry = costMap[cls];
      let itemCost = Number(m.destination_cost) || 0;
      if (!itemCost && costEntry) {
        itemCost = weightKg * costEntry.cost_per_kg + costEntry.transport_cost;
      }
      if (!grouped[cls]) grouped[cls] = { volume: 0, cost: 0 };
      grouped[cls].volume += weightKg;
      grouped[cls].cost += itemCost;
    });

    const entries = Object.entries(grouped).sort((a, b) => b[1].cost - a[1].cost);
    const totalCost = entries.reduce((s, [, v]) => s + v.cost, 0);
    const totalVolume = entries.reduce((s, [, v]) => s + v.volume, 0);

    let cumulative = 0;
    const rows: ABCRow[] = entries.map(([cls, v]) => {
      const costPct = totalCost > 0 ? (v.cost / totalCost) * 100 : 0;
      cumulative += costPct;
      return {
        wasteClass: cls,
        volumeTon: v.volume / 1000,
        volumePct: totalVolume > 0 ? (v.volume / totalVolume) * 100 : 0,
        totalCost: v.cost,
        costPct,
        cumulativePct: cumulative,
        classification: cumulative <= 80 ? "A" : cumulative <= 95 ? "B" : "C",
      };
    });

    return { rows, totalCost, totalVolume: totalVolume / 1000, classCount: entries.length };
  }, [manifests, costMap]);

  const avgCostPerTon = totalVolume > 0 ? totalCost / totalVolume : 0;
  const classAInsights = rows.filter((r) => r.classification === "A");

  return { rows, totalCost, totalVolume, avgCostPerTon, classCount, classAInsights, isLoading };
}
