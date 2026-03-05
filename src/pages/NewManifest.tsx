import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useWasteCodes } from "@/hooks/useWasteCodes";
import { useManifestDraft } from "@/hooks/useManifestDraft";
import { sinirSalvarManifestoLote, sinirDownloadManifesto } from "@/hooks/useSinirLists";
import { formatCNPJ } from "@/lib/cnpj";
import { parseNumericInput } from "@/lib/validation";
import ReviewFormSection, { ManifestFormData } from "@/components/manifest/ReviewFormSection";
import MtrPreviewModal from "@/components/manifest/MtrPreviewModal";

const steps = ["Captura", "Análise IA", "Conferência", "Conclusão"];

const defaultFormData: ManifestFormData = {
  wasteClass: "",
  quantity: "",
  unit: "kg",
  transporterName: "",
  transporterCnpj: "",
  destinationType: "Reciclagem",
  physicalState: "",
  packaging: "",
  destinationCompanyName: "",
  destinationCnpj: "",
  destinationLicense: "",
  driverName: "",
  vehiclePlate: "",
  transportDate: "",
  destinationCost: "",
};

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
  const [transportDate, setTransportDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<ManifestFormData>(defaultFormData);
  const [cdfFile, setCdfFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
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
      setFormData({ ...defaultFormData, ...draft.formData });
      if (draft.expirationDate) setExpirationDate(new Date(draft.expirationDate));
      if (draft.formData.transportDate) setTransportDate(new Date(draft.formData.transportDate));
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
        formData: {
          ...formData,
          transportDate: transportDate?.toISOString() ?? "",
        },
        expirationDate: expirationDate?.toISOString() ?? null,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, photoUrl, selectedWasteCodeId, aiSuggested, formData, expirationDate, transportDate]);

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
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const imageBase64 = btoa(binary);
      if (wasteCodes.length === 0) return null;
      const codeList = wasteCodes.map((wc) => ({ id: wc.id, code: wc.code, description: wc.description }));
      const { data, error } = await supabase.functions.invoke("analyze-waste", { body: { imageBase64, wasteCodes: codeList } });
      if (error) { console.error("AI analysis error:", error); return null; }
      return data as { waste_code_id: string | null; confidence: string; quantity?: number | null; unit?: string };
    } catch (err) { console.error("AI analysis failed:", err); return null; }
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
        if (progress >= 95) { clearInterval(interval); progressDone = true; tryAdvance(); }
      }, 400);

      analyzeWithAI(file).then((result) => {
        aiResult = result;
        aiDone = true;
        if (progressDone) { setAiProgress(100); tryAdvance(); }
        else { clearInterval(interval); setAiProgress(100); progressDone = true; tryAdvance(); }
      });
    },
    [analyzeWithAI, wasteCodes]
  );

  const handleShowPreview = () => {
    if (!expirationDate) { toast.error("Informe a data de vencimento da licença ambiental."); return; }
    if (!formData.destinationLicense) { toast.error("Informe o Nº da Licença Ambiental do Destinador."); return; }
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    if (!user) { toast.error("Você precisa estar logado para registrar um MTR."); return; }
    if (!expirationDate) { toast.error("Informe a data de vencimento da licença ambiental."); return; }
    if (!formData.destinationLicense) { toast.error("Informe o Nº da Licença Ambiental do Destinador."); return; }
    setShowPreview(false);

    setSaving(true);
    try {
      let uploadedPhotoUrl: string | null = null;
      if (photoFile) {
        const timestamp = Date.now();
        const filePath = `${user.id}/${timestamp}_${photoFile.name}`;
        const { error: uploadError } = await supabase.storage.from("mtr_documents").upload(filePath, photoFile);
        if (uploadError) throw uploadError;
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from("mtr_documents").createSignedUrl(filePath, 86400);
        if (signedUrlError) throw signedUrlError;
        uploadedPhotoUrl = signedUrlData.signedUrl;
      }

      const quantityNum = parseNumericInput(formData.quantity);
      if (quantityNum === null) {
        toast.error("Quantidade inválida. Informe um valor entre 0 e 1.000.000.");
        setSaving(false);
        return;
      }

      // Determine status based on CDF upload
      const hasCdf = !!cdfFile;
      const initialStatus = hasCdf ? "enviado" : "pendente";

      // 1. Try to emit MTR via SINIR
      let mtrNumber: string | null = null;
      let pdfUrl: string | null = null;
      let sinirEmitted = false;

      try {
        const sinirPayload = {
          manQtde: quantityNum,
          manUnidade: formData.unit,
          resCodigo: formData.wasteClass,
          parCnpjDestinador: formData.destinationCnpj?.replace(/\D/g, "") || "",
          manTratamento: formData.destinationType,
          estadoFisico: formData.physicalState || "",
          acondicionamento: formData.packaging || "",
          motorista: formData.driverName || "",
          placa: formData.vehiclePlate || "",
          dataTransporte: transportDate ? format(transportDate, "yyyy-MM-dd") : "",
        };

        const sinirResult = await sinirSalvarManifestoLote(sinirPayload);
        
        if (sinirResult?.manNumero) {
          mtrNumber = sinirResult.manNumero;
          sinirEmitted = true;
          toast.success(`MTR ${mtrNumber} emitido no SINIR! ✅`);

          // Try to download the PDF
          try {
            const pdfResult = await sinirDownloadManifesto({ manNumero: mtrNumber });
            if (pdfResult?.pdf_base64) {
              // Convert base64 to blob and upload to storage
              const pdfBlob = Uint8Array.from(atob(pdfResult.pdf_base64), c => c.charCodeAt(0));
              const pdfPath = `sinir-pdfs/${user.id}/${mtrNumber}.pdf`;
              await supabase.storage.from("mtr_documents").upload(pdfPath, pdfBlob, {
                contentType: "application/pdf",
                upsert: true,
              });
              const { data: signedUrl } = await supabase.storage.from("mtr_documents").createSignedUrl(pdfPath, 365 * 24 * 60 * 60);
              pdfUrl = signedUrl?.signedUrl || null;
            }
          } catch (pdfErr) {
            console.warn("PDF download failed, will retry via sync:", pdfErr);
          }
        }
      } catch (sinirErr: any) {
        console.warn("SINIR emission failed, saving locally:", sinirErr);
        toast.warning("MTR salvo localmente. Emissão SINIR será tentada depois.");
      }

      const { data: insertedManifest, error: insertError } = await supabase.from("waste_manifests").insert({
        user_id: user.id,
        waste_class: formData.wasteClass || "Não classificado",
        weight_kg: quantityNum,
        unit: formData.unit,
        transporter_name: formData.transporterName,
        destination_type: formData.destinationType,
        photo_url: uploadedPhotoUrl,
        status: sinirEmitted ? "enviado" : initialStatus,
        expiration_date: format(expirationDate, "yyyy-MM-dd"),
        physical_state: formData.physicalState || null,
        packaging: formData.packaging || null,
        destination_company_name: formData.destinationCompanyName || null,
        destination_cnpj: formData.destinationCnpj || null,
        destination_license: formData.destinationLicense || null,
        driver_name: formData.driverName || null,
        vehicle_plate: formData.vehiclePlate || null,
        transport_date: transportDate ? format(transportDate, "yyyy-MM-dd") : null,
        origin: "ciclomtr",
        mtr_number: mtrNumber,
        pdf_url: pdfUrl,
        destination_cost: formData.destinationCost ? Number(formData.destinationCost) : null,
      } as any).select("id").single();

      if (insertError) throw insertError;

      // If CDF uploaded, store it
      if (hasCdf && insertedManifest) {
        const ext = cdfFile!.name.split(".").pop() || "bin";
        const cdfPath = `${user.id}/${insertedManifest.id}.${ext}`;
        await supabase.storage.from("cdf-files").upload(cdfPath, cdfFile!, { upsert: true });
        await supabase.from("certificates").insert({
          manifest_id: insertedManifest.id,
          user_id: user.id,
          file_url: cdfPath,
          received_date: format(new Date(), "yyyy-MM-dd"),
          received_weight: quantityNum,
        } as any);
      }

      setStep(3);
      clearDraft();
      toast.success(sinirEmitted
        ? `MTR ${mtrNumber} emitido e registrado com sucesso! 🎉`
        : hasCdf
          ? "MTR registrado como Enviado com CDF anexado! ✅"
          : "Manifesto registrado como Pendente."
      );
    } catch (err: any) {
      console.error("Erro ao salvar MTR:", err);
      toast.error(err.message || "Erro ao salvar o manifesto.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setPhotoUrl(null);
    setPhotoFile(null);
    setAiProgress(0);
    setAiSuggested(false);
    setSelectedWasteCodeId("");
    setExpirationDate(undefined);
    setTransportDate(undefined);
    setFormData(defaultFormData);
    setCdfFile(null);
    clearDraft();
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

      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {step === 0 && (
        <Card className="p-6 shadow-card border-border/60">
          <label htmlFor="photo-upload" className="w-full aspect-[4/3] border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center gap-4 bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer">
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
          <input id="photo-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </Card>
      )}

      {step === 1 && (
        <Card className="p-8 shadow-card border-border/60 text-center space-y-6">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-primary animate-pulse">
            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {aiProgress < 40 ? "IA Analisando Documento..." : aiProgress < 80 ? "Identificando Tipo de Resíduo..." : "Validando Leis Ambientais..."}
            </p>
            <p className="text-sm text-muted-foreground">Extraindo dados do manifesto</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full gradient-primary transition-all duration-500" style={{ width: `${aiProgress}%` }} />
          </div>
        </Card>
      )}

      {step === 2 && (
        <ReviewFormSection
          photoUrl={photoUrl}
          selectedWasteCodeId={selectedWasteCodeId}
          onWasteCodeChange={setSelectedWasteCodeId}
          onAiSuggestionClear={() => setAiSuggested(false)}
          wasteCodes={wasteCodes}
          codesLoading={codesLoading}
          aiSuggested={aiSuggested}
          formData={formData}
          onFormDataChange={setFormData}
          expirationDate={expirationDate}
          onExpirationDateChange={setExpirationDate}
          transportDateValue={transportDate}
          onTransportDateChange={setTransportDate}
          saving={saving}
          onConfirm={handleShowPreview}
          cdfFile={cdfFile}
          onCdfFileChange={setCdfFile}
        />
      )}

      {step === 3 && (
        <Card className="p-8 shadow-card border-border/60 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground">Manifesto Registrado!</p>
            <p className="text-sm text-muted-foreground">O comprovante foi gerado e está disponível na lista de MTRs.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/mtrs")} className="gradient-primary shadow-primary font-semibold gap-2">
              <ArrowRight className="w-4 h-4" />
              Ver Meus MTRs
            </Button>
            <Button variant="outline" onClick={resetForm}>Registrar Outro</Button>
          </div>
        </Card>
      )}

      {/* MTR Preview Modal */}
      <MtrPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirm}
        saving={saving}
        data={{
          wasteClass: formData.wasteClass,
          quantity: formData.quantity,
          unit: formData.unit,
          transporterName: formData.transporterName,
          transporterCnpj: formData.transporterCnpj,
          destinationType: formData.destinationType,
          destinationCompanyName: formData.destinationCompanyName,
          destinationCnpj: formData.destinationCnpj,
          destinationLicense: formData.destinationLicense,
          driverName: formData.driverName,
          vehiclePlate: formData.vehiclePlate,
          transportDate: transportDate?.toISOString(),
          physicalState: formData.physicalState,
          packaging: formData.packaging,
          expirationDate: expirationDate?.toISOString(),
          generatorName: settings.razaoSocial,
          generatorCnpj: settings.cnpj,
          generatorAddress: settings.endereco,
        }}
      />
    </div>
  );
};

export default NewManifest;
