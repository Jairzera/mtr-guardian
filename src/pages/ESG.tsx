import { useMemo } from "react";
import { Leaf, Download, Award, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CO2_FACTOR_KG = 0.5; // kg CO2 avoided per kg recycled waste

const ESG = () => {
  const { data: manifests = [] } = useQuery({
    queryKey: ["esg-manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("weight_kg, unit, destination_type, created_at");
      if (error) throw error;
      return data;
    },
  });

  const stats = useMemo(() => {
    let totalDivertedKg = 0;
    let thisMonthKg = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (const m of manifests) {
      if (m.destination_type?.toLowerCase() !== "aterro") {
        const wKg = m.unit === "ton" ? m.weight_kg * 1000 : m.weight_kg;
        totalDivertedKg += wKg;
        const d = new Date(m.created_at);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          thisMonthKg += wKg;
        }
      }
    }

    const totalCO2 = (totalDivertedKg * CO2_FACTOR_KG) / 1000; // toneladas
    const monthCO2 = (thisMonthKg * CO2_FACTOR_KG) / 1000;
    const treesEquiv = Math.round(totalCO2 * 45); // ~45 trees per ton CO2/year

    return {
      totalDivertedTon: (totalDivertedKg / 1000).toFixed(1),
      totalCO2: totalCO2.toFixed(1),
      monthCO2: monthCO2.toFixed(1),
      treesEquiv,
      recycleRate: manifests.length > 0
        ? Math.round((manifests.filter(m => m.destination_type?.toLowerCase() !== "aterro").length / manifests.length) * 100)
        : 0,
    };
  }, [manifests]);

  const handleGenerateSeal = () => {
    toast.success("Selo ESG gerado! Em breve você poderá baixá-lo.");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calculadora de Carbono (ESG)</h1>
        <p className="text-sm text-muted-foreground mt-1">Impacto ambiental positivo da sua operação</p>
      </div>

      {/* Hero metric */}
      <Card className="p-6 shadow-card border-border/60 gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">CO₂ Total Evitado</p>
            <p className="text-4xl md:text-5xl font-extrabold tracking-tight">{stats.totalCO2} ton</p>
            <p className="text-sm opacity-80 mt-1">Equivalente a {stats.treesEquiv} árvores plantadas</p>
          </div>
          <Leaf className="w-12 h-12 opacity-80" />
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-card border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <p className="text-sm font-medium text-muted-foreground">CO₂ Evitado (Mês)</p>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{stats.monthCO2} ton</p>
        </Card>
        <Card className="p-5 shadow-card border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10"><Leaf className="w-5 h-5 text-primary" /></div>
            <p className="text-sm font-medium text-muted-foreground">Resíduos Desviados</p>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{stats.totalDivertedTon} ton</p>
        </Card>
        <Card className="p-5 shadow-card border-border/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-primary/10"><Award className="w-5 h-5 text-primary" /></div>
            <p className="text-sm font-medium text-muted-foreground">Taxa de Reciclagem</p>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{stats.recycleRate}%</p>
          <Progress value={stats.recycleRate} className="mt-2 h-2" />
        </Card>
      </div>

      {/* ESG Seal */}
      <Card className="p-6 shadow-card border-border/60">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-24 h-24 rounded-2xl bg-accent flex items-center justify-center shrink-0">
            <Award className="w-12 h-12 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold text-foreground">Selo ESG CicloMTR</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Gere uma imagem certificada para compartilhar no LinkedIn, Instagram e relatórios de sustentabilidade.
            </p>
          </div>
          <Button onClick={handleGenerateSeal} className="gradient-primary shadow-primary font-semibold gap-2 shrink-0">
            <Download className="w-4 h-4" />
            Gerar Selo ESG
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ESG;
