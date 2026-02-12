import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, PackageCheck, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
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
}

const Recebimento = () => {
  const queryClient = useQueryClient();
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [pesoReal, setPesoReal] = useState("");

  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["receiver-manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_manifests")
        .select("*")
        .in("status", ["enviado", "em_transito"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Manifest[];
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({
      id,
      pesoReal,
      divergente,
    }: {
      id: string;
      pesoReal: number;
      divergente: boolean;
    }) => {
      const { error } = await supabase
        .from("waste_manifests")
        .update({
          status: "concluido",
          rejection_reason: divergente
            ? `Divergência de peso: declarado ${selectedManifest?.weight_kg}${selectedManifest?.unit}, real ${pesoReal}${selectedManifest?.unit}`
            : null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["receiver-manifests"] });
      toast.success(
        variables.divergente
          ? "Carga aprovada com divergência registrada. CDF gerado."
          : "Carga aprovada com sucesso! CDF gerado."
      );
      setSelectedManifest(null);
      setPesoReal("");
    },
    onError: () => {
      toast.error("Erro ao validar carga. Tente novamente.");
    },
  });

  const handleValidate = () => {
    if (!selectedManifest || !pesoReal) return;

    const pesoRealNum = parseFloat(pesoReal);
    const divergente = Math.abs(pesoRealNum - selectedManifest.weight_kg) > 0.5;

    validateMutation.mutate({
      id: selectedManifest.id,
      pesoReal: pesoRealNum,
      divergente,
    });
  };

  const statusBadge = (status: string) => {
    if (status === "em_transito")
      return <Badge variant="outline" className="border-primary text-primary">Em Trânsito</Badge>;
    return <Badge variant="secondary">Enviado</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recebimento de Carga</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Valide as cargas recebidas e gere o CDF automaticamente.
        </p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <PackageCheck className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{manifests.length}</p>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Scale className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {manifests.reduce((sum, m) => sum + Number(m.weight_kg), 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-muted-foreground">kg Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {manifests.filter((m) => m.status === "em_transito").length}
              </p>
              <p className="text-xs text-muted-foreground">Em Trânsito</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cargas Aguardando Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : manifests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhuma carga pendente</p>
              <p className="text-xs mt-1">Todas as cargas foram validadas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Resíduo</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>Transportador</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manifests.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs">
                        {format(new Date(m.created_at), "dd/MM/yy")}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{m.waste_class}</TableCell>
                      <TableCell className="text-sm">
                        {Number(m.weight_kg).toLocaleString("pt-BR")} {m.unit}
                      </TableCell>
                      <TableCell className="text-sm">{m.transporter_name}</TableCell>
                      <TableCell>{statusBadge(m.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedManifest(m);
                            setPesoReal("");
                          }}
                        >
                          Validar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Modal */}
      <Dialog open={!!selectedManifest} onOpenChange={(open) => !open && setSelectedManifest(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Validar Recebimento</DialogTitle>
          </DialogHeader>
          {selectedManifest && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Resíduo:</span>{" "}
                  <strong>{selectedManifest.waste_class}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Transportador:</span>{" "}
                  {selectedManifest.transporter_name}
                </p>
                <p>
                  <span className="text-muted-foreground">Destino:</span>{" "}
                  {selectedManifest.destination_type}
                </p>
              </div>

              <div className="rounded-lg border-2 border-primary/30 p-4 text-center bg-primary/5">
                <p className="text-xs text-muted-foreground mb-1">Peso Declarado pelo Gerador</p>
                <p className="text-3xl font-bold text-foreground">
                  {Number(selectedManifest.weight_kg).toLocaleString("pt-BR")}{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    {selectedManifest.unit}
                  </span>
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Peso Real na Balança de Entrada
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  className="mt-1.5 text-lg font-semibold"
                  placeholder="Ex: 500"
                  value={pesoReal}
                  onChange={(e) => setPesoReal(e.target.value)}
                  autoFocus
                />
              </div>

              {pesoReal && Math.abs(parseFloat(pesoReal) - selectedManifest.weight_kg) > 0.5 && (
                <div className="flex items-center gap-2 text-destructive text-xs p-2 bg-destructive/10 rounded-md">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Divergência detectada:{" "}
                    {(parseFloat(pesoReal) - selectedManifest.weight_kg).toLocaleString("pt-BR")} {selectedManifest.unit}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedManifest(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleValidate}
              disabled={!pesoReal || validateMutation.isPending}
            >
              {validateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {pesoReal && Math.abs(parseFloat(pesoReal) - (selectedManifest?.weight_kg ?? 0)) > 0.5
                ? "Confirmar Divergência"
                : "Aprovar Carga"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recebimento;
