import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, ExternalLink, ShieldCheck, AlertTriangle, FileCheck } from "lucide-react";
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

interface CDFRow {
  id: string;
  cdf_number: string;
  receiver_id: string;
  issue_date: string;
  pdf_url: string | null;
  status: string;
  mtr_count: number;
  receiver_name: string | null;
}

const CDFVault = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
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

      // Get MTR counts per CDF
      const cdfIds = (data || []).map((c) => c.id);
      let mtrCounts: Record<string, number> = {};
      if (cdfIds.length > 0) {
        const { data: manifests } = await supabase
          .from("waste_manifests")
          .select("cdf_id")
          .in("cdf_id", cdfIds);

        if (manifests) {
          manifests.forEach((m) => {
            if (m.cdf_id) {
              mtrCounts[m.cdf_id] = (mtrCounts[m.cdf_id] || 0) + 1;
            }
          });
        }
      }

      // Get receiver names from company_settings
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
        .eq("status", "completed")
        .is("cdf_id", null);

      return count || 0;
    },
  });

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);

    try {
      // Mock: simulate finding a new CDF from the government
      await new Promise((r) => setTimeout(r, 1500));

      // Get completed manifests without CDF to link
      const { data: unlinkedMtrs } = await supabase
        .from("waste_manifests")
        .select("id, transporter_name")
        .eq("status", "completed")
        .is("cdf_id", null)
        .limit(3);

      if (!unlinkedMtrs || unlinkedMtrs.length === 0) {
        toast({ title: "Nenhum CDF novo encontrado", description: "Todos os MTRs já possuem CDF vinculado." });
        setSyncing(false);
        return;
      }

      // Create a mock CDF
      const cdfNumber = `CDF-MG-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;

      const { data: newCdf, error: insertErr } = await supabase
        .from("cdfs")
        .insert({
          cdf_number: cdfNumber,
          generator_id: user.id,
          receiver_id: user.id, // mock: same user for demo
          issue_date: new Date().toISOString().split("T")[0],
          status: "VALID",
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // Link MTRs to the new CDF and set status to finalized
      const mtrIds = unlinkedMtrs.map((m) => m.id);
      const { error: updateErr } = await supabase
        .from("waste_manifests")
        .update({ cdf_id: newCdf.id, status: "finalized" })
        .in("id", mtrIds);

      if (updateErr) throw updateErr;

      toast({
        title: "CDF sincronizado com sucesso!",
        description: `${cdfNumber} vinculado a ${mtrIds.length} MTR(s).`,
      });

      queryClient.invalidateQueries({ queryKey: ["cdfs"] });
      queryClient.invalidateQueries({ queryKey: ["mtrs-pending-cdf"] });
    } catch (err) {
      console.error("Sync error:", err);
      toast({ title: "Erro na sincronização", description: "Tente novamente mais tarde.", variant: "destructive" });
    } finally {
      setSyncing(false);
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Certificados de Destinação Final (CDF)</h1>
          <p className="text-sm text-muted-foreground mt-1">Cofre jurídico — documentos oficiais do órgão ambiental</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="gap-2 gradient-primary shadow-primary font-semibold"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar com Órgão Ambiental"}
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
          description="Clique em 'Sincronizar com Órgão Ambiental' para buscar certificados disponíveis."
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
                {cdf.pdf_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                      <ExternalLink className="w-4 h-4" /> PDF
                    </a>
                  </Button>
                )}
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
                <TableHead className="text-right">Ação</TableHead>
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
                    {cdf.pdf_url ? (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={cdf.pdf_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
