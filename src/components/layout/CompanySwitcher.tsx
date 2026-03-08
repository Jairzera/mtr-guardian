import { Building2, ChevronDown, Check } from "lucide-react";
import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useUserRole } from "@/hooks/useUserRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CompanySwitcher = () => {
  const { role } = useUserRole();
  const { activeCompany, setActiveCompany, companies, isLoading } = useActiveCompany();

  if (role !== "consultant") return null;

  if (isLoading) {
    return (
      <div className="px-4 py-2">
        <Skeleton className="h-9 w-48" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Nenhuma empresa cadastrada
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 max-w-[280px] justify-between font-medium">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 shrink-0 text-primary" />
            <span className="truncate text-sm">
              {activeCompany?.razao_social || "Selecione uma empresa"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        {companies
          .filter((c) => c.is_active)
          .map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setActiveCompany(company)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{company.razao_social}</span>
                <span className="text-xs text-muted-foreground">{company.cnpj}</span>
              </div>
              {activeCompany?.id === company.id && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CompanySwitcher;
