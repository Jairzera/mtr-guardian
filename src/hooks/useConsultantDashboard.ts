import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useManagedCompanies } from "./useManagedCompanies";

export interface ConsultantAlert {
  id: string;
  companyName: string;
  companyCnpj: string;
  companyId: string;
  type: "license_expiring" | "license_expired" | "pending_mtrs" | "no_activity";
  message: string;
  severity: "critical" | "warning" | "info";
}

export function useConsultantDashboard() {
  const { user } = useAuth();
  const { companies, isLoading: companiesLoading } = useManagedCompanies();

  const { data: manifests = [], isLoading: manifestsLoading } = useQuery({
    queryKey: ["consultant-all-manifests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("id, status, created_at, expiration_date, waste_class, weight_kg, unit, destination_company_name")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const stats = useMemo(() => {
    const activeCompanies = companies.filter((c) => c.is_active);
    const totalClients = activeCompanies.length;

    // MTRs emitidos no mês atual
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const mtrsThisMonth = manifests.filter(
      (m) => new Date(m.created_at) >= monthStart
    ).length;

    // Alerts
    const alerts: ConsultantAlert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each company for issues
    for (const company of activeCompanies) {
      // Check for last activity (no activity in 30+ days)
      if (company.last_activity_at) {
        const lastActivity = new Date(company.last_activity_at);
        const daysSince = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince > 30) {
          alerts.push({
            id: `no-activity-${company.id}`,
            companyName: company.razao_social,
            companyCnpj: company.cnpj,
            companyId: company.id,
            type: "no_activity",
            message: `Sem atividade há ${daysSince} dias`,
            severity: "warning",
          });
        }
      } else {
        alerts.push({
          id: `no-activity-${company.id}`,
          companyName: company.razao_social,
          companyCnpj: company.cnpj,
          companyId: company.id,
          type: "no_activity",
          message: "Nenhuma atividade registrada",
          severity: "info",
        });
      }
    }

    // Check manifests for expiration and pending issues
    const pendingByCompany: Record<string, number> = {};
    const expiringManifests: { manifest: typeof manifests[0]; daysLeft: number }[] = [];

    for (const m of manifests) {
      // Count pending MTRs
      if (m.status === "pendente" || m.status === "issued") {
        const companyName = m.destination_company_name || "Sem empresa";
        pendingByCompany[companyName] = (pendingByCompany[companyName] || 0) + 1;
      }

      // Check expiration
      if (m.expiration_date) {
        const expDate = new Date(m.expiration_date);
        expDate.setHours(0, 0, 0, 0);
        const daysLeft = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
          alerts.push({
            id: `expired-${m.id}`,
            companyName: m.destination_company_name || "—",
            companyCnpj: "",
            companyId: "",
            type: "license_expired",
            message: `Licença vencida há ${Math.abs(daysLeft)} dia(s)`,
            severity: "critical",
          });
        } else if (daysLeft <= 15) {
          alerts.push({
            id: `expiring-${m.id}`,
            companyName: m.destination_company_name || "—",
            companyCnpj: "",
            companyId: "",
            type: "license_expiring",
            message: `Licença vence em ${daysLeft} dia(s)`,
            severity: daysLeft <= 3 ? "critical" : "warning",
          });
        }
      }
    }

    // Generate pending MTR alerts per company grouping
    for (const [companyName, count] of Object.entries(pendingByCompany)) {
      if (count >= 2) {
        alerts.push({
          id: `pending-${companyName}`,
          companyName,
          companyCnpj: "",
          companyId: "",
          type: "pending_mtrs",
          message: `${count} MTRs pendentes sem movimentação`,
          severity: count >= 5 ? "critical" : "warning",
        });
      }
    }

    // Sort: critical first, then warning, then info
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const criticalCount = alerts.filter((a) => a.severity === "critical").length;

    return {
      totalClients: String(totalClients),
      mtrsThisMonth: String(mtrsThisMonth),
      criticalAlerts: String(criticalCount),
      alerts,
    };
  }, [companies, manifests]);

  return {
    ...stats,
    isLoading: companiesLoading || manifestsLoading,
  };
}
