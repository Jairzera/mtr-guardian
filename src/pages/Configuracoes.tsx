import { useEffect, useState } from "react";
import { Building2, SlidersHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useTheme } from "next-themes";
import { formatCNPJ, isValidCNPJ } from "@/lib/cnpj";
import { formatPhone, isValidPhone } from "@/lib/phone";
import GovernmentIntegrationCard from "@/components/settings/GovernmentIntegrationCard";
import ManagedCompaniesTab from "@/components/settings/ManagedCompaniesTab";

const Configuracoes = () => {
  const { settings, loading, saveSettings } = useCompanySettings();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [alertasEmail, setAlertasEmail] = useState(() => localStorage.getItem("alertas_email") !== "false");
  const [cnpjError, setCnpjError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => { setForm(settings); }, [settings]);

  const handleChange = (field: string, value: string) => {
    if (field === "cnpj") {
      setForm((prev) => ({ ...prev, [field]: formatCNPJ(value) }));
      setCnpjError("");
    } else if (field === "phone") {
      setForm((prev) => ({ ...prev, [field]: formatPhone(value) }));
      setPhoneError("");
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!isValidCNPJ(form.cnpj)) { setCnpjError("CNPJ não corresponde ao modelo padrão"); return; }
    if (form.phone && !isValidPhone(form.phone)) { setPhoneError("Telefone inválido"); return; }
    setSaving(true);
    const ok = await saveSettings(form);
    setSaving(false);
    if (ok) {
      toast({ title: "Alterações salvas", description: "Suas configurações foram atualizadas com sucesso." });
      setCnpjError(""); setPhoneError("");
    } else {
      toast({ title: "Erro", description: "Não foi possível salvar as configurações.", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="filiais">Filiais / CNPJs</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <CompanyCard form={form} handleChange={handleChange} cnpjError={cnpjError} phoneError={phoneError} />
          <PreferencesCard theme={theme} setTheme={setTheme} alertasEmail={alertasEmail} setAlertasEmail={setAlertasEmail} />
          <SaveButton saving={saving} onSave={handleSave} />
        </TabsContent>

        <TabsContent value="filiais" className="space-y-6">
          <ManagedCompaniesTab />
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-6">
          <GovernmentIntegrationCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ---------- Sub-components ---------- */

interface CompanyCardProps {
  form: { razaoSocial: string; cnpj: string; endereco: string; responsavel: string; phone: string };
  handleChange: (field: string, value: string) => void;
  cnpjError: string;
  phoneError: string;
}

const CompanyCard = ({ form, handleChange, cnpjError, phoneError }: CompanyCardProps) => (
  <Card className="shadow-card border-border/60">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Dados da Empresa</CardTitle>
      </div>
      <CardDescription>Informações usadas no cabeçalho dos MTRs.</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="razaoSocial">Razão Social</Label>
        <Input id="razaoSocial" placeholder="Ex: Indústria ABC Ltda" value={form.razaoSocial} onChange={(e) => handleChange("razaoSocial", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input id="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} className={cnpjError ? "border-destructive" : ""} />
        {cnpjError && <p className="text-sm text-destructive font-medium">{cnpjError}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="responsavel">Responsável Técnico</Label>
        <Input id="responsavel" placeholder="Nome completo" value={form.responsavel} onChange={(e) => handleChange("responsavel", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone / WhatsApp</Label>
        <Input id="phone" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className={phoneError ? "border-destructive" : ""} />
        {phoneError && <p className="text-sm text-destructive font-medium">{phoneError}</p>}
        <p className="text-xs text-muted-foreground">Obrigatório para anunciar no Mercado</p>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="endereco">Endereço da Unidade</Label>
        <Input id="endereco" placeholder="Rua, nº, cidade – UF" value={form.endereco} onChange={(e) => handleChange("endereco", e.target.value)} />
      </div>
    </CardContent>
  </Card>
);

interface PreferencesCardProps { theme: string | undefined; setTheme: (t: string) => void; alertasEmail: boolean; setAlertasEmail: (v: boolean) => void; }

const PreferencesCard = ({ theme, setTheme, alertasEmail, setAlertasEmail }: PreferencesCardProps) => (
  <Card className="shadow-card border-border/60">
    <CardHeader>
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Preferências do Sistema</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-foreground">Modo Escuro</p><p className="text-xs text-muted-foreground">Alterna o tema da interface</p></div>
        <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
      </div>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-foreground">Alertas de Vencimento por E-mail</p><p className="text-xs text-muted-foreground">Receba notificações sobre MTRs próximos do vencimento</p></div>
        <Switch checked={alertasEmail} onCheckedChange={(v) => { setAlertasEmail(v); localStorage.setItem("alertas_email", String(v)); }} />
      </div>
    </CardContent>
  </Card>
);

const SaveButton = ({ saving, onSave }: { saving: boolean; onSave: () => void }) => (
  <div className="flex justify-end">
    <Button onClick={onSave} disabled={saving}>
      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      Salvar Alterações
    </Button>
  </div>
);

export default Configuracoes;
