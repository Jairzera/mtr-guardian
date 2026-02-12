import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "risk";
  extra?: ReactNode;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-accent text-accent-foreground",
  warning: "bg-warning/10 text-warning",
  risk: "bg-risk/10 text-risk",
};

const KPICard = ({ title, value, subtitle, icon: Icon, variant = "default", extra }: KPICardProps) => {
  return (
    <Card className="p-5 shadow-card border-border/60 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {extra}
        </div>
        <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export default KPICard;
