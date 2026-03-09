import { Users, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageBannerProps {
  used: number;
  limit: number;
  onUpgradeClick: () => void;
}

const UsageBanner = ({ used, limit, onUpgradeClick }: UsageBannerProps) => {
  const percent = Math.min(Math.round((used / limit) * 100), 100);
  const isAtLimit = used >= limit;

  return (
    <Card className={`border-2 ${isAtLimit ? "border-destructive/40 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
      <CardContent className="py-5 px-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Você está gerenciando {used} de {limit} CNPJs do plano gratuito
            </span>
          </div>
          {isAtLimit && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
              Limite atingido
            </Badge>
          )}
        </div>

        <Progress value={percent} className="h-3" />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">
            {isAtLimit
              ? "Faça upgrade para continuar adicionando empresas."
              : `Ainda pode adicionar ${limit - used} empresa(s) no plano gratuito.`}
          </p>
          <Button
            size="sm"
            variant={isAtLimit ? "default" : "outline"}
            className="gap-2"
            onClick={onUpgradeClick}
          >
            {isAtLimit && <Lock className="w-3.5 h-3.5" />}
            {isAtLimit ? "Fazer Upgrade" : "Nova Empresa"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageBanner;
