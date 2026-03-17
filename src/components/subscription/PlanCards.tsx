import { Zap, Crown, CheckCircle2, ArrowUpRight, Sparkles, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Consultoria/Industria",
    price: "797,90",
    subtitle: "Consultorias e transportadoras",
    icon: Building2,
    popular: true,
    link: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=QZMTVR0",
    features: [
      "MTRs ilimitados",
      "Até 10 empresas incluídas",
      "+R$ 397/cada 10 adicionais",
      "Gestão multiempresa",
      "Suporte prioritário",
    ],
  },
];

const PlanCards = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Escolha o plano ideal para sua operação
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Escale conforme sua necessidade — de pequenas empresas a consultorias.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-shadow hover:shadow-lg ${
                plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute top-0 right-0 rounded-bl-lg rounded-tr-none border-0 gradient-primary text-primary-foreground text-[10px] font-bold px-3 py-1">
                  MAIS POPULAR
                </Badge>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">R$ {plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ mês</span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full gap-2" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => window.open(plan.link, "_blank")}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Assinar {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlanCards;
