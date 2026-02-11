import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Upload } from "lucide-react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWasteCodes } from "@/hooks/useWasteCodes";

const steps = ["Captura", "Análise IA", "Conferência", "Conclusão"];

const NewManifest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useCompanySettings();
  const { wasteCodes, loading: codesLoading } = useWasteCodes();
  const [step, setStep] = useState(0);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiSuggested, setAiSuggested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedWasteCodeId, setSelectedWasteCodeId] = useState("");
  const [formData, setFormData] = useState({
    wasteClass: "",
    weightKg: "",
    transporterName: "",
    transporterCnpj: "",
    destinationType: "Reciclagem",
  });

  // Pre-fill from company settings
  useEffect(() => {
    if (settings.razaoSocial) {
      setFormData((prev) => ({
        ...prev,
        transporterName: prev.transporterName || settings.razaoSocial,
      }));
    }
  }, [settings]);

  const analyzeWithAI = useCallback(async (file: File) => {
    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const imageBase64 = btoa(binary);

      // Wait for waste codes to be loaded
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

      return data as { waste_code_id: string | null; confidence: string };
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

      // Start progress animation + real AI call in parallel
      let progress = 0;
      let progressDone = false;
      let aiResult: { waste_code_id: string | null; confidence: string } | null = null;
      let aiDone = false;

      const tryAdvance = () => {
        if (progressDone && aiDone) {
          // Apply AI result
          if (aiResult?.waste_code_id) {
            setSelectedWasteCodeId(aiResult.waste_code_id);
            setAiSuggested(true);
            const wc = wasteCodes.find((w) => w.id === aiResult!.waste_code_id);
            if (wc) {
              setFormData((prev) => ({ ...prev, wasteClass: wc.class }));
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
        // If progress bar is already done, advance
        if (progressDone) {
          setAiProgress(100);
          tryAdvance();
        } else {
          // Speed up progress bar
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

      const weightNum = parseFloat(formData.weightKg.replace(/\./g, "").replace(",", "."));

      const { error: insertError } = await supabase.from("waste_manifests").insert({
        user_id: user.id,
        waste_class: formData.wasteClass || "Não classificado",
        weight_kg: isNaN(weightNum) ? 0 : weightNum,
        transporter_name: formData.transporterName,
        destination_type: formData.destinationType,
        photo_url: uploadedPhotoUrl,
        status: "pendente",
      });

      if (insertError) throw insertError;

      setStep(3);
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
                setAiSuggested(false); // user overrode AI
              }}
              onWasteCodeChange={(wc) => {
                if (wc) setFormData({ ...formData, wasteClass: wc.class });
              }}
              wasteCodes={wasteCodes}
              loading={codesLoading}
              aiSuggested={aiSuggested}
            />

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Peso Total (kg)</Label>
              <Input
                className="mt-1.5"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
              />
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
                value={formData.transporterCnpj}
                onChange={(e) => setFormData({ ...formData, transporterCnpj: e.target.value })}
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
