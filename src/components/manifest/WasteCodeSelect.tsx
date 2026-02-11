import { useState, useEffect } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { type WasteCode } from "@/hooks/useWasteCodes";

interface WasteCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onWasteCodeChange: (wasteCode: WasteCode | null) => void;
  wasteCodes: WasteCode[];
  loading?: boolean;
  aiSuggested?: boolean;
}

const WasteCodeSelect = ({
  value,
  onValueChange,
  onWasteCodeChange,
  wasteCodes,
  loading = false,
  aiSuggested = false,
}: WasteCodeSelectProps) => {
  const [selectedCode, setSelectedCode] = useState<WasteCode | null>(null);

  // Sync selectedCode when value changes externally (e.g. from AI)
  useEffect(() => {
    if (value && wasteCodes.length > 0) {
      const found = wasteCodes.find((wc) => wc.id === value) ?? null;
      if (found && found.id !== selectedCode?.id) {
        setSelectedCode(found);
        onWasteCodeChange(found);
      }
    }
  }, [value, wasteCodes]);

  const handleChange = (codeId: string) => {
    const found = wasteCodes.find((wc) => wc.id === codeId) ?? null;
    setSelectedCode(found);
    onValueChange(codeId);
    onWasteCodeChange(found);
  };

  const isDangerous = selectedCode?.class?.includes("Perigoso");

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">Tipo de Resíduo (IBAMA)</Label>
      {aiSuggested && value && (
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Sugerido pela IA — você pode alterar
        </div>
      )}
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder={loading ? "Carregando códigos…" : "Selecione o resíduo"} />
        </SelectTrigger>
        <SelectContent>
          {wasteCodes.map((wc) => (
            <SelectItem key={wc.id} value={wc.id}>
              {wc.code} — {wc.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isDangerous && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2 text-sm font-medium">
            ⚠️ Atenção: Este resíduo exige transporte com licença especial (MOPP).
          </AlertDescription>
        </Alert>
      )}

      {selectedCode && (
        <p className="text-xs text-muted-foreground">
          Classificação: {selectedCode.class}
        </p>
      )}
    </div>
  );
};

export default WasteCodeSelect;
