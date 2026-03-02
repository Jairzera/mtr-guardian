import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ExternalLink, ShieldCheck, AlertTriangle, FileCheck, FileDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateCDFPdf } from "@/lib/cdfPdfUtils";
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
  const [syncing, setSyncing] = useState(false);

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

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);

    try {
      // Call the real SINIR sync edge function
      const { data, error } = await supabase.functions.invoke("sync-sinir");

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "Erro na sincronização",
          description: data.error,
          variant: "destructive",
        });
      } else {
        const msg = data?.message || "Sincronização concluída.";
        const mtrsCount = data?.mtrs_synced || 0;
        const cdfsCount = data?.cdfs_synced || 0;
        const errors = data?.errors || [];

        toast({
          title: mtrsCount + cdfsCount > 0 ? "Sincronização concluída!" : "Nenhum dado novo",
          description: msg + (errors.length > 0 ? ` (${errors.length} erro(s))` : ""),
          variant: errors.length > 0 && mtrsCount + cdfsCount === 0 ? "destructive" : "default",
        });

        // Invalidate all relevant queries to propagate data
        queryClient.invalidateQueries({ queryKey: ["cdfs"] });
        queryClient.invalidateQueries({ queryKey: ["mtrs-pending-cdf"] });
        queryClient.invalidateQueries({ queryKey: ["waste-manifests"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["audit-manifests"] });
        queryClient.invalidateQueries({ queryKey: ["historico"] });
      }
    } catch (err: any) {
      console.error("Sync error:", err);
      toast({
        title: "Erro na sincronização",
        description: err.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDownloadCdfPdf = (cdf: CDFRow) => {
    generateCDFPdf(
      {
        certNumber: cdf.cdf_number,
        date: new Date(cdf.issue_date).toLocaleDateString("pt-BR"),
        linkedMTR: cdf.linked_mtrs.length > 0 ? cdf.linked_mtrs.join(", ") : `${cdf.mtr_count} MTR(s) vinculados`,
        destinador: cdf.receiver_name || "Destinador",
      },
      settings
    );
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Certificados de Destinação Final (CDF)</h1>
          <p className="text-sm text-muted-foreground mt-1">Cofre jurídico — documentos oficiais do órgão ambiental</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="gap-2 gradient-primary shadow-primary font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando SINIR..." : "Sincronizar com Órgão Ambiental"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card border-border/60 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent">
            <FileCheck className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{cdfs.length}</p>
            <p className="text-sm text-muted-foreground">CDFs recebidos</p>
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
          title="Nenhum CDF recebido"
          description="Clique em 'Sincronizar com Órgão Ambiental' para buscar certificados disponíveis do SINIR."
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
                  <Button variant="ghost" size="sm" onClick={() => handleDownloadCdfPdf(cdf)} className="gap-1">
                    <FileDown className="w-4 h-4" /> PDF
                  </Button>
                  {cdf.pdf_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <ExternalLink className="w-4 h-4" /> Original
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
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadCdfPdf(cdf)} title="Baixar PDF">
                        <FileDown className="w-4 h-4" />
                      </Button>
                      {cdf.pdf_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer" title="PDF Original">
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
