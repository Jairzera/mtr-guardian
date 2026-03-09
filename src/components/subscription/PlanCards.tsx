import { Zap, Crown, CheckCircle2, ArrowUpRight, Sparkles, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Growth",
    price: "49,90",
    limit: "Até 30 CNPJs",
    icon: Zap,
    popular: false,
    features: [
      "Gestão de até 30 empresas",
      "Dashboard Torre de Controle",
      "Alertas automáticos",
      "Relatórios oficiais",
    ],
  },
  {
    name: "Max",
    price: "89,90",
    limit: "CNPJs Ilimitados",
    icon: Crown,
    popular: true,
    features: [
      "Tudo do Growth",
      "Empresas ilimitadas",
      "Suporte prioritário",
      "API dedicada",
      "White-label reports",
    ],
  },
];

const PlanCards = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Destrave limites e transforme seus clientes em receita recorrente
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Escolha o plano ideal para escalar a sua consultoria.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    <CardDescription className="text-xs">{plan.limit}</CardDescription>
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

                <Button className="w-full gap-2" variant={plan.popular ? "default" : "outline"}>
                  <ArrowUpRight className="w-4 h-4" />
                  Subscrever {plan.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ROI Simulator - 30% commission highlight */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="py-5 px-6 flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-primary/10 shrink-0 mt-0.5">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-bold text-foreground">
              🔥 Ganhe 30% de comissão recorrente!
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ao indicar apenas <strong className="text-foreground">2 clientes</strong> para o plano
              básico do CicloMTR, suas comissões (
              <strong className="text-success">R$ 118,74/mês</strong>) já pagam a sua assinatura Max
              e você ainda sai no lucro.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Quanto mais clientes indicar, maior o seu rendimento passivo mensal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanCards;
