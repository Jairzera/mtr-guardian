import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { startOfWeek, differenceInWeeks, subWeeks, differenceInDays } from "date-fns";

type UnitFilter = "solids" | "liquids";

interface Manifest {
  weight_kg: number;
  unit: string;
  status: string;
  created_at: string;
  expiration_date: string | null;
}

export function useDashboardData() {
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("solids");

  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["dashboard-manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("weight_kg, unit, status, created_at, expiration_date");
      if (error) throw error;
      return data as Manifest[];
    },
  });

  const stats = useMemo(() => {
    const isSolid = (u: string | null) => !u || u === "kg" || u === "ton";
    const isLiquid = (u: string | null) => u === "L";

    const filtered = manifests.filter((m) =>
      unitFilter === "solids" ? isSolid(m.unit) : isLiquid(m.unit)
    );

    // Total processed
    let totalProcessed = 0;
    for (const m of filtered) {
      if (unitFilter === "solids") {
        totalProcessed += m.unit === "ton" ? m.weight_kg : m.weight_kg / 1000;
      } else {
        totalProcessed += m.weight_kg;
      }
    }

    // Pending count
    const pendingCount = manifests.filter((m) => m.status === "pendente").length;

    // Compliance
    const total = manifests.length;
    const conformeCount = manifests.filter((m) => m.status === "conformidade").length;
    const complianceRate = total > 0 ? Math.round((conformeCount / total) * 100) : 0;

    // Weekly chart data (last 6 weeks)
    const now = new Date();
    const sixWeeksAgo = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 5);
    const weeks: { label: string; volume: number }[] = [];

    for (let i = 0; i < 6; i++) {
      weeks.push({ label: `Sem ${i + 1}`, volume: 0 });
    }

    for (const m of filtered) {
      const date = new Date(m.created_at);
      const weekIndex = differenceInWeeks(
        startOfWeek(date, { weekStartsOn: 1 }),
        sixWeeksAgo
      );
      if (weekIndex >= 0 && weekIndex < 6) {
        if (unitFilter === "solids") {
          weeks[weekIndex].volume += m.unit === "ton" ? m.weight_kg : m.weight_kg / 1000;
        } else {
          weeks[weekIndex].volume += m.weight_kg;
        }
      }
    }

    // Round volumes
    for (const w of weeks) {
      w.volume = Math.round(w.volume * 100) / 100;
    }

    const unitLabel = unitFilter === "solids" ? "Ton" : "L";
    const totalFormatted = totalProcessed.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    // Expiration alerts
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expiringCount = 0;
    let expiredCount = 0;
    for (const m of manifests) {
      if (!m.expiration_date) continue;
      const exp = new Date(m.expiration_date);
      if (exp < today) {
        expiredCount++;
      } else if (differenceInDays(exp, today) <= 3) {
        expiringCount++;
      }
    }

    return {
      totalProcessed: `${totalFormatted} ${unitLabel}`,
      pendingCount: String(pendingCount),
      complianceRate: `${complianceRate}%`,
      weeklyData: weeks.map((w) => ({ semana: w.label, volume: w.volume })),
      unitLabel,
      expiringCount,
      expiredCount,
    };
  }, [manifests, unitFilter]);

  return {
    ...stats,
    unitFilter,
    setUnitFilter,
    isLoading,
  };
}
