import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseNumericInput } from "@/lib/validation";

interface CloseoutModalProps {
  manifestId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CloseoutModal = ({ manifestId, onClose, onSuccess }: CloseoutModalProps) => {
  const { user } = useAuth();
  const [receivedDate, setReceivedDate] = useState("");
  const [receivedWeight, setReceivedWeight] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!manifestId || !user) return;

    if (!receivedDate || !receivedWeight || !file) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    const parsedWeight = parseNumericInput(receivedWeight);
    if (parsedWeight === null) {
      toast.error("Peso inválido. Informe um valor entre 0 e 1.000.000.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload file to cdf-files bucket
      const ext = file.name.split(".").pop() || "bin";
      const filePath = `${user.id}/${manifestId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("cdf-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get signed URL (24h)
      const { data: urlData, error: urlError } = await supabase.storage
        .from("cdf-files")
        .createSignedUrl(filePath, 86400);

      if (urlError) throw urlError;

      // 3. Create certificate record
      const { error: certError } = await supabase.from("certificates").insert({
        manifest_id: manifestId,
        user_id: user.id,
        file_url: filePath,
        received_date: receivedDate,
        received_weight: parsedWeight,
      } as any);

      if (certError) throw certError;

      // 4. Update manifest status to completed
      const { error: updateError } = await supabase
        .from("waste_manifests")
        .update({ status: "completed", received_weight: parsedWeight } as any)
        .eq("id", manifestId);

      if (updateError) throw updateError;

      toast.success("Ciclo encerrado com sucesso! O comprovante está salvo na sua galeria. ✅");
      onSuccess();
    } catch (err: any) {
      toast.error("Erro ao encerrar o ciclo: " + (err.message || "Tente novamente."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!manifestId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Recebimento da Carga</DialogTitle>
          <DialogDescription>
            O Destinador assinou o MTR físico? Anexe a foto ou PDF aqui para encerrar o ciclo e manter o compliance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="received-date">Data do Recebimento *</Label>
            <Input
              id="received-date"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="received-weight">Peso Final (Kg) *</Label>
            <Input
              id="received-weight"
              placeholder="Ex: 1.250,00"
              value={receivedWeight}
              onChange={(e) => setReceivedWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof-file">Comprovante (foto ou PDF) *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="proof-file"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:text-primary"
              />
            </div>
            {file && (
              <p className="text-xs text-muted-foreground truncate">{file.name}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="min-h-[44px] gap-2">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {submitting ? "Salvando..." : "Encerrar Ciclo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseoutModal;
