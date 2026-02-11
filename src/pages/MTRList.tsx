import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileX2, Trash2, Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExportDropdown from "@/components/ExportDropdown";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface MTRItem {
  id: string;
  created_at: string;
  waste_class: string;
  weight_kg: number;
  status: string;
  transporter_name: string;
}

const statusConfig: Record<string, { label: string; className: string; tooltip?: string }> = {
  conformidade: { label: "Em Conformidade", className: "bg-accent text-accent-foreground border-0" },
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning border-0", tooltip: "Aguardando assinatura do destinador" },
  risco: { label: "Risco", className: "bg-risk/15 text-risk border-0", tooltip: "Documento ilegível ou dados inconsistentes" },
};

const getStatusBadge = (status: string) => {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground border-0" };
  return config;
};

const StatusBadgeWithTooltip = ({ status }: { status: string }) => {
  const badge = getStatusBadge(status);
  return (
    <div className="flex items-center gap-1.5">
      <Badge className={badge.className}>{badge.label}</Badge>
      {badge.tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px]">
            <p className="text-xs">{badge.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
};

const MTRList = () => {
  const isMobile = useIsMobile();
  const [data, setData] = useState<MTRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { settings: company } = useCompanySettings();

  const mtrColumns = [
    { header: "Data", key: "date" },
    { header: "ID", key: "shortId" },
    { header: "Classe", key: "waste_class" },
    { header: "Peso (kg)", key: "weight_kg" },
    { header: "Transportadora", key: "transporter_name" },
    { header: "Status", key: "statusLabel" },
  ];

  const exportRows = data.map((item) => ({
    date: formatDate(item.created_at),
    shortId: item.id.slice(0, 8),
    waste_class: item.waste_class,
    weight_kg: item.weight_kg,
    transporter_name: item.transporter_name,
    statusLabel: getStatusBadge(item.status).label,
  }));

  const handleExportCSV = () => exportCSV({ title: "Meus_MTRs", columns: mtrColumns, rows: exportRows });
  const handleExportPDF = () => exportPDF({ title: "Meus MTRs", columns: mtrColumns, rows: exportRows, company });

  useEffect(() => {
    const fetchMTRs = async () => {
      const { data: manifests, error } = await supabase
        .from("waste_manifests")
        .select("id, created_at, waste_class, weight_kg, status, transporter_name")
        .order("created_at", { ascending: false });

      if (!error && manifests) {
        setData(manifests);
      }
      setLoading(false);
    };
    fetchMTRs();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("waste_manifests").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erro ao excluir o manifesto.");
    } else {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Manifesto excluído com sucesso.");
    }
    setDeleting(false);
    setDeleteId(null);
  };


  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus MTRs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manifestos de Transporte de Resíduos</p>
        </div>
        {data.length > 0 && <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
      </div>

      {data.length === 0 ? (
        <Card className="p-12 shadow-card border-border/60 flex flex-col items-center justify-center gap-4 text-center">
          <FileX2 className="w-12 h-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-semibold text-foreground">Nenhum MTR registrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">Registre seu primeiro manifesto para vê-lo aqui.</p>
          </div>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-card-foreground">{item.id.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                  <StatusBadgeWithTooltip status={item.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.waste_class}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                <span className="text-sm font-medium text-card-foreground">{item.weight_kg} kg</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                  <TableCell className="font-medium">{item.id.slice(0, 8)}</TableCell>
                  <TableCell>{item.waste_class}</TableCell>
                  <TableCell>{Number(item.weight_kg).toLocaleString()}</TableCell>
                  <TableCell>{item.transporter_name}</TableCell>
                  <TableCell>
                    <StatusBadgeWithTooltip status={item.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Manifesto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MTRList;
