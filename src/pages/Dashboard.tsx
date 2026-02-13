import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Weight, FileWarning, ShieldCheck, Plus, PackageCheck, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/dashboard/KPICard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import ReceiverChart from "@/components/dashboard/ReceiverChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useReceiverDashboard } from "@/hooks/useReceiverDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSkeleton } from "@/components/Skeletons";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useUserRole();
  const alertShown = useRef(false);

  // Generator data
  const generatorData = useDashboardData();

  // Receiver data
  const receiverData = useReceiverDashboard();

  const isLoading = role === "receiver" ? receiverData.isLoading : generatorData.isLoading;

  useEffect(() => {
    if (role !== "generator") return;
    if (alertShown.current) return;
    const alertasEnabled = localStorage.getItem("alertas_email") !== "false";
    const total = generatorData.expiringCount + generatorData.expiredCount;
    if (alertasEnabled && total > 0) {
      alertShown.current = true;
      const email = user?.email || "gestor@empresa.com";
      const parts: string[] = [];
      if (generatorData.expiredCount > 0) parts.push(`${generatorData.expiredCount} vencido(s)`);
      if (generatorData.expiringCount > 0) parts.push(`${generatorData.expiringCount} próximo(s) do vencimento`);
      toast.info(
        `📧 Alerta enviado para ${email}: ${parts.join(" e ")} — ${total} MTR(s) requerem atenção.`,
        { duration: 8000 }
      );
    }
  }, [generatorData.expiringCount, generatorData.expiredCount, user, role]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (role === "receiver") {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard de Recebimento</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral de cargas e certificados</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            title="Cargas a Receber"
            value={receiverData.pendingLoads}
            subtitle="MTRs em trânsito"
            icon={PackageCheck}
            variant="warning"
          />
          <KPICard
            title="Total Recebido (Mês)"
            value={receiverData.totalReceived}
            subtitle="Peso validado na entrada"
            icon={TrendingUp}
            variant="default"
          />
          <KPICard
            title="Certificados Emitidos"
            value={receiverData.certificatesCount}
            subtitle="CDFs gerados"
            icon={Award}
            variant="success"
          />
        </div>

        <ReceiverChart data={receiverData.chartData} />
      </div>
    );
  }

  // Generator view (existing)
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Visão geral de conformidade ambiental</p>
        </div>
        <Button
          onClick={() => navigate("/novo-manifesto")}
          className="hidden md:flex gradient-primary shadow-primary font-semibold gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Manifesto
        </Button>
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
                <TabsTrigger value="solids" className="text-xs px-2 h-6">
                  Sólidos (Ton)
                </TabsTrigger>
                <TabsTrigger value="liquids" className="text-xs px-2 h-6">
                  Líquidos (L)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <KPICard
          title="MTRs Pendentes"
          value={generatorData.pendingCount}
          subtitle="Requerem atenção"
          icon={FileWarning}
          variant="warning"
        />
        <KPICard
          title="Índice de Conformidade"
          value={generatorData.complianceRate}
          subtitle="Meta: 98%"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      <WeeklyChart data={generatorData.weeklyData} unitLabel={generatorData.unitLabel} />
    </div>
  );
};

export default Dashboard;
