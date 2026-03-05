import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, ExternalLink, ShieldCheck, AlertTriangle, FileCheck, FileDown, Info, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";

interface CDFRow {
  id: string;
  cdf_number: string;
  receiver_id: string;
  issue_date: string;
  pdf_url: string | null;
  status: string;
  mtr_count: number;
  receiver_name: string | null;
  linked_mtrs: string[];
}

const CDFVault = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { settings } = useCompanySettings();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch CDFs with linked MTR count
  const { data: cdfs = [], isLoading } = useQuery({
    queryKey: ["cdfs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cdfs")
        .select("*")
        .order("issue_date", { ascending: false });

      if (error) throw error;

      const cdfIds = (data || []).map((c) => c.id);
      let mtrCounts: Record<string, number> = {};
      let mtrNumbers: Record<string, string[]> = {};
      if (cdfIds.length > 0) {
        const { data: manifests } = await supabase
          .from("waste_manifests")
          .select("cdf_id, mtr_number")
          .in("cdf_id", cdfIds);

        if (manifests) {
          manifests.forEach((m) => {
            if (m.cdf_id) {
              mtrCounts[m.cdf_id] = (mtrCounts[m.cdf_id] || 0) + 1;
              if (!mtrNumbers[m.cdf_id]) mtrNumbers[m.cdf_id] = [];
              if (m.mtr_number) mtrNumbers[m.cdf_id].push(m.mtr_number);
            }
          });
        }
      }

      const receiverIds = [...new Set((data || []).map((c) => c.receiver_id))];
      let receiverNames: Record<string, string> = {};
      if (receiverIds.length > 0) {
        const { data: companies } = await supabase
          .from("company_settings")
          .select("user_id, razao_social")
          .in("user_id", receiverIds);

        if (companies) {
          companies.forEach((c) => {
            receiverNames[c.user_id] = c.razao_social;
          });
        }
      }

      return (data || []).map((c) => ({
        ...c,
        mtr_count: mtrCounts[c.id] || 0,
        receiver_name: receiverNames[c.receiver_id] || "Destinador",
        linked_mtrs: mtrNumbers[c.id] || [],
      })) as CDFRow[];
    },
  });

  // Count MTRs completed but without CDF
  const { data: pendingCount = 0 } = useQuery({
    queryKey: ["mtrs-pending-cdf"],
    queryFn: async () => {
      const { count } = await supabase
        .from("waste_manifests")
        .select("id", { count: "exact", head: true })
        .in("status", ["completed", "received"])
        .is("cdf_id", null);

      return count || 0;
    },
  });

  const handleSyncPdfs = async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-sinir");
      if (error) throw error;

      if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        const downloaded = data?.pdfs_downloaded || 0;
        toast({
          title: downloaded > 0 ? "PDFs baixados!" : "Nenhum PDF pendente",
          description: data?.message || "Sincronização concluída.",
        });
        queryClient.invalidateQueries({ queryKey: ["waste-manifests"] });
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleUploadCdf = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("cdf-files")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signedUrl } = await supabase.storage
        .from("cdf-files")
        .createSignedUrl(fileName, 365 * 24 * 60 * 60);

      // Create a CDF record
      const cdfNumber = `CDF-UPLOAD-${Date.now().toString(36).toUpperCase()}`;
      const { error: insertError } = await supabase.from("cdfs").insert({
        cdf_number: cdfNumber,
        generator_id: user.id,
        receiver_id: user.id,
        issue_date: new Date().toISOString().split("T")[0],
        pdf_url: signedUrl?.signedUrl || fileName,
        status: "VALID",
      });

      if (insertError) throw insertError;

      toast({ title: "CDF enviado com sucesso!", description: "O documento foi armazenado no cofre jurídico." });
      queryClient.invalidateQueries({ queryKey: ["cdfs"] });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({ title: "Erro no upload", description: err.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <p className="text-muted-foreground">Carregando certificados...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Cofre de CDFs</h1>
          <p className="text-sm text-muted-foreground mt-1">Repositório jurídico de Certificados de Destinação Final</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSyncPdfs}
            disabled={syncing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Baixando..." : "Baixar PDFs de MTRs"}
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 gradient-primary shadow-primary font-semibold"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : "Upload de CDF Oficial"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadCdf(file);
            }}
          />
        </div>
      </div>

      {/* Informational Banner */}
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          O CDF oficial deve ser emitido e baixado no{" "}
          <a href="https://mtr.sinir.gov.br" target="_blank" rel="noopener noreferrer" className="font-semibold underline text-primary">
            portal do SINIR
          </a>
          . Faça o upload aqui para manter seu cofre jurídico organizado. A API do governo não permite emissão automática de CDFs.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent">
            <FileCheck className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cdfs.length}</p>
            <p className="text-sm text-muted-foreground">CDFs armazenados</p>
          </div>
        </Card>

        <Card className={`p-5 shadow-card border-border/60 flex items-center gap-4 ${pendingCount > 0 ? "border-destructive/40" : ""}`}>
          <div className={`p-3 rounded-xl ${pendingCount > 0 ? "bg-destructive/10" : "bg-muted/50"}`}>
            <AlertTriangle className={`w-6 h-6 ${pendingCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">MTRs aguardando CDF</p>
          </div>
        </Card>
      </div>

      {/* CDF List */}
      {cdfs.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum CDF armazenado"
          description="Faça upload dos CDFs oficiais que você baixou do portal do SINIR para manter seu cofre jurídico organizado."
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {cdfs.map((cdf) => (
            <Card key={cdf.id} className="p-4 shadow-card border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-card-foreground">{cdf.cdf_number}</span>
                <Badge variant={cdf.status === "VALID" ? "default" : "destructive"} className="text-xs">
                  {cdf.status === "VALID" ? "Válido" : "Cancelado"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{cdf.receiver_name}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(cdf.issue_date).toLocaleDateString("pt-BR")} · {cdf.mtr_count} MTR(s)
                </span>
                <div className="flex gap-1">
                  {cdf.pdf_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <FileDown className="w-4 h-4" /> PDF
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Número</TableHead>
                <TableHead>Destinador</TableHead>
                <TableHead>Data de Emissão</TableHead>
                <TableHead className="text-center">MTRs Vinculados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cdfs.map((cdf) => (
                <TableRow key={cdf.id}>
                  <TableCell className="font-medium">{cdf.cdf_number}</TableCell>
                  <TableCell>{cdf.receiver_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(cdf.issue_date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{cdf.mtr_count}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={cdf.status === "VALID" ? "default" : "destructive"}>
                      {cdf.status === "VALID" ? "Válido" : "Cancelado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {cdf.pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer" title="Abrir PDF">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
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

export default CDFVault;
