import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ClipboardList, Trash2, Info, AlertTriangle, CheckCircle, Upload, Loader2 } from "lucide-react";
import CloseoutModal from "@/components/manifest/CloseoutModal";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExportDropdown from "@/components/ExportDropdown";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { differenceInDays } from "date-fns";
import { formatDateBR, formatNumber } from "@/lib/format";
import { TableSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";

interface MTRItem {
  id: string;
  created_at: string;
  waste_class: string;
  weight_kg: number;
  status: string;
  transporter_name: string;
  rejection_reason: string | null;
  expiration_date: string | null;
}

type ExpirationState = "expired" | "expiring_soon" | "ok";

const getExpirationState = (expDate: string | null): ExpirationState => {
  if (!expDate) return "ok";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expDate);
  if (exp < today) return "expired";
  if (differenceInDays(exp, today) <= 3) return "expiring_soon";
  return "ok";
};

const statusConfig: Record<string, { label: string; className: string }> = {
  conformidade: { label: "Em Conformidade", className: "bg-accent text-accent-foreground border-0" },
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning border-0" },
  risco: { label: "Risco", className: "bg-risk/15 text-risk border-0" },
  vencido: { label: "Vencido", className: "bg-destructive/15 text-destructive border-0" },
  enviado: { label: "Enviado", className: "bg-primary/15 text-primary border-0" },
  em_transito: { label: "Em Trânsito", className: "bg-primary/15 text-primary border-0" },
};

const getEffectiveStatus = (item: MTRItem): string => {
  const expState = getExpirationState(item.expiration_date);
  if (expState === "expired") return "vencido";
  return item.status;
};

const getStatusBadge = (status: string) => {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground border-0" };
  return config;
};

const StatusBadgeClickable = ({
  item,
  onShowReason,
}: {
  item: MTRItem;
  onShowReason: (reason: string) => void;
}) => {
  const effectiveStatus = getEffectiveStatus(item);
  const badge = getStatusBadge(effectiveStatus);
  const expState = getExpirationState(item.expiration_date);
  const isClickable = (effectiveStatus === "pendente" || effectiveStatus === "risco") && item.rejection_reason;

  return (
    <div
      className={`flex items-center gap-1.5 ${isClickable ? "cursor-pointer" : ""}`}
      onClick={() => isClickable && onShowReason(item.rejection_reason!)}
    >
      {expState === "expiring_soon" && effectiveStatus !== "vencido" && (
        <AlertTriangle className="w-4 h-4 text-warning" />
      )}
      <Badge className={badge.className}>
        {badge.label}
        {isClickable && <Info className="w-3 h-3 ml-1 inline" />}
      </Badge>
    </div>
  );
};

const MTRList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [data, setData] = useState<MTRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [closeoutId, setCloseoutId] = useState<string | null>(null);
  const [uploadingCdfId, setUploadingCdfId] = useState<string | null>(null);
  const { settings: company } = useCompanySettings();

  const handleCdfUpload = async (manifestId: string, file: File) => {
    if (!user) return;
    setUploadingCdfId(manifestId);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const cdfPath = `${user.id}/${manifestId}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("cdf-files").upload(cdfPath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { error: statusError } = await supabase
        .from("waste_manifests")
        .update({ status: "enviado" } as any)
        .eq("id", manifestId);
      if (statusError) throw statusError;

      // Get manifest weight for certificate
      const manifest = data.find((m) => m.id === manifestId);
      await supabase.from("certificates").insert({
        manifest_id: manifestId,
        user_id: user.id,
        file_url: cdfPath,
        received_date: format(new Date(), "yyyy-MM-dd"),
        received_weight: manifest?.weight_kg || 0,
      } as any);

      toast.success("CDF anexado! Status alterado para Enviado ✅");
      fetchMTRs();
    } catch (err: any) {
      console.error("Erro ao anexar CDF:", err);
      toast.error(err.message || "Erro ao anexar CDF.");
    } finally {
      setUploadingCdfId(null);
    }
  };

  const mtrColumns = [
    { header: "Data", key: "date" },
    { header: "ID", key: "shortId" },
    { header: "Classe", key: "waste_class" },
    { header: "Peso (kg)", key: "weight_kg" },
    { header: "Transportadora", key: "transporter_name" },
    { header: "Status", key: "statusLabel" },
  ];

  const exportRows = data.map((item) => ({
    date: formatDateBR(item.created_at, false),
    shortId: item.id.slice(0, 8),
    waste_class: item.waste_class,
    weight_kg: item.weight_kg,
    transporter_name: item.transporter_name,
    statusLabel: getStatusBadge(getEffectiveStatus(item)).label,
  }));

  const handleExportCSV = () => exportCSV({ title: "Meus_MTRs", columns: mtrColumns, rows: exportRows });
  const handleExportPDF = () => exportPDF({ title: "Meus MTRs", columns: mtrColumns, rows: exportRows, company });

  const fetchMTRs = async () => {
    setLoading(true);
    const { data: manifests, error } = await supabase
      .from("waste_manifests")
      .select("id, created_at, waste_class, weight_kg, status, transporter_name, rejection_reason, expiration_date")
      .not("status", "in", "(received,completed,aguardando_validacao)")
      .order("created_at", { ascending: false });

    if (!error && manifests) {
      setData(manifests);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMTRs();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from("waste_manifests").delete().eq("id", deleteId);
    if (error) {
      toast.error("Erro ao excluir o manifesto ❌");
    } else {
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Manifesto excluído com sucesso 🗑️");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse rounded-md" />
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus MTRs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manifestos de Transporte de Resíduos</p>
        </div>
        {data.length > 0 && <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />}
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Tudo limpo! Comece seu primeiro manifesto agora."
          description="Registre seu primeiro MTR para acompanhar a conformidade ambiental da sua empresa."
          actionLabel="Novo MTR"
          onAction={() => navigate("/novo-manifesto")}
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {data.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-card-foreground">{item.id.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                   <StatusBadgeClickable item={item} onShowReason={setSelectedReason} />
                   {item.status === "pendente" && (
                     <label className="cursor-pointer">
                       <input
                         type="file"
                         accept="image/*,.pdf"
                         className="hidden"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) handleCdfUpload(item.id, file);
                         }}
                       />
                       <Button
                         variant="outline"
                         size="icon"
                         className="h-11 w-11 min-h-[44px] min-w-[44px] text-primary hover:text-primary"
                         asChild
                         disabled={uploadingCdfId === item.id}
                       >
                         <span>
                           {uploadingCdfId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                         </span>
                       </Button>
                     </label>
                   )}
                   {(item.status === "enviado" || item.status === "em_transito") && (
                     <Button
                       variant="outline"
                       size="icon"
                       className="h-11 w-11 min-h-[44px] min-w-[44px] text-primary hover:text-primary"
                       onClick={() => setCloseoutId(item.id)}
                       title="Registrar Recebimento"
                     >
                       <CheckCircle className="w-4 h-4" />
                     </Button>
                   )}
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-11 w-11 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-destructive"
                     onClick={() => setDeleteId(item.id)}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.waste_class}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{formatDateBR(item.created_at)}</span>
                <span className="text-sm font-medium text-card-foreground">{formatNumber(item.weight_kg)} kg</span>
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
                <TableRow key={item.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="text-muted-foreground">{formatDateBR(item.created_at)}</TableCell>
                  <TableCell className="font-medium">{item.id.slice(0, 8)}</TableCell>
                  <TableCell>{item.waste_class}</TableCell>
                  <TableCell>{formatNumber(item.weight_kg)}</TableCell>
                  <TableCell>{item.transporter_name}</TableCell>
                  <TableCell>
                    <StatusBadgeClickable item={item} onShowReason={setSelectedReason} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.status === "pendente" && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCdfUpload(item.id, file);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary"
                            asChild
                            disabled={uploadingCdfId === item.id}
                            title="Anexar CDF"
                          >
                            <span>
                              {uploadingCdfId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </span>
                          </Button>
                        </label>
                      )}
                      {(item.status === "enviado" || item.status === "em_transito") && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-primary hover:text-primary"
                          onClick={() => setCloseoutId(item.id)}
                          title="Registrar Recebimento"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CloseoutModal
        manifestId={closeoutId}
        onClose={() => setCloseoutId(null)}
        onSuccess={() => {
          setCloseoutId(null);
          fetchMTRs();
        }}
      />

      <Dialog open={!!selectedReason} onOpenChange={(open) => !open && setSelectedReason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Pendência</DialogTitle>
          </DialogHeader>
          <div className="rounded-md bg-warning/10 border border-warning/20 p-4">
            <p className="text-sm text-foreground">{selectedReason}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSelectedReason(null)} className="min-h-[44px]">Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Manifesto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="min-h-[44px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-h-[44px]">
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MTRList;
