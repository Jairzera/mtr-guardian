import { useState } from "react";
import { FileSpreadsheet, FileText, Download, Building2, CalendarDays, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useActiveCompany } from "@/hooks/useActiveCompany";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

const Relatorios = () => {
  const { companies } = useActiveCompany();
  const activeCompanies = companies.filter((c) => c.is_active);

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [loadingIbama, setLoadingIbama] = useState(false);
  const [loadingDmr, setLoadingDmr] = useState(false);

  const selectedName = activeCompanies.find((c) => c.id === selectedCompany)?.razao_social;

  const handleGenerateIbama = async () => {
    if (!selectedCompany) {
      toast.error("Selecione uma empresa antes de gerar o relatório.");
      return;
    }
    setLoadingIbama(true);
    await new Promise((r) => setTimeout(r, 2500));
    setLoadingIbama(false);
    toast.success("Relatório IBAMA gerado e baixado com sucesso!", {
      description: `${selectedName} — Ano base ${selectedYear}`,
    });
  };

  const handleGenerateDmr = async () => {
    if (!selectedCompany) {
      toast.error("Selecione uma empresa antes de gerar o relatório.");
      return;
    }
    setLoadingDmr(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoadingDmr(false);
    toast.success("Resumo DMR gerado e baixado com sucesso!", {
      description: `${selectedName} — Ano base ${selectedYear}`,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Exportação de Dados para Declarações Anuais
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gere relatórios consolidados para IBAMA e DMR a partir dos dados de cada cliente.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filtros do Relatório</CardTitle>
          <CardDescription>Selecione a empresa e o ano base para consolidar os dados.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Empresa
            </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {activeCompanies.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Nenhuma empresa cadastrada
                  </SelectItem>
                ) : (
                  activeCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.razao_social}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              Ano Base
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className="shadow-card border-border/60 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
          onClick={!loadingIbama ? handleGenerateIbama : undefined}
        >
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Relatório IBAMA</p>
              <p className="text-xs text-muted-foreground mt-1">
                Planilha Excel com pesos e classes de resíduos consolidados por período.
              </p>
            </div>
            <Button
              className="w-full gradient-primary shadow-primary font-semibold gap-2 h-11"
              disabled={loadingIbama || loadingDmr}
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateIbama();
              }}
            >
              {loadingIbama ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Consolidando pesos e classes...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar Relatório (.xlsx)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card
          className="shadow-card border-border/60 hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
          onClick={!loadingDmr ? handleGenerateDmr : undefined}
        >
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-base">Resumo DMR</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF formatado com resumo de destinação mensal para declaração oficial.
              </p>
            </div>
            <Button
              className="w-full gradient-primary shadow-primary font-semibold gap-2 h-11"
              disabled={loadingDmr || loadingIbama}
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateDmr();
              }}
            >
              {loadingDmr ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando resumo de destinação...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar Resumo (.pdf)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Os relatórios consolidam automaticamente os dados de <strong className="text-foreground">pesos, classes IBAMA e tipos de destinação</strong> registrados nos MTRs do período selecionado. Utilize os arquivos gerados como base para preencher o <strong className="text-foreground">Relatório Anual de Atividades Potencialmente Poluidoras (RAPP)</strong> e a <strong className="text-foreground">Declaração de Movimentação de Resíduos (DMR)</strong>.
        </p>
      </div>
    </div>
  );
};

export default Relatorios;
