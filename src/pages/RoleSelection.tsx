import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Users, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RoleOption = "consultant" | "generator";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState<RoleOption | null>(null);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!selected || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.rpc("assign_user_role", {
        _user_id: user.id,
        _role: selected,
      });

      if (error) throw error;

      toast.success(
        selected === "consultant"
          ? "Perfil de Consultor configurado!"
          : "Perfil de Indústria configurado!"
      );
      navigate("/sucesso");
    } catch (err) {
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const options = [
    {
      value: "consultant" as RoleOption,
      icon: Users,
      title: "Sou Consultor",
      description:
        "Gerencio resíduos de múltiplas empresas/clientes. Preciso de gestão centralizada, relatórios por CNPJ e acesso multi-empresa.",
      features: [
        "Gestão de múltiplos CNPJs",
        "Relatórios por cliente",
        "Torre de Controle",
        "Acesso View-Only para clientes",
      ],
    },
    {
      value: "generator" as RoleOption,
      icon: Factory,
      title: "Sou Indústria",
      description:
        "Minha empresa gera resíduos e preciso emitir MTRs, rastrear cargas e manter a conformidade ambiental.",
      features: [
        "Emissão rápida de MTRs",
        "Rastreio de cargas",
        "Cofre de documentos",
        "Compliance IBAMA",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Como você vai usar o CicloMTR?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Selecione seu perfil para personalizar sua experiência. Isso define quais funcionalidades estarão disponíveis no seu painel.
          </p>
        </div>

        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selected === opt.value;
            return (
              <Card
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`relative p-6 cursor-pointer transition-all border-2 hover:shadow-lg ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {isSelected && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground border-0 text-[10px] font-bold">
                    SELECIONADO
                  </Badge>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? "bg-primary/15" : "bg-muted"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{opt.title}</h2>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opt.description}
                  </p>

                  <ul className="space-y-2">
                    {opt.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-primary" : "bg-muted-foreground/40"
                          }`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          size="lg"
          className="w-full text-base font-semibold gap-2 h-14"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando perfil...
            </>
          ) : (
            <>
              Continuar para Integração
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;
