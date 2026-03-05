import { useState } from "react";
import { DollarSign, TrendingUp, Layers, AlertTriangle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts";
import { useABCAnalysis, useWasteCosts } from "@/hooks/useABCAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { DashboardSkeleton } from "@/components/Skeletons";
import ExportDropdown from "@/components/ExportDropdown";

const exportColumns = [
  { header: "Classe", key: "wasteClass" },
  { header: "Volume (ton)", key: "volumeTon" },
  { header: "% Volume", key: "volumePct" },
  { header: "Custo Total", key: "totalCost" },
  { header: "% Custo", key: "costPct" },
  { header: "Classificação", key: "classification" },
];

type PeriodFilter = "month" | "quarter" | "year";

const periodLabels: Record<PeriodFilter, string> = {
  month: "Este Mês",
  quarter: "Este Trimestre",
  year: "Este Ano",
};

const classColors: Record<string, string> = {
  A: "destructive",
  B: "default",
  C: "secondary",
};

const ControleABC = () => {
  const [period, setPeriod] = useState<PeriodFilter>("quarter");
  const { rows, totalCost, totalVolume, avgCostPerTon, classCount, classAInsights, isLoading } = useABCAnalysis(period);

  if (isLoading) return <DashboardSkeleton />;

  const chartData = rows.map((r) => ({
    name: r.wasteClass.length > 15 ? r.wasteClass.slice(0, 15) + "…" : r.wasteClass,
    costPct: Number(r.costPct.toFixed(1)),
    cumulative: Number(r.cumulativePct.toFixed(1)),
  }));

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Controle Econômico ABC</h1>
          <p className="text-sm text-muted-foreground mt-1">Curva ABC fiscal-financeira dos resíduos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CostModal />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Custo Total no Período</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{fmt(totalCost)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Custo Médio / Tonelada</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{fmt(avgCostPerTon)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Classes de Resíduo</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{classCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Insight Classe A */}
      {classAInsights.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-1">Resíduos Classe A — Alto impacto financeiro</p>
                {classAInsights.map((r) => (
                  <p key={r.wasteClass} className="text-sm text-muted-foreground">
                    <strong>{r.wasteClass}</strong>: {r.volumePct.toFixed(1)}% do volume, mas {r.costPct.toFixed(1)}% do custo total.
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-card border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Curva ABC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis yAxisId="left" unit="%" className="fill-muted-foreground" />
                <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} className="fill-muted-foreground" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="costPct" name="% Custo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" dataKey="cumulative" name="% Acumulado" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Resumo por Classe</CardTitle>
          <ExportDropdown
            onExportCSV={() => {
              const exportRows = rows.map((r) => ({
                wasteClass: r.wasteClass,
                volumeTon: r.volumeTon.toFixed(2),
                volumePct: r.volumePct.toFixed(1) + "%",
                totalCost: fmt(r.totalCost),
                costPct: r.costPct.toFixed(1) + "%",
                classification: r.classification,
              }));
              exportCSV({ title: "Relatório ABC", columns: exportColumns, rows: exportRows });
            }}
            onExportPDF={() => {
              const exportRows = rows.map((r) => ({
                wasteClass: r.wasteClass,
                volumeTon: r.volumeTon.toFixed(2),
                volumePct: r.volumePct.toFixed(1) + "%",
                totalCost: fmt(r.totalCost),
                costPct: r.costPct.toFixed(1) + "%",
                classification: r.classification,
              }));
              exportPDF({ title: "Relatório ABC", columns: exportColumns, rows: exportRows });
            }}
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Classe</TableHead>
                  <TableHead className="text-right">Volume (ton)</TableHead>
                  <TableHead className="text-right">% Volume</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">% Custo</TableHead>
                  <TableHead className="text-center">ABC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.wasteClass}>
                    <TableCell className="font-medium">{r.wasteClass}</TableCell>
                    <TableCell className="text-right">{r.volumeTon.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{r.volumePct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{fmt(r.totalCost)}</TableCell>
                    <TableCell className="text-right">{r.costPct.toFixed(1)}%</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={classColors[r.classification] as any}>{r.classification}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum dado encontrado. Cadastre custos e emita MTRs para ver a análise.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------- Cost Modal ---------- */
const CostModal = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: costs = [] } = useWasteCosts();
  const [open, setOpen] = useState(false);
  const [wasteClass, setWasteClass] = useState("");
  const [costPerKg, setCostPerKg] = useState("");
  const [transportCost, setTransportCost] = useState("");
  const [ref, setRef] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!wasteClass || !user) return;
    setSaving(true);
    const { error } = await supabase.from("waste_costs" as any).insert({
      user_id: user.id,
      waste_class: wasteClass,
      cost_per_kg: Number(costPerKg) || 0,
      transport_cost: Number(transportCost) || 0,
      contract_reference: ref,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Custo cadastrado" });
      qc.invalidateQueries({ queryKey: ["waste_costs"] });
      setWasteClass("");
      setCostPerKg("");
      setTransportCost("");
      setRef("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="w-4 h-4" /> Cadastrar Custo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Custo por Classe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>Classe do Resíduo</Label>
            <Input className="mt-1" value={wasteClass} onChange={(e) => setWasteClass(e.target.value)} placeholder="Ex: Classe I - Perigoso" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Custo / kg (R$)</Label>
              <Input className="mt-1" type="number" step="0.01" value={costPerKg} onChange={(e) => setCostPerKg(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Taxa Transporte (R$)</Label>
              <Input className="mt-1" type="number" step="0.01" value={transportCost} onChange={(e) => setTransportCost(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div>
            <Label>Referência do Contrato (opcional)</Label>
            <Input className="mt-1" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ex: Contrato 2025/001" />
          </div>

          {costs.length > 0 && (
            <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">Custos cadastrados:</p>
              {costs.map((c) => (
                <p key={c.id} className="text-xs text-foreground">
                  {c.waste_class}: R$ {c.cost_per_kg}/kg + R$ {c.transport_cost} transp.
                </p>
              ))}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving || !wasteClass} className="w-full">
            {saving ? "Salvando..." : "Salvar Custo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ControleABC;
