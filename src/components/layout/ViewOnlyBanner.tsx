import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ViewOnlyBannerProps {
  consultancyName?: string;
}

const ViewOnlyBanner = ({ consultancyName = "Sua Consultoria" }: ViewOnlyBannerProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted border-b border-border">
      <Badge variant="secondary" className="gap-1.5 text-xs font-medium">
        <Eye className="w-3 h-3" />
        Modo Leitura
      </Badge>
      <span className="text-xs text-muted-foreground">
        Gerenciado por <strong className="text-foreground">{consultancyName}</strong>
      </span>
    </div>
  );
};

export default ViewOnlyBanner;
