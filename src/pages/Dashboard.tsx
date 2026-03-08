import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Weight, FileWarning, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/dashboard/KPICard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/Skeletons";
import AchievementsSection from "@/components/dashboard/AchievementsSection";
import { useUserRole } from "@/hooks/useUserRole";
import ConsultantDashboard from "./ConsultantDashboard";

const Dashboard = () => {
  const { role } = useUserRole();

  if (role === "consultant") {
    return <ConsultantDashboard />;
  }

  // client_viewer and generator both use GeneratorDashboard
  return <GeneratorDashboard />;
};

const GeneratorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const alertShown = useRef(false);
  const generatorData = useDashboardData();

  useEffect(() => {
    if (alertShown.current) return;
    const alertasEnabled = localStorage.getItem("alertas_email") !== "false";
    const pendingNum = parseInt(generatorData.pendingCount) || 0;
    const total = generatorData.expiringCount + generatorData.expiredCount + pendingNum;
    if (alertasEnabled && total > 0) {
      alertShown.current = true;
      const email = user?.email || "gestor@empresa.com";
      const parts: string[] = [];
      if (generatorData.expiredCount > 0) parts.push(`${generatorData.expiredCount} vencido(s)`);
      if (generatorData.expiringCount > 0) parts.push(`${generatorData.expiringCount} próximo(s) do vencimento`);
      if (pendingNum > 0) parts.push(`${pendingNum} pendente(s)`);
      toast.info(
        `📧 Alerta enviado para ${email}: ${parts.join(" e ")} — ${total} MTR(s) requerem atenção.`,
        { duration: 8000 }
      );
    }
  }, [generatorData.expiringCount, generatorData.expiredCount, generatorData.pendingCount, user]);

  if (generatorData.isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral de conformidade ambiental</p>
        </div>
        {role !== "client_viewer" && (
          <Button
            onClick={() => navigate("/novo-manifesto")}
            className="hidden md:flex gradient-primary shadow-primary font-semibold gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Manifesto
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Processado"
          value={generatorData.totalProcessed}
          subtitle="+12% vs mês anterior"
          icon={Weight}
          variant="default"
          extra={
            <Tabs
              value={generatorData.unitFilter}
              onValueChange={(v) => generatorData.setUnitFilter(v as "solids" | "liquids")}
              className="mt-2"
            >
              <TabsList className="h-7 p-0.5">
                <TabsTrigger value="solids" className="text-xs px-2 h-6">Sólidos (Ton)</TabsTrigger>
                <TabsTrigger value="liquids" className="text-xs px-2 h-6">Líquidos (L)</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <KPICard title="MTRs Pendentes" value={generatorData.pendingCount} subtitle="Requerem atenção" icon={FileWarning} variant="warning" />
        <KPICard title="Índice de Conformidade" value={generatorData.complianceRate} subtitle="Meta: 98%" icon={ShieldCheck} variant="success" />
      </div>

      <WeeklyChart data={generatorData.weeklyData} unitLabel={generatorData.unitLabel} />
      <AchievementsSection />
    </div>
  );
};

export default Dashboard;
