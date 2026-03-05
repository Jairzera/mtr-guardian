import { CalendarIcon, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import WasteCodeSelect from "@/components/manifest/WasteCodeSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatCNPJ } from "@/lib/cnpj";
import { WasteCode } from "@/hooks/useWasteCodes";

export interface ManifestFormData {
  wasteClass: string;
  quantity: string;
  unit: string;
  transporterName: string;
  transporterCnpj: string;
  destinationType: string;
  physicalState: string;
  packaging: string;
  destinationCompanyName: string;
  destinationCnpj: string;
  destinationLicense: string;
  driverName: string;
  vehiclePlate: string;
  transportDate: string;
  destinationCost: string;
}

export interface ReviewFormSectionExtraProps {
  cdfFile: File | null;
  onCdfFileChange: (file: File | null) => void;
}

interface ReviewFormSectionProps extends ReviewFormSectionExtraProps {
  photoUrl: string | null;
  selectedWasteCodeId: string;
  onWasteCodeChange: (id: string) => void;
  onAiSuggestionClear: () => void;
  wasteCodes: WasteCode[];
  codesLoading: boolean;
  aiSuggested: boolean;
  formData: ManifestFormData;
  onFormDataChange: (data: ManifestFormData) => void;
  expirationDate: Date | undefined;
  onExpirationDateChange: (date: Date | undefined) => void;
  transportDateValue: Date | undefined;
  onTransportDateChange: (date: Date | undefined) => void;
  saving: boolean;
  onConfirm: () => void;
}

const PHYSICAL_STATES = ["Sólido", "Líquido", "Pastoso", "Gasoso", "Lodo"];
const PACKAGING_OPTIONS = ["Tambor", "Bombona", "Big Bag", "Caçamba", "Granel", "Fardo", "Caixa"];

export default function ReviewFormSection({
  photoUrl,
  selectedWasteCodeId,
  onWasteCodeChange,
  onAiSuggestionClear,
  wasteCodes,
  codesLoading,
  aiSuggested,
  formData,
  onFormDataChange,
  expirationDate,
  onExpirationDateChange,
  transportDateValue,
  onTransportDateChange,
  saving,
  onConfirm,
  cdfFile,
  onCdfFileChange,
}: ReviewFormSectionProps) {
  const update = (partial: Partial<ManifestFormData>) => {
    onFormDataChange({ ...formData, ...partial });
  };

  return (
    <Card className="p-6 shadow-card border-border/60 space-y-6">
      <div className="flex items-center gap-2 text-primary mb-2">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-semibold">Dados extraídos com sucesso</span>
      </div>

      {photoUrl && (
        <div className="mb-4">
          <Label className="text-sm font-medium text-muted-foreground">Foto capturada</Label>
          <img src={photoUrl} alt="Foto do MTR" className="mt-1.5 w-24 h-24 object-cover rounded-lg border border-border" />
        </div>
      )}

      {/* === SEÇÃO: Dados do Resíduo === */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-1">Dados do Resíduo</h3>

        <WasteCodeSelect
          value={selectedWasteCodeId}
          onValueChange={(id) => {
            onWasteCodeChange(id);
            onAiSuggestionClear();
          }}
          onWasteCodeChange={(wc) => {
            if (wc) update({ wasteClass: wc.class });
          }}
          wasteCodes={wasteCodes}
          loading={codesLoading}
          aiSuggested={aiSuggested}
        />

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Quantidade</Label>
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1 relative">
              <Input
                className="pr-24"
                placeholder="Ex: 500"
                inputMode="decimal"
                value={formData.quantity}
                onChange={(e) => update({ quantity: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary font-medium gap-1"
                onClick={() => {
                  toast.info("⚖️ Conectando à balança...");
                  setTimeout(() => {
                    const simWeight = (Math.random() * 20000 + 500).toFixed(0);
                    update({ quantity: simWeight });
                    toast.success(`⚖️ Leitura: ${Number(simWeight).toLocaleString("pt-BR")} kg`);
                  }, 1500);
                }}
              >
                ⚖️ Ler Balança
              </Button>
            </div>
            <Select value={formData.unit} onValueChange={(v) => update({ unit: v })}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="L">Litros (L)</SelectItem>
                <SelectItem value="m²">m²</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Estado Físico</Label>
            <Select value={formData.physicalState} onValueChange={(v) => update({ physicalState: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PHYSICAL_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Acondicionamento</Label>
            <Select value={formData.packaging} onValueChange={(v) => update({ packaging: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGING_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Vencimento da Licença Ambiental</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full mt-1.5 justify-start text-left font-normal", !expirationDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expirationDate ? format(expirationDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data de vencimento"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={expirationDate} onSelect={onExpirationDateChange} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Destinação Final</Label>
          <Select value={formData.destinationType} onValueChange={(v) => update({ destinationType: v })}>
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
          <Label className="text-sm font-medium text-muted-foreground">Custo de Destinação (R$) <span className="text-xs">(opcional)</span></Label>
          <Input
            className="mt-1.5"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.destinationCost}
            onChange={(e) => update({ destinationCost: e.target.value })}
          />
        </div>
      </div>

      {/* === SEÇÃO: Transportadora === */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-1">Transportadora</h3>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Nome da Transportadora</Label>
          <Input className="mt-1.5" value={formData.transporterName} onChange={(e) => update({ transporterName: e.target.value })} />
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">CNPJ da Transportadora</Label>
          <Input
            className="mt-1.5"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            value={formData.transporterCnpj}
            onChange={(e) => update({ transporterCnpj: formatCNPJ(e.target.value) })}
          />
        </div>
      </div>

      {/* === SEÇÃO: Destinador Final === */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-1">Destinador Final</h3>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Nome do Destinador</Label>
          <Input
            className="mt-1.5"
            placeholder="Razão social do destinador"
            value={formData.destinationCompanyName}
            onChange={(e) => update({ destinationCompanyName: e.target.value })}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">CNPJ do Destinador</Label>
          <Input
            className="mt-1.5"
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            value={formData.destinationCnpj}
            onChange={(e) => update({ destinationCnpj: formatCNPJ(e.target.value) })}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Nº Licença Ambiental (LA)</Label>
          <Input
            className="mt-1.5"
            placeholder="Ex: LA-001234/2025"
            value={formData.destinationLicense}
            onChange={(e) => update({ destinationLicense: e.target.value })}
          />
        </div>
      </div>

      {/* === SEÇÃO: Logística de Transporte === */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-1">
          Logística de Transporte <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Nome do Motorista</Label>
            <Input className="mt-1.5" placeholder="Nome completo" value={formData.driverName} onChange={(e) => update({ driverName: e.target.value })} />
          </div>
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Placa do Veículo</Label>
            <Input className="mt-1.5" placeholder="ABC-1D23" value={formData.vehiclePlate} onChange={(e) => update({ vehiclePlate: e.target.value.toUpperCase() })} />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Data do Transporte</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full mt-1.5 justify-start text-left font-normal", !transportDateValue && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {transportDateValue ? format(transportDateValue, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={transportDateValue} onSelect={onTransportDateChange} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
      </div>

      {/* === SEÇÃO: CDF (Certificado de Destinação Final) === */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground border-b border-border/40 pb-1">
          CDF – Certificado de Destinação Final
        </h3>
        <p className="text-xs text-muted-foreground">
          Anexe o PDF do CDF para que o MTR seja registrado como <strong>Enviado</strong>. Sem o CDF, o status ficará como <strong>Pendente</strong>.
        </p>
        <div>
          <Label htmlFor="cdf-upload" className="text-sm font-medium text-muted-foreground">Arquivo CDF (PDF ou imagem)</Label>
          <Input
            id="cdf-upload"
            type="file"
            accept="image/*,.pdf"
            className="mt-1.5 file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:text-primary"
            onChange={(e) => onCdfFileChange(e.target.files?.[0] || null)}
          />
          {cdfFile && (
            <p className="text-xs text-muted-foreground mt-1 truncate">📎 {cdfFile.name}</p>
          )}
        </div>
      </div>
      </div>

      <Button onClick={onConfirm} disabled={saving} className="w-full h-14 text-base font-semibold gradient-primary shadow-primary gap-2">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
        {saving ? "Salvando..." : "Confirmar e Gerar Comprovante"}
      </Button>
    </Card>
  );
}
