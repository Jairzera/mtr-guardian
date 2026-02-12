import { useNavigate } from "react-router-dom";
import { Weight, FileWarning, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/dashboard/KPICard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    totalProcessed,
    pendingCount,
    complianceRate,
    weeklyData,
    unitLabel,
    unitFilter,
    setUnitFilter,
  } = useDashboardData();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
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
          value={totalProcessed}
          subtitle="+12% vs mês anterior"
          icon={Weight}
          variant="default"
          extra={
            <Tabs
              value={unitFilter}
              onValueChange={(v) => setUnitFilter(v as "solids" | "liquids")}
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
          value={pendingCount}
          subtitle="Requerem atenção"
          icon={FileWarning}
          variant="warning"
        />
        <KPICard
          title="Índice de Conformidade"
          value={complianceRate}
          subtitle="Meta: 98%"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      <WeeklyChart data={weeklyData} unitLabel={unitLabel} />
    </div>
  );
};

export default Dashboard;
