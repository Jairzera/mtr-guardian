import { useMemo, useState } from "react";
import { Leaf, Download, Award, TrendingUp, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAchievements } from "@/hooks/useAchievements";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { generateESGSeal, downloadBlob } from "@/lib/esgSealGenerator";

const CO2_FACTOR_KG = 0.5;

const SEAL_LEVELS = [
  { minLevel: 1, name: "Bronze Eco", icon: "🥉", label: "1 Tonelada" },
  { minLevel: 2, name: "Silver Cycle", icon: "🥈", label: "10 Toneladas" },
  { minLevel: 3, name: "Gold Impact", icon: "🥇", label: "100 Toneladas" },
  { minLevel: 4, name: "Green Black", icon: "♻️", label: "1.000 Toneladas" },
];

const ESG = () => {
  const [generating, setGenerating] = useState(false);
  const { currentLevel, milestones } = useAchievements();
  const { settings } = useCompanySettings();

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

    const totalCO2 = (totalDivertedKg * CO2_FACTOR_KG) / 1000;
    const monthCO2 = (thisMonthKg * CO2_FACTOR_KG) / 1000;
    const treesEquiv = Math.round(totalCO2 * 45);

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

  // Determine which seals are unlocked based on achievement level
  const availableSeals = SEAL_LEVELS.map((seal) => ({
    ...seal,
    unlocked: currentLevel >= seal.minLevel,
  }));

  const handleDownloadSeal = async (seal: typeof SEAL_LEVELS[0]) => {
    setGenerating(true);
    try {
      const blob = await generateESGSeal({
        levelName: seal.name,
        levelLabel: seal.label,
        icon: seal.icon,
        gradient: ["#059669", "#34d399"],
        co2Avoided: stats.totalCO2,
        treesEquiv: stats.treesEquiv,
        recycleRate: stats.recycleRate,
        companyName: settings?.razaoSocial || "Minha Empresa",
      });
      downloadBlob(blob, `selo-esg-${seal.name.toLowerCase().replace(/\s/g, "-")}.png`);
      toast.success(`Selo ${seal.name} baixado com sucesso!`);
    } catch {
      toast.error("Erro ao gerar o selo. Tente novamente.");
    } finally {
      setGenerating(false);
    }
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

      {/* ESG Seals by Level */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Selos ESG por Nível</h2>
        <p className="text-sm text-muted-foreground">Desbloqueie selos atingindo os marcos de conquistas. Baixe e compartilhe no LinkedIn, Instagram e relatórios.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableSeals.map((seal) => (
            <Card
              key={seal.name}
              className={`p-5 shadow-card border-border/60 flex flex-col items-center text-center gap-3 transition-all ${
                seal.unlocked ? "opacity-100" : "opacity-50 grayscale"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-3xl">
                {seal.unlocked ? seal.icon : <Lock className="w-7 h-7 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{seal.name}</h3>
                <p className="text-xs text-muted-foreground">{seal.label}</p>
              </div>
              <Button
                size="sm"
                disabled={!seal.unlocked || generating}
                onClick={() => handleDownloadSeal(seal)}
                className="gap-2 w-full"
                variant={seal.unlocked ? "default" : "secondary"}
              >
                {seal.unlocked ? (
                  <>
                    <Download className="w-4 h-4" />
                    {generating ? "Gerando..." : "Baixar Selo"}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Bloqueado
                  </>
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ESG;
