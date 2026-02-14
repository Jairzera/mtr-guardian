import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PackageCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import ExportDropdown from "@/components/ExportDropdown";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { formatDateBR, formatNumber } from "@/lib/format";
import { TableSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";

interface HistoricoItem {
  id: string;
  created_at: string;
  updated_at: string;
  waste_class: string;
  weight_kg: number;
  received_weight: number | null;
  status: string;
  transporter_name: string;
  unit: string;
}

const statusLabels: Record<string, string> = {
  received: "Recebido",
  completed: "Validado",
  aguardando_validacao: "Aguardando Validação",
};

const HistoricoCargas = () => {
  const isMobile = useIsMobile();
  const [data, setData] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings: company } = useCompanySettings();

  const columns = [
    { header: "Data Validação", key: "validationDate" },
    { header: "ID", key: "shortId" },
    { header: "Classe", key: "waste_class" },
    { header: "Peso Original", key: "weight_kg" },
    { header: "Peso Recebido", key: "received_weight" },
    { header: "Transportadora", key: "transporter_name" },
    { header: "Status", key: "statusLabel" },
  ];

  const exportRows = data.map((item) => ({
    validationDate: formatDateBR(item.updated_at, false),
    shortId: item.id.slice(0, 8),
    waste_class: item.waste_class,
    weight_kg: `${formatNumber(item.weight_kg)} ${item.unit}`,
    received_weight: item.received_weight ? `${formatNumber(item.received_weight)} ${item.unit}` : "—",
    transporter_name: item.transporter_name,
    statusLabel: statusLabels[item.status] ?? item.status,
  }));

  const handleExportCSV = () => exportCSV({ title: "Historico_Cargas", columns, rows: exportRows });
  const handleExportPDF = () => exportPDF({ title: "Histórico de Cargas", columns, rows: exportRows, company });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: manifests } = await supabase
        .from("waste_manifests")
        .select("id, created_at, updated_at, waste_class, weight_kg, received_weight, status, transporter_name, unit")
        .in("status", ["received", "completed", "aguardando_validacao"])
        .order("updated_at", { ascending: false });

      if (manifests) setData(manifests);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Histórico de Cargas</h1>
          <p className="text-sm text-muted-foreground mt-1">Cargas validadas e recebidas</p>
        </div>
        {data.length > 0 && <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          title="Nenhuma carga validada ainda."
          description="As cargas aparecerão aqui após serem validadas pelo destinador."
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-card-foreground">{item.id.slice(0, 8)}</span>
                <Badge variant="outline" className="bg-accent text-accent-foreground border-0">
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.waste_class}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{formatDateBR(item.updated_at)}</span>
                <span className="text-sm font-medium text-card-foreground">
                  {item.received_weight ? formatNumber(item.received_weight) : formatNumber(item.weight_kg)} {item.unit}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data Validação</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Peso Original</TableHead>
                <TableHead>Peso Recebido</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="text-muted-foreground">{formatDateBR(item.updated_at)}</TableCell>
                  <TableCell className="font-medium">{item.id.slice(0, 8)}</TableCell>
                  <TableCell>{item.waste_class}</TableCell>
                  <TableCell>{formatNumber(item.weight_kg)} {item.unit}</TableCell>
                  <TableCell>{item.received_weight ? `${formatNumber(item.received_weight)} ${item.unit}` : "—"}</TableCell>
                  <TableCell>{item.transporter_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-accent text-accent-foreground border-0">
                      {statusLabels[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default HistoricoCargas;
