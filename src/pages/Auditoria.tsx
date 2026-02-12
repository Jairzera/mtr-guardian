import { useState, useMemo } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Anomaly {
  id: string;
  type: "weight" | "destination" | "expired";
  severity: "high" | "medium" | "low";
  message: string;
}

const Auditoria = () => {
  const [selectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: manifests = [] } = useQuery({
    queryKey: ["audit-manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("id, weight_kg, waste_class, destination_type, status, expiration_date, created_at");
      if (error) throw error;
      return data;
    },
  });

  const { score, anomalies } = useMemo(() => {
    if (manifests.length === 0) return { score: 100, anomalies: [] as Anomaly[] };

    const found: Anomaly[] = [];
    const weights = manifests.map((m) => m.weight_kg);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const m of manifests) {
      if (m.weight_kg > avgWeight * 1.5) {
        found.push({
          id: m.id,
          type: "weight",
          severity: "medium",
          message: `MTR com peso ${m.weight_kg}kg — 50% acima da média histórica (${Math.round(avgWeight)}kg).`,
        });
      }
      if (
        m.waste_class?.toLowerCase().includes("perigoso") &&
        m.destination_type?.toLowerCase() === "aterro"
      ) {
        found.push({
          id: m.id,
          type: "destination",
          severity: "high",
          message: `Resíduo Perigoso (${m.waste_class}) enviado para Aterro comum — possível infração ambiental.`,
        });
      }
      if (m.expiration_date) {
        const exp = new Date(m.expiration_date);
        if (exp < today) {
          found.push({
            id: m.id,
            type: "expired",
            severity: "high",
            message: `MTR com licença ambiental vencida desde ${exp.toLocaleDateString("pt-BR")}.`,
          });
        }
      }
    }

    const deduction = found.reduce((acc, a) => acc + (a.severity === "high" ? 15 : a.severity === "medium" ? 8 : 3), 0);
    return { score: Math.max(0, 100 - deduction), anomalies: found };
  }, [manifests]);

  const scoreColor =
    score >= 80 ? "text-primary" : score >= 50 ? "text-warning" : "text-destructive";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Auditoria IA & Compliance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pré-auditoria automatizada — {selectedMonth}
        </p>
      </div>

      {/* Score Card */}
      <Card className="p-6 shadow-card border-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Saúde do Compliance</p>
            <p className={`text-5xl font-extrabold tracking-tight ${scoreColor}`}>{score}</p>
            <p className="text-xs text-muted-foreground mt-1">de 100 pontos</p>
          </div>
          <div className={`p-4 rounded-2xl ${score >= 80 ? "bg-primary/10" : score >= 50 ? "bg-warning/10" : "bg-destructive/10"}`}>
            {score >= 80 ? (
              <CheckCircle2 className={`w-8 h-8 ${scoreColor}`} />
            ) : (
              <ShieldAlert className={`w-8 h-8 ${scoreColor} ${score < 50 ? "animate-pulse" : ""}`} />
            )}
          </div>
        </div>
        <Progress value={score} className="h-3" />
        {score < 80 && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 animate-pulse" />
            <p className="text-sm font-medium text-destructive">
              Risco de Inconsistência no RAPP/IBAMA detectado — revise os itens abaixo.
            </p>
          </div>
        )}
      </Card>

      {/* Anomalies */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          Anomalias Detectadas ({anomalies.length})
        </h2>
        {anomalies.length === 0 ? (
          <Card className="p-6 shadow-card border-border/60 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma anomalia encontrada. Parabéns!</p>
          </Card>
        ) : (
          anomalies.map((a, i) => (
            <Card key={i} className="p-4 shadow-card border-border/60 flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${a.severity === "high" ? "bg-destructive/10" : "bg-warning/10"}`}>
                <AlertTriangle className={`w-4 h-4 ${a.severity === "high" ? "text-destructive" : "text-warning"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{a.message}</p>
                <Badge variant={a.severity === "high" ? "destructive" : "secondary"} className="mt-2">
                  {a.severity === "high" ? "Crítico" : "Atenção"}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button className="gradient-primary shadow-primary font-semibold">
          Exportar Relatório de Compliance
        </Button>
      </div>
    </div>
  );
};

export default Auditoria;
