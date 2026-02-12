import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <Card className="p-12 shadow-card border-border/60 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
      <div className="p-4 rounded-2xl bg-muted/50">
        <Icon className="w-12 h-12 text-muted-foreground/40" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 gradient-primary shadow-primary font-semibold">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
