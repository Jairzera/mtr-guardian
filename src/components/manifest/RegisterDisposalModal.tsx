import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CalendarIcon, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { formatCNPJ } from "@/lib/cnpj";
import { parseNumericInput } from "@/lib/validation";

interface RegisterDisposalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegisterDisposalModal({ open, onClose, onSuccess }: RegisterDisposalModalProps) {
  const { user } = useAuth();
  const { settings } = useCompanySettings();
  const [saving, setSaving] = useState(false);
  const [wasteClass, setWasteClass] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [destinationType, setDestinationType] = useState("Reciclagem");
  const [destinationCompanyName, setDestinationCompanyName] = useState("");
  const [transportDate, setTransportDate] = useState<Date | undefined>(undefined);

  const handleSubmit = async () => {
    if (!user) return;
    if (!wasteClass.trim()) { toast.error("Informe a classe do resíduo."); return; }
    const qty = parseNumericInput(quantity);
    if (qty === null) { toast.error("Quantidade inválida."); return; }

    setSaving(true);
    try {
      const { error } = await supabase.from("waste_manifests").insert({
        user_id: user.id,
        waste_class: wasteClass,
        weight_kg: qty,
        unit,
        transporter_name: settings.razaoSocial || "Não informado",
        destination_type: destinationType,
        destination_company_name: destinationCompanyName || null,
        status: "enviado",
        origin: "descarte",
        transport_date: transportDate ? format(transportDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      } as any);

      if (error) throw error;

      toast.success("Descarte registrado! O link de rastreio está disponível no Mapa. 🚛");
      onSuccess();
      resetAndClose();
    } catch (err: any) {
      console.error("Erro ao registrar descarte:", err);
      toast.error(err.message || "Erro ao registrar descarte.");
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setWasteClass("");
    setQuantity("");
    setUnit("kg");
    setDestinationType("Reciclagem");
    setDestinationCompanyName("");
    setTransportDate(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Registrar Descarte
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Classe do Resíduo</Label>
            <Input
              className="mt-1.5"
              placeholder="Ex: Classe II A - Não Inerte"
              value={wasteClass}
              onChange={(e) => setWasteClass(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-sm font-medium text-muted-foreground">Quantidade</Label>
              <Input
                className="mt-1.5"
                placeholder="Ex: 500"
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="w-24">
              <Label className="text-sm font-medium text-muted-foreground">Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="m²">m²</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Destinação Final</Label>
            <Select value={destinationType} onValueChange={setDestinationType}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reciclagem">Reciclagem</SelectItem>
                <SelectItem value="Aterro">Aterro</SelectItem>
                <SelectItem value="Coprocessamento">Coprocessamento</SelectItem>
                <SelectItem value="Incineração">Incineração</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Empresa Destinadora (opcional)</Label>
            <Input
              className="mt-1.5"
              placeholder="Nome da empresa"
              value={destinationCompanyName}
              onChange={(e) => setDestinationCompanyName(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Data do Transporte</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full mt-1.5 justify-start text-left font-normal", !transportDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {transportDate ? format(transportDate, "dd/MM/yyyy", { locale: ptBR }) : "Hoje"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={transportDate} onSelect={setTransportDate} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving} className="gradient-primary gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            {saving ? "Registrando..." : "Registrar Descarte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
