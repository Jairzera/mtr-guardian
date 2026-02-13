import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, PackageCheck, Scale, Truck, Trash2 } from "lucide-react";

const ReceberCarga = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [wasteClass, setWasteClass] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [unit, setUnit] = useState("kg");
  const [transporterName, setTransporterName] = useState("");
  const [destinationType, setDestinationType] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase.from("waste_manifests").insert({
        user_id: user.id,
        receiver_id: user.id,
        waste_class: wasteClass.trim(),
        weight_kg: parseFloat(weightKg.replace(",", ".")),
        unit,
        transporter_name: transporterName.trim(),
        destination_type: destinationType.trim(),
        status: "aguardando_validacao",
        received_weight: parseFloat(weightKg.replace(",", ".")),
        rejection_reason: observacoes.trim() || null,
      } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receiver-manifests"] });
      toast.success("Carga cadastrada! Acesse Validar Carga para conferência.");
      navigate("/validar-carga");
    },
    onError: () => {
      toast.error("Erro ao cadastrar carga. Tente novamente.");
    },
  });

  const handleSubmit = () => {
    if (!wasteClass.trim() || !weightKg.trim() || !transporterName.trim() || !destinationType.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in p-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <PackageCheck className="w-6 h-6 text-primary" />
          Receber Carga
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastre os dados da carga recebida na sua unidade.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Trash2 className="w-4 h-4 text-primary" />
            Dados do Resíduo
          </div>

          <div>
            <Label>Tipo de Resíduo *</Label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Sucata de Alumínio"
              value={wasteClass}
              onChange={(e) => setWasteClass(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Peso na Balança *</Label>
              <Input
                className="mt-1.5"
                placeholder="Ex: 500"
                inputMode="decimal"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="w-28">
              <Label>Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ton">Ton</SelectItem>
                  <SelectItem value="L">Litros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Tipo de Destinação *</Label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Reciclagem, Aterro, Coprocessamento"
              value={destinationType}
              onChange={(e) => setDestinationType(e.target.value)}
              maxLength={200}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Truck className="w-4 h-4 text-primary" />
            Transporte
          </div>

          <div>
            <Label>Transportador *</Label>
            <Input
              className="mt-1.5"
              placeholder="Nome da transportadora"
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Informações adicionais sobre a carga..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={500}
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <Scale className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Após cadastrar, a carga ficará disponível em <strong className="text-foreground">Validar Carga</strong> para conferência cruzada com os dados do Gerador.
        </p>
      </div>

      <Button
        className="w-full h-14 text-base font-bold gradient-primary shadow-primary gap-2"
        onClick={handleSubmit}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <PackageCheck className="w-5 h-5" />
        )}
        Cadastrar Carga Recebida
      </Button>
    </div>
  );
};

export default ReceberCarga;
