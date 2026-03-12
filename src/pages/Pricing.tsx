import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";
import { useNavigate } from "react-router-dom";

type Period = "mensal" | "semestral" | "anual";

const plans = [
  {
    name: "Essencial",
    price: { mensal: "R$ 99,00", semestral: "R$ 534,60", anual: "R$ 950,40" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    subtitle: "Pequenas empresas",
    features: ["Até 5 MTRs por mês", "1 empresa incluída", "Painel Web completo", "Suporte por e-mail"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=51PFUS6",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=N05IA0D",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=BRV2N1F",
    },
    highlight: false,
    badge: null,
  },
  {
    name: "Pro",
    price: { mensal: "R$ 129,90", semestral: "R$ 701,46", anual: "R$ 1.247,04" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    subtitle: "Empresas que fazem a própria gestão",
    features: ["MTRs ilimitados", "1 empresa incluída", "Auditoria de Compliance", "Rastreio em tempo real"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=ERDQ60M",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=AB0O0N5",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=AB0O0N5",
    },
    highlight: true,
    badge: "Mais Popular",
  },
  {
    name: "Consultoria/Industria",
    price: { mensal: "R$ 797,90", semestral: "R$ 4.308,66", anual: "R$ 7.659,84" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    subtitle: "Consultorias e transportadoras",
    features: ["MTRs ilimitados", "Até 10 empresas incluídas", "+R$ 397/cada 10 empresas adicionais", "Gestão multiempresa", "Suporte prioritário"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=QZMTVR0",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WKEZ3Y5",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WI87DD5",
    },
    highlight: false,
    badge: null,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, Period>>({});

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="CicloMTR" className="w-8 h-8" />
            <span className="font-bold text-lg text-foreground">CicloMTR</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-10 text-center">
        <Badge variant="secondary" className="mb-4 text-xs font-medium">
          Plataforma B2B para Gestão de Resíduos
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Escolha o plano ideal para sua operação
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Controle total de MTRs, Compliance e Rastreabilidade com segurança jurídica.
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const period = selectedPeriods[plan.name] || "mensal";
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col p-6 border-2 transition-shadow hover:shadow-lg ${
                  plan.highlight ? "border-primary shadow-primary" : "border-border"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs gradient-primary text-primary-foreground border-0">
                    {plan.badge}
                  </Badge>
                )}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price[period]}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.periodLabel[period]}</span>
                </div>
                <div className="mb-6">
                  <Select
                    value={period}
                    onValueChange={(v) =>
                      setSelectedPeriods((prev) => ({ ...prev, [plan.name]: v as Period }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full h-12 font-semibold ${
                    plan.highlight ? "gradient-primary shadow-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => window.open(plan.links[period], "_blank")}
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Assinar Agora
                </Button>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Expansion note */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <Card className="p-8 border-2 border-primary/20">
          <div className="text-center">
            <Badge className="mb-3 gradient-primary text-primary-foreground border-0">Expansão sob demanda</Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2">Precisa de mais empresas?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              No plano Consultoria, adicione pacotes de <strong className="text-foreground">+10 empresas</strong> por apenas <strong className="text-foreground">R$ 397,00/mês</strong>. Escale sua operação conforme a receita cresce.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Pricing;
