import { useNavigate } from "react-router-dom";
import { Weight, FileWarning, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/dashboard/KPICard";
import WeeklyChart from "@/components/dashboard/WeeklyChart";

const Dashboard = () => {
  const navigate = useNavigate();

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
          value="105,5 Ton"
          subtitle="+12% vs mês anterior"
          icon={Weight}
          variant="default"
        />
        <KPICard
          title="MTRs Pendentes"
          value="7"
          subtitle="Requerem atenção"
          icon={FileWarning}
          variant="warning"
        />
        <KPICard
          title="Índice de Conformidade"
          value="94%"
          subtitle="Meta: 98%"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      <WeeklyChart />
    </div>
  );
};

export default Dashboard;
