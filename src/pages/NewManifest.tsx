import { useState, useCallback } from "react";
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

const steps = ["Captura", "Análise IA", "Conferência", "Conclusão"];

const NewManifest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [selectedWasteCodeId, setSelectedWasteCodeId] = useState("");
  const [formData, setFormData] = useState({
    wasteClass: "",
    weightKg: "1.250",
    transporterName: "TransLog Ambiental LTDA",
    transporterCnpj: "12.345.678/0001-90",
    destinationType: "Reciclagem",
  });

  const handlePhotoUpload = useCallback(() => {
    setPhoto("uploaded");
    setStep(1);

    // Simulate AI analysis
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAiProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep(2), 500);
      }
    }, 500);
  }, []);

  const handleConfirm = () => {
    setStep(3);
    toast.success("Manifesto registrado com sucesso!");
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
          <button
            onClick={handlePhotoUpload}
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
          </button>
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
              {aiProgress < 60 ? "IA Analisando Documento..." : "Validando Leis Ambientais..."}
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

          <div className="space-y-4">
            <WasteCodeSelect
              value={selectedWasteCodeId}
              onValueChange={setSelectedWasteCodeId}
              onWasteCodeChange={(wc) => {
                if (wc) setFormData({ ...formData, wasteClass: wc.class });
              }}
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
            className="w-full h-14 text-base font-semibold gradient-primary shadow-primary gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmar e Gerar Comprovante
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
            <Button variant="outline" onClick={() => { setStep(0); setPhoto(null); setAiProgress(0); }}>
              Registrar Outro
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NewManifest;
