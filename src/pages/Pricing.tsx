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
    name: "Inicial",
    price: { mensal: "R$ 197,90", semestral: "R$ 1.187,90", anual: "R$ 2.374,80" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    features: ["Gestão de MTRs", "Painel Web completo", "Auditoria de Compliance", "Suporte por e-mail"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=69RHPA1",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=5XJI0DQ",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=KB2DO1Q",
    },
    highlight: false,
    badge: null,
  },
  {
    name: "Crescimento",
    price: { mensal: "R$ 237,90", semestral: "R$ 1.427,40", anual: "R$ 2.854,80" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    features: ["Tudo do Inicial +", "App para Operadores", "Validade Jurídica completa", "Rastreio em tempo real"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=HN1H9A1",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=UYJIT1M",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=0D7EFOI",
    },
    highlight: false,
    badge: null,
  },
  {
    name: "Avançado",
    price: { mensal: "R$ 797,90", semestral: "R$ 4.787,40", anual: "R$ 9.574,80" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    features: ["Tudo do Crescimento +", "Emissão Automática de CDF", "Gestão de Clientes", "Multi-usuários", "Suporte prioritário"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=QZMTVR0",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WKEZ3Y5",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WI87DD5",
    },
    highlight: true,
    badge: "Mais Popular",
  },
  {
    name: "Ilimitado",
    price: { mensal: "R$ 837,90", semestral: "R$ 5.027,40", anual: "R$ 10.054,80" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    features: ["Tudo do Avançado +", "API dedicada", "Integração com Balança", "SLA de suporte 2h", "Customização"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=90SZL93",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=2V20XDP",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=98ZG7MD",
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default Pricing;
