import { Check, ArrowRight, MessageCircle, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.gif";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Standard",
    subtitle: "Para Geradores",
    price: "R$ 497",
    period: "/mês",
    focus: "PMEs e Fábricas",
    features: [
      "Gestão de MTRs",
      "App para Operadores",
      "Auditoria de Compliance",
      "Validade Jurídica",
    ],
    cta: "Começar Teste Grátis (14 dias)",
    ctaVariant: "outline" as const,
    accent: "hsl(210 50% 20%)", // azul marinho
    badge: null,
    href: "/auth",
  },
  {
    name: "Corporate",
    subtitle: "Para Destinadores",
    price: "R$ 1.997",
    period: "/mês",
    focus: "Aterros e Recicladoras",
    features: [
      "Painel de Recebimento",
      "Emissão Automática de CDF",
      "Gestão de Clientes",
      "Integração com Balança",
    ],
    cta: "Falar com Especialista",
    ctaVariant: "default" as const,
    accent: "hsl(170 35% 30%)", // verde petróleo
    badge: "Recomendado para Aterros e Recicladoras",
    href: "https://wa.me/5511999999999?text=Olá!%20Tenho%20interesse%20no%20plano%20Corporate%20do%20CicloMTR.",
  },
  {
    name: "Enterprise",
    subtitle: "Personalizado",
    price: "Sob Consulta",
    period: "",
    focus: "Grandes Volumes e Multinacionais",
    features: [
      "API Dedicada",
      "SLA de Suporte 2h",
      "Customização Total",
    ],
    cta: "Cotar Agora",
    ctaVariant: "outline" as const,
    accent: "hsl(210 10% 35%)", // cinza chumbo
    badge: null,
    href: "https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20cotar%20o%20plano%20Enterprise%20do%20CicloMTR.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const handleCta = (plan: typeof plans[0]) => {
    if (plan.href.startsWith("http")) {
      window.open(plan.href, "_blank");
    } else {
      navigate(plan.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-10 text-center">
        <Badge variant="secondary" className="mb-4 text-xs font-medium">
          Plataforma B2B para Gestão de Resíduos
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Planos para Indústrias e PMEs
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Controle total de MTRs, Compliance e Rastreabilidade com segurança jurídica.
          Sem plano grátis — porque conformidade ambiental exige seriedade.
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const isHighlight = idx === 1;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col p-6 border-2 transition-shadow hover:shadow-lg ${
                  isHighlight
                    ? "border-primary shadow-primary"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs gradient-primary text-primary-foreground border-0">
                    {plan.badge}
                  </Badge>
                )}

                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {plan.subtitle}
                  </p>
                  <h2 className="text-xl font-bold text-foreground mt-1">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{plan.focus}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.ctaVariant}
                  className={`w-full h-12 font-semibold ${
                    isHighlight ? "gradient-primary shadow-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => handleCta(plan)}
                >
                  {idx === 1 && <MessageCircle className="w-4 h-4 mr-1" />}
                  {idx === 2 && <Building2 className="w-4 h-4 mr-1" />}
                  {idx === 0 && <ArrowRight className="w-4 h-4 mr-1" />}
                  {plan.cta}
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
