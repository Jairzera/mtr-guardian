import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Search,
  Scale,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  PackageCheck,
  FileCheck,
  Truck,
  Factory,
} from "lucide-react";
import { format } from "date-fns";

interface Manifest {
  id: string;
  waste_class: string;
  weight_kg: number;
  unit: string;
  transporter_name: string;
  status: string;
  created_at: string;
  destination_type: string;
  user_id: string;
}

type Step = "search" | "review" | "done";

const ReceberCarga = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [pesoReal, setPesoReal] = useState("");

  // Fetch manifests awaiting receipt
  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["receiver-incoming-manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("*")
        .in("status", ["enviado", "em_transito", "pendente", "conformidade"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Manifest[];
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async ({
      id,
      pesoReal,
    }: {
      id: string;
      pesoReal: number;
    }) => {
      const divergente = selectedManifest
        ? Math.abs(pesoReal - selectedManifest.weight_kg) > 0.5
        : false;

      const { error } = await supabase
        .from("waste_manifests")
        .update({
          status: "completed",
          received_weight: pesoReal,
          rejection_reason: divergente
            ? `Divergência: ${pesoReal}${selectedManifest?.unit} recebido vs ${selectedManifest?.weight_kg}${selectedManifest?.unit} declarado`
            : null,
        } as any)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receiver-incoming-manifests"] });
      queryClient.invalidateQueries({ queryKey: ["achievements-total-weight"] });
      queryClient.invalidateQueries({ queryKey: ["receiver-dashboard"] });
      setStep("done");
      toast.success("Carga confirmada e CDF gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao confirmar carga. Tente novamente.");
    },
  });

  const filteredManifests = manifests.filter((m) =>
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.waste_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.transporter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectManifest = (manifest: Manifest) => {
    setSelectedManifest(manifest);
    setPesoReal("");
    setStep("review");
  };

  const handleConfirm = () => {
    if (!selectedManifest || !pesoReal) return;
    confirmMutation.mutate({
      id: selectedManifest.id,
      pesoReal: parseFloat(pesoReal),
    });
  };

  const handleReset = () => {
    setStep("search");
    setSelectedManifest(null);
    setPesoReal("");
    setSearchQuery("");
  };

  const divergenceKg = selectedManifest && pesoReal
    ? parseFloat(pesoReal) - selectedManifest.weight_kg
    : 0;
  const hasDivergence = Math.abs(divergenceKg) > 0.5;

  // STEP: Done
  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in space-y-6 p-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Carga Recebida!</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            O MTR foi confirmado com sucesso e o Certificado de Destinação Final (CDF) foi gerado automaticamente.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">MTR</span>
            <span className="font-mono text-foreground text-xs">{selectedManifest?.id.slice(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Peso Confirmado</span>
            <span className="font-semibold text-foreground">{pesoReal} {selectedManifest?.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge className="bg-primary/10 text-primary border-0">Concluído</Badge>
          </div>
        </div>
        <Button onClick={handleReset} className="gradient-primary shadow-primary font-semibold gap-2">
          <PackageCheck className="w-4 h-4" />
          Receber Outra Carga
        </Button>
      </div>
    );
  }

  // STEP: Review / Staging
  if (step === "review" && selectedManifest) {
    return (
      <div className="max-w-lg mx-auto space-y-6 animate-fade-in p-4">
        <button
          onClick={() => setStep("search")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para busca
        </button>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Conferência de Recebimento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verifique os dados e registre o peso real na balança.
          </p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-border text-muted-foreground gap-1.5">
            <Scale className="w-3 h-3" />
            Aguardando Conferência
          </Badge>
        </div>

        {/* Generator & MTR info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Factory className="w-4 h-4 text-muted-foreground" />
              Dados do Manifesto
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Nº MTR</p>
                <p className="font-mono text-foreground">{selectedManifest.id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Data de Emissão</p>
                <p className="text-foreground">{format(new Date(selectedManifest.created_at), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tipo de Resíduo</p>
                <p className="font-medium text-foreground">{selectedManifest.waste_class}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Destinação</p>
                <p className="text-foreground">{selectedManifest.destination_type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Transportador:</span>
              <span className="font-medium text-foreground">{selectedManifest.transporter_name}</span>
            </div>
          </CardContent>
        </Card>

        {/* Declared weight */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Peso Declarado pelo Gerador</p>
            <p className="text-4xl font-bold text-foreground">
              {Number(selectedManifest.weight_kg).toLocaleString("pt-BR")}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                {selectedManifest.unit}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Real weight input */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              Peso Real na Balança de Entrada
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              className="text-xl font-bold h-14"
              placeholder="Digitar peso em kg"
              value={pesoReal}
              onChange={(e) => setPesoReal(e.target.value)}
              autoFocus
            />

            {pesoReal && hasDivergence && (
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>
                  Divergência de{" "}
                  <strong>{Math.abs(divergenceKg).toLocaleString("pt-BR")} {selectedManifest.unit}</strong>{" "}
                  ({divergenceKg > 0 ? "acima" : "abaixo"} do declarado)
                </span>
              </div>
            )}

            {pesoReal && !hasDivergence && (
              <div className="flex items-center gap-2 text-primary text-sm p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Peso confere com o declarado pelo gerador.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Final action */}
        <Button
          className="w-full h-14 text-base font-bold gradient-primary shadow-primary gap-2"
          onClick={handleConfirm}
          disabled={!pesoReal || confirmMutation.isPending}
        >
          {confirmMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileCheck className="w-5 h-5" />
          )}
          Confirmar e Gerar CDF
        </Button>

        {hasDivergence && pesoReal && (
          <p className="text-xs text-center text-muted-foreground">
            A divergência será registrada no CDF mas não impede o recebimento.
          </p>
        )}
      </div>
    );
  }

  // STEP: Search
  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in p-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Receber Carga</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Busque o MTR pelo código ou selecione da lista abaixo.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-11 h-12 text-base"
          placeholder="Digitar código do MTR..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Manifests list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filteredManifests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <PackageCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma carga encontrada</p>
          <p className="text-xs mt-1">
            {searchQuery
              ? "Tente buscar por outro código ou transportador."
              : "Não há cargas pendentes de recebimento."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filteredManifests.length} carga(s) pendente(s)</p>
          {filteredManifests.map((m) => (
            <button
              key={m.id}
              onClick={() => handleSelectManifest(m)}
              className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all active:scale-[0.99] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">
                  MTR {m.id.slice(0, 8)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {m.status === "em_transito" ? "Em Trânsito" : "Enviado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{m.waste_class}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Truck className="w-3 h-3" />
                    {m.transporter_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {Number(m.weight_kg).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.unit}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(m.created_at), "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceberCarga;
