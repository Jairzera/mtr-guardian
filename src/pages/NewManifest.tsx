import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Upload, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWasteCodes } from "@/hooks/useWasteCodes";
import { useManifestDraft } from "@/hooks/useManifestDraft";
import { formatCNPJ } from "@/lib/cnpj";

const steps = ["Captura", "Análise IA", "Conferência", "Conclusão"];

const NewManifest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useCompanySettings();
  const { wasteCodes, loading: codesLoading } = useWasteCodes();
  const { saveDraft, loadDraft, clearDraft } = useManifestDraft();
  const draftLoaded = useRef(false);
  const [step, setStep] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedWasteCodeId, setSelectedWasteCodeId] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    wasteClass: "",
    quantity: "",
    unit: "kg",
    transporterName: "",
    transporterCnpj: "",
    destinationType: "Reciclagem",
  });

  // Restore draft on mount
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step >= 2 ? 2 : draft.step === 0 ? 0 : 2);
      setPhotoUrl(draft.photoUrl);
      setSelectedWasteCodeId(draft.selectedWasteCodeId);
      setAiSuggested(draft.aiSuggested);
      setFormData(draft.formData);
      if (draft.expirationDate) {
        setExpirationDate(new Date(draft.expirationDate));
      }
    }
  }, [loadDraft]);

  // Save draft on unmount
  useEffect(() => {
    return () => {
      if (step === 3) return;
      saveDraft({
        step,
        photoUrl,
        selectedWasteCodeId,
        aiSuggested,
        formData,
        expirationDate: expirationDate?.toISOString() ?? null,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, photoUrl, selectedWasteCodeId, aiSuggested, formData, expirationDate]);

  // Pre-fill from company settings
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      transporterName: prev.transporterName || settings.razaoSocial,
      transporterCnpj: prev.transporterCnpj || formatCNPJ(settings.cnpj),
    }));
  }, [settings]);

  const analyzeWithAI = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const imageBase64 = btoa(binary);

      if (wasteCodes.length === 0) return null;

      const codeList = wasteCodes.map((wc) => ({
        id: wc.id,
        code: wc.code,
        description: wc.description,
      }));

      const { data, error } = await supabase.functions.invoke("analyze-waste", {
        body: { imageBase64, wasteCodes: codeList },
      });

      if (error) {
        console.error("AI analysis error:", error);
        return null;
      }

      return data as { waste_code_id: string | null; confidence: string; quantity?: number | null; unit?: string };
    } catch (err) {
      console.error("AI analysis failed:", err);
      return null;
    }
  }, [wasteCodes]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      setStep(1);
      setAiProgress(0);

      let progress = 0;
      let progressDone = false;
      let aiResult: { waste_code_id: string | null; confidence: string; quantity?: number | null; unit?: string } | null = null;
      let aiDone = false;

      const tryAdvance = () => {
        if (progressDone && aiDone) {
          if (aiResult?.waste_code_id) {
            setSelectedWasteCodeId(aiResult.waste_code_id);
            setAiSuggested(true);
            const wc = wasteCodes.find((w) => w.id === aiResult!.waste_code_id);
            if (wc) {
              setFormData((prev) => ({
                ...prev,
                wasteClass: wc.class,
                quantity: aiResult!.quantity ? String(aiResult!.quantity) : prev.quantity,
                unit: aiResult!.unit && ["kg", "L", "m²"].includes(aiResult!.unit) ? aiResult!.unit : prev.unit,
              }));
            }
          }
          setTimeout(() => setStep(2), 400);
        }
      };

      const interval = setInterval(() => {
        progress += 10;
        setAiProgress(Math.min(progress, 95));
        if (progress >= 95) {
          clearInterval(interval);
          progressDone = true;
          tryAdvance();
        }
      }, 400);

      analyzeWithAI(file).then((result) => {
        aiResult = result;
        aiDone = true;
        if (progressDone) {
          setAiProgress(100);
          tryAdvance();
        } else {
          clearInterval(interval);
          setAiProgress(100);
          progressDone = true;
          tryAdvance();
        }
      });
    },
    [analyzeWithAI, wasteCodes]
  );

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para registrar um MTR.");
      return;
    }

    if (!expirationDate) {
      toast.error("Informe a data de vencimento da licença ambiental.");
      return;
    }

    setSaving(true);

    try {
      let uploadedPhotoUrl: string | null = null;

      if (photoFile) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}_${photoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("mtr_documents")
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("mtr_documents")
          .getPublicUrl(filePath);

        uploadedPhotoUrl = publicUrlData.publicUrl;
      }

      const quantityNum = parseFloat(formData.quantity.replace(/\./g, "").replace(",", "."));

      const { error: insertError } = await supabase.from("waste_manifests").insert({
        user_id: user.id,
        waste_class: formData.wasteClass || "Não classificado",
        weight_kg: isNaN(quantityNum) ? 0 : quantityNum,
        unit: formData.unit,
        transporter_name: formData.transporterName,
        destination_type: formData.destinationType,
        photo_url: uploadedPhotoUrl,
        status: "pendente",
        expiration_date: format(expirationDate, "yyyy-MM-dd"),
      });

      if (insertError) throw insertError;

      setStep(3);
      clearDraft();
      toast.success("Manifesto registrado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao salvar MTR:", err);
      toast.error(err.message || "Erro ao salvar o manifesto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Novo Manifesto</h1>
          <p className="text-sm text-muted-foreground">Passo {step + 1} de {steps.length}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 0: Photo capture */}
      {step === 0 && (
        <Card className="p-6 shadow-card border-border/60">
          <label
            htmlFor="photo-upload"
            className="w-full aspect-[4/3] border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center gap-4 bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-primary">
              <Camera className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Fotografar MTR</p>
              <p className="text-sm text-muted-foreground mt-1">Toque para capturar ou fazer upload</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Upload className="w-4 h-4" />
              Selecionar arquivo
            </div>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>
      )}

      {/* Step 1: AI Analysis */}
      {step === 1 && (
        <Card className="p-8 shadow-card border-border/60 text-center space-y-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-primary animate-pulse">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {aiProgress < 40
                ? "IA Analisando Documento..."
                : aiProgress < 80
                ? "Identificando Tipo de Resíduo..."
                : "Validando Leis Ambientais..."}
            </p>
            <p className="text-sm text-muted-foreground">Extraindo dados do manifesto</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${aiProgress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Step 2: Review form */}
      {step === 2 && (
        <Card className="p-6 shadow-card border-border/60 space-y-5">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Dados extraídos com sucesso</span>
          </div>

          {photoUrl && (
            <div className="mb-4">
              <Label className="text-sm font-medium text-muted-foreground">Foto capturada</Label>
              <img
                src={photoUrl}
                alt="Foto do MTR"
                className="mt-1.5 w-24 h-24 object-cover rounded-lg border border-border"
              />
            </div>
          )}

          <div className="space-y-4">
            <WasteCodeSelect
              value={selectedWasteCodeId}
              onValueChange={(id) => {
                setSelectedWasteCodeId(id);
                setAiSuggested(false);
              }}
              onWasteCodeChange={(wc) => {
                if (wc) setFormData({ ...formData, wasteClass: wc.class });
              }}
              wasteCodes={wasteCodes}
              loading={codesLoading}
              aiSuggested={aiSuggested}
            />

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Quantidade</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  className="flex-1"
                  placeholder="Ex: 500"
                  inputMode="decimal"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                <Select
                  value={formData.unit}
                  onValueChange={(v) => setFormData({ ...formData, unit: v })}
                >
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

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Vencimento da Licença Ambiental</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-1.5 justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate
                      ? format(expirationDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione a data de vencimento"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Transportadora (Nome)</Label>
              <Input
                className="mt-1.5"
                value={formData.transporterName}
                onChange={(e) => setFormData({ ...formData, transporterName: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">CNPJ da Transportadora</Label>
              <Input
                className="mt-1.5"
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                value={formData.transporterCnpj}
                onChange={(e) => setFormData({ ...formData, transporterCnpj: formatCNPJ(e.target.value) })}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Destinação Final</Label>
              <Select
                value={formData.destinationType}
                onValueChange={(v) => setFormData({ ...formData, destinationType: v })}
              >
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
          </div>

          <Button
            onClick={handleConfirm}
            disabled={saving}
            className="w-full h-14 text-base font-semibold gradient-primary shadow-primary gap-2"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {saving ? "Salvando..." : "Confirmar e Gerar Comprovante"}
          </Button>
        </Card>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <Card className="p-8 shadow-card border-border/60 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground">Manifesto Registrado!</p>
            <p className="text-sm text-muted-foreground">
              O comprovante foi gerado e está disponível na lista de MTRs.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/mtrs")} className="gradient-primary shadow-primary font-semibold gap-2">
              <ArrowRight className="w-4 h-4" />
              Ver Meus MTRs
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep(0);
                setPhotoUrl(null);
                setPhotoFile(null);
                setAiProgress(0);
                setAiSuggested(false);
                setSelectedWasteCodeId("");
                setExpirationDate(undefined);
                clearDraft();
              }}
            >
              Registrar Outro
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NewManifest;
