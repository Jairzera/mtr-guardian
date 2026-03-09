import { useNavigate } from "react-router-dom";
import { Building2, FileText, AlertTriangle, ArrowRight, Shield, Clock, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import KPICard from "@/components/dashboard/KPICard";
import { useConsultantDashboard, ConsultantAlert } from "@/hooks/useConsultantDashboard";
import { DashboardSkeleton } from "@/components/Skeletons";
import CompanySwitcher from "@/components/layout/CompanySwitcher";

const severityConfig = {
  critical: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
    row: "border-l-destructive",
  },
  warning: {
    badge: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
    row: "border-l-warning",
  },
  info: {
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    row: "border-l-muted-foreground/30",
  },
};

const typeIcons = {
  license_expiring: Clock,
  license_expired: AlertTriangle,
  pending_mtrs: FileText,
  no_activity: Activity,
};

const typeLabels = {
  license_expiring: "Licença Vencendo",
  license_expired: "Licença Vencida",
  pending_mtrs: "MTRs Pendentes",
  no_activity: "Sem Atividade",
};

const AlertRow = ({ alert }: { alert: ConsultantAlert }) => {
  const navigate = useNavigate();
  const config = severityConfig[alert.severity];
  const Icon = typeIcons[alert.type];

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border border-l-4 ${config.row} bg-card transition-all hover:shadow-md`}
    >
      <div className={`p-2 rounded-lg ${alert.severity === "critical" ? "bg-destructive/10" : alert.severity === "warning" ? "bg-warning/10" : "bg-muted"}`}>
        <Icon className={`w-4 h-4 ${alert.severity === "critical" ? "text-destructive" : alert.severity === "warning" ? "text-warning" : "text-muted-foreground"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">
            {alert.companyName}
          </p>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${config.badge}`}>
            {typeLabels[alert.type]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
        onClick={() => navigate("/mtrs")}
      >
        Resolver
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

const ConsultantDashboard = () => {
  const { totalClients, mtrsThisMonth, criticalAlerts, alerts, isLoading } = useConsultantDashboard();

  if (isLoading) return <DashboardSkeleton />;

  const criticalAlertsList = alerts.filter((a) => a.severity === "critical");
  const warningAlertsList = alerts.filter((a) => a.severity === "warning");
  const infoAlertsList = alerts.filter((a) => a.severity === "info");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Torre de Controle</h1>
            <p className="text-sm text-muted-foreground">Panorama de todos os seus clientes em tempo real</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Clientes Ativos"
          value={totalClients}
          subtitle="Empresas sob gestão"
          icon={Building2}
          variant="default"
        />
        <KPICard
          title="MTRs no Mês"
          value={mtrsThisMonth}
          subtitle="Emitidos este mês"
          icon={FileText}
          variant="success"
        />
        <KPICard
          title="Alertas Críticos"
          value={criticalAlerts}
          subtitle="Requerem ação imediata"
          icon={AlertTriangle}
          variant={parseInt(criticalAlerts) > 0 ? "risk" : "default"}
        />
      </div>

      {/* Action Center */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Central de Alertas</h2>
            <p className="text-xs text-muted-foreground">
              {alerts.length === 0
                ? "Nenhum alerta pendente — tudo sob controle."
                : `${alerts.length} alerta(s) requerem sua atenção`}
            </p>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              {parseInt(criticalAlerts) > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                  {criticalAlerts} crítico(s)
                </Badge>
              )}
              {warningAlertsList.length > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                  {warningAlertsList.length} atenção
                </Badge>
              )}
            </div>
          )}
        </div>

        {alerts.length === 0 ? (
          <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-full bg-accent mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Tudo sob controle</p>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhum alerta encontrado. Continue monitorando.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {criticalAlertsList.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {warningAlertsList.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
            {infoAlertsList.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantDashboard;
