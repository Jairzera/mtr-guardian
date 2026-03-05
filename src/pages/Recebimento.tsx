import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sinirReceberManifestoLote } from "@/hooks/useSinirLists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  PackageCheck,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Search,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import EmptyState from "@/components/EmptyState";

interface Manifest {
  id: string;
  waste_class: string;
  weight_kg: number;
  received_weight: number | null;
  unit: string;
  transporter_name: string;
  status: string;
  created_at: string;
  destination_type: string;
  rejection_reason: string | null;
  mtr_number: string | null;
}

const Recebimento = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["receiver-validation-manifests"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "aguardando_validacao")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Manifest[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (manifest: Manifest) => {
      // Try to confirm receipt on SINIR if MTR has a number
      if (manifest.mtr_number) {
        try {
          await sinirReceberManifestoLote({
            manNumero: manifest.mtr_number,
            manQtdeRecebida: manifest.received_weight || manifest.weight_kg,
          });
        } catch (sinirErr) {
          console.warn("SINIR receipt confirmation failed:", sinirErr);
          // Continue with local update even if SINIR fails
        }
      }

      const { error } = await supabase
        .from("waste_manifests")
        .update({ status: "completed" } as any)
        .eq("id", manifest.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receiver-validation-manifests"] });
      queryClient.invalidateQueries({ queryKey: ["achievements-total-weight"] });
      queryClient.invalidateQueries({ queryKey: ["receiver-dashboard"] });
      toast.success("Carga validada e concluída com sucesso! ✅");
    },
    onError: () => {
      toast.error("Erro ao validar carga.");
    },
  });

  const filteredManifests = manifests.filter(
    (m) =>
      m.waste_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.transporter_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-primary" />
          Validar Carga
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Confira os dados cadastrados e aprove para concluir o recebimento.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por resíduo, transportador ou código..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{filteredManifests.length}</p>
              <p className="text-xs text-muted-foreground">Aguardando Validação</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {filteredManifests
                  .reduce((sum, m) => sum + Number(m.received_weight || m.weight_kg), 0)
                  .toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">kg Pendente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de validacao */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filteredManifests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Nenhuma carga pendente de validação"
          description="As cargas cadastradas em 'Receber Carga' aparecerão aqui para conferência."
        />
      ) : (
        <div className="space-y-4">
          {filteredManifests.map((m) => {
            const declaredWeight = Number(m.weight_kg);
            const receivedWeight = Number(m.received_weight || m.weight_kg);
            const diff = Math.abs(receivedWeight - declaredWeight);
            const hasDivergence = diff > 0.5;

            return (
              <Card key={m.id} className="border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono text-muted-foreground">
                      MTR {m.id.slice(0, 8)}
                    </CardTitle>
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      Aguardando Validação
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comparison */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">📦 Dados Cadastrados</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Resíduo:</span> <strong className="text-foreground">{m.waste_class}</strong></p>
                        <p><span className="text-muted-foreground">Peso:</span> <strong className="text-foreground">{receivedWeight.toLocaleString("pt-BR")} {m.unit}</strong></p>
                        <p><span className="text-muted-foreground">Transportador:</span> <span className="text-foreground">{m.transporter_name}</span></p>
                        <p><span className="text-muted-foreground">Destino:</span> <span className="text-foreground">{m.destination_type}</span></p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">📋 Dados do Gerador</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Resíduo:</span> <strong className="text-foreground">{m.waste_class}</strong></p>
                        <p><span className="text-muted-foreground">Peso:</span> <strong className="text-foreground">{declaredWeight.toLocaleString("pt-BR")} {m.unit}</strong></p>
                        <p><span className="text-muted-foreground">Transportador:</span> <span className="text-foreground">{m.transporter_name}</span></p>
                        <p><span className="text-muted-foreground">Destino:</span> <span className="text-foreground">{m.destination_type}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Divergence indicator */}
                  {hasDivergence ? (
                    <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        Divergência de <strong>{diff.toLocaleString("pt-BR")} {m.unit}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary text-sm p-3 bg-primary/10 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Dados conferem — sem divergências.</span>
                    </div>
                  )}

                  {/* Observations */}
                  {m.rejection_reason && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Obs:</strong> {m.rejection_reason}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(m.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => approveMutation.mutate(m)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Aprovar e Concluir
                    </Button>
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

export default Recebimento;
