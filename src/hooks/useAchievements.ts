import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export interface Milestone {
  id: number;
  name: string;
  label: string;
  thresholdKg: number;
  unlocked: boolean;
  gradient: string;
  glowColor: string;
  icon: string;
}

const MILESTONES_DEF = [
  { id: 1, name: "Starter", label: "Cadastro Realizado", thresholdKg: 0, gradient: "from-zinc-400 to-zinc-600", glowColor: "rgba(161,161,170,0.4)", icon: "🪪" },
  { id: 2, name: "Bronze Eco", label: "1 Tonelada", thresholdKg: 1000, gradient: "from-amber-700 to-yellow-900", glowColor: "rgba(180,83,9,0.5)", icon: "🥉" },
  { id: 3, name: "Silver Cycle", label: "10 Toneladas", thresholdKg: 10000, gradient: "from-slate-300 to-slate-500", glowColor: "rgba(203,213,225,0.5)", icon: "🥈" },
  { id: 4, name: "Gold Impact", label: "100 Toneladas", thresholdKg: 100000, gradient: "from-yellow-400 to-amber-500", glowColor: "rgba(250,204,21,0.5)", icon: "🥇" },
  { id: 5, name: "Green Black", label: "1.000 Toneladas", thresholdKg: 1000000, gradient: "from-emerald-400 to-green-500", glowColor: "rgba(52,211,153,0.5)", icon: "♻️" },
];

export function useAchievements() {
  const { data: totalKg = 0, isLoading } = useQuery({
    queryKey: ["achievements-total-weight"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("weight_kg, unit")
        .in("status", ["conformidade", "received", "completed"]);
      if (error) throw error;
      let total = 0;
      for (const m of data || []) {
        total += m.unit === "ton" ? m.weight_kg * 1000 : m.weight_kg;
      }
      return total;
    },
  });

  const milestones: Milestone[] = useMemo(() => {
    return MILESTONES_DEF.map((def) => ({
      ...def,
      unlocked: totalKg >= def.thresholdKg,
    }));
  }, [totalKg]);

  const currentLevel = useMemo(() => {
    for (let i = MILESTONES_DEF.length - 1; i >= 0; i--) {
      if (totalKg >= MILESTONES_DEF[i].thresholdKg) return i;
    }
    return 0;
  }, [totalKg]);

  const nextMilestone = MILESTONES_DEF[currentLevel + 1] || null;

  const progressPercent = useMemo(() => {
    if (!nextMilestone) return 100;
    const currentThreshold = MILESTONES_DEF[currentLevel].thresholdKg;
    const range = nextMilestone.thresholdKg - currentThreshold;
    if (range <= 0) return 100;
    return Math.min(100, Math.round(((totalKg - currentThreshold) / range) * 100));
  }, [totalKg, currentLevel, nextMilestone]);

  const remainingKg = nextMilestone ? Math.max(0, nextMilestone.thresholdKg - totalKg) : 0;

  const formatWeight = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ton`;
    return `${kg.toLocaleString("pt-BR")} kg`;
  };

  return {
    milestones,
    totalKg,
    currentLevel,
    nextMilestone,
    progressPercent,
    remainingKg,
    formatWeight,
    isLoading,
  };
}
