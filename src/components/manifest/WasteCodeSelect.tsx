import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

type WasteCode = {
  id: string;
  code: string;
  description: string;
  class: string;
  requires_special_transport: boolean;
};

interface WasteCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  onWasteCodeChange: (wasteCode: WasteCode | null) => void;
}

const WasteCodeSelect = ({ value, onValueChange, onWasteCodeChange }: WasteCodeSelectProps) => {
  const [wasteCodes, setWasteCodes] = useState<WasteCode[]>([]);
  const [selectedCode, setSelectedCode] = useState<WasteCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      const { data, error } = await supabase
        .from("waste_codes_ibama")
        .select("*")
        .order("code");

      if (!error && data) {
        setWasteCodes(data);
      }
      setLoading(false);
    };
    fetchCodes();
  }, []);

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
