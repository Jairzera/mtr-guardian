import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShieldCheck, Plus, CalendarDays, Building2, Weight,
  FileUp, Loader2, Trash2, FileText, AlertTriangle,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import EmptyState from "@/components/EmptyState";

interface License {
  id: string;
  document_name: string;
  issuing_body: string;
  expiration_date: string;
  weight_limit_kg: number;
  weight_used_kg: number;
  pdf_url: string | null;
  created_at: string;
}

function getExpirationStatus(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  const days = differenceInDays(exp, today);

  if (days < 0) return { label: `Vencido há ${Math.abs(days)}d`, color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", severity: "expired" as const };
  if (days <= 30) return { label: `Vence em ${days}d`, color: "bg-warning/10 text-warning border-warning/20", dot: "bg-warning", severity: "warning" as const };
  return { label: `Válido (${days}d)`, color: "bg-accent text-accent-foreground border-accent/40", dot: "bg-primary", severity: "ok" as const };
}

const Licencas = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [docName, setDocName] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [expDate, setExpDate] = useState("");
  const [weightLimit, setWeightLimit] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["licenses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licenses" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("expiration_date", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as License[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");

      let pdfUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("license-files")
          .upload(path, file);
        if (uploadError) throw uploadError;
        pdfUrl = path;
      }

      const { error } = await supabase.from("licenses" as any).insert({
        user_id: user.id,
        document_name: docName.trim(),
        issuing_body: issuingBody.trim(),
        expiration_date: expDate,
        weight_limit_kg: parseFloat(weightLimit) || 0,
        weight_used_kg: 0,
        pdf_url: pdfUrl,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Licença cadastrada com sucesso!");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Erro ao cadastrar licença."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("licenses" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Licença removida.");
    },
  });

  const resetForm = () => {
    setDocName("");
    setIssuingBody("");
    setExpDate("");
    setWeightLimit("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!docName.trim() || !expDate) {
      toast.error("Preencha o nome do documento e a data de vencimento.");
      return;
    }
    createMutation.mutate();
  };

  const expiredCount = licenses.filter((l) => getExpirationStatus(l.expiration_date).severity === "expired").length;
  const warningCount = licenses.filter((l) => getExpirationStatus(l.expiration_date).severity === "warning").length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Licenças e CADRIs</h1>
            <p className="text-sm text-muted-foreground">Controle de validade e volume autorizado dos documentos ambientais.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {expiredCount > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs gap-1">
              <AlertTriangle className="w-3 h-3" />
              {expiredCount} vencida(s)
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
              {warningCount} próxima(s)
            </Badge>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary shadow-primary font-semibold gap-2">
                <Plus className="w-4 h-4" />
                Cadastrar Licença
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Licença / CADRI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Nome do Documento *</Label>
                  <Input className="mt-1.5" placeholder="Ex: Licença de Operação, CADRI F01" value={docName} onChange={(e) => setDocName(e.target.value)} maxLength={200} />
                </div>
                <div>
                  <Label>Órgão Emissor</Label>
                  <Input className="mt-1.5" placeholder="Ex: CETESB, IBAMA, INEA" value={issuingBody} onChange={(e) => setIssuingBody(e.target.value)} maxLength={100} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Data de Vencimento *</Label>
                    <Input type="date" className="mt-1.5" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
                  </div>
                  <div>
                    <Label>Limite Autorizado (ton)</Label>
                    <Input className="mt-1.5" placeholder="Ex: 500" inputMode="decimal" value={weightLimit} onChange={(e) => setWeightLimit(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>PDF do Documento</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 w-full justify-start text-muted-foreground"
                      onClick={() => fileRef.current?.click()}
                    >
                      <FileUp className="w-4 h-4" />
                      {file ? file.name : "Selecionar arquivo..."}
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full gradient-primary shadow-primary font-semibold h-11"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</>
                  ) : (
                    "Cadastrar Licença"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* License Cards */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : licenses.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhuma licença cadastrada"
          description="Cadastre suas Licenças de Operação, CADRIs e outros documentos ambientais para monitorar validade e volume."
          actionLabel="Cadastrar Licença"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {licenses.map((lic) => {
            const status = getExpirationStatus(lic.expiration_date);
            const limitTon = lic.weight_limit_kg / 1000;
            const usedTon = lic.weight_used_kg / 1000;
            const pct = limitTon > 0 ? Math.min((usedTon / limitTon) * 100, 100) : 0;
            const pctColor = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-primary";

            return (
              <Card
                key={lic.id}
                className={`shadow-card border-border/60 transition-all hover:shadow-lg border-l-4 ${
                  status.severity === "expired"
                    ? "border-l-destructive"
                    : status.severity === "warning"
                    ? "border-l-warning"
                    : "border-l-primary"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-foreground text-base truncate">{lic.document_name}</p>
                      {lic.issuing_body && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3" />
                          {lic.issuing_body}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-xs ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Expiration */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Vencimento: <strong className="text-foreground">{format(new Date(lic.expiration_date), "dd/MM/yyyy")}</strong></span>
                  </div>

                  {/* Volume progress */}
                  {limitTon > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Weight className="w-3 h-3" />
                          Volume Autorizado
                        </span>
                        <span className="font-semibold text-foreground">
                          {usedTon.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} / {limitTon.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ton
                        </span>
                      </div>
                      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${pctColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground text-right">
                        {pct.toFixed(0)}% utilizado
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    {lic.pdf_url ? (
                      <button
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        onClick={async () => {
                          const { data } = await supabase.storage
                            .from("license-files")
                            .createSignedUrl(lic.pdf_url!, 60);
                          if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                          else toast.error("Não foi possível abrir o arquivo.");
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver PDF
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem PDF anexado</span>
                    )}
                    <button
                      className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                      onClick={() => deleteMutation.mutate(lic.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remover
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Licencas;
