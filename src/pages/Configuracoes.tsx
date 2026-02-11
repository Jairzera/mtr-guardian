import { useState } from "react";
import { Building2, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const [form, setForm] = useState({
    razaoSocial: "",
    cnpj: "",
    endereco: "",
    responsavel: "",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [alertasEmail, setAlertasEmail] = useState(true);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({ title: "Alterações salvas", description: "Suas configurações foram atualizadas com sucesso." });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>

      {/* Dados da Empresa */}
      <Card className="shadow-card border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Dados da Empresa Geradora</CardTitle>
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
            <Input id="cnpj" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável Técnico</Label>
            <Input id="responsavel" placeholder="Nome completo" value={form.responsavel} onChange={(e) => handleChange("responsavel", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="endereco">Endereço da Unidade</Label>
            <Input id="endereco" placeholder="Rua, nº, cidade – UF" value={form.endereco} onChange={(e) => handleChange("endereco", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card className="shadow-card border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Preferências do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Modo Escuro</p>
              <p className="text-xs text-muted-foreground">Alterna o tema da interface</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Alertas de Vencimento por E-mail</p>
              <p className="text-xs text-muted-foreground">Receba notificações sobre MTRs próximos do vencimento</p>
            </div>
            <Switch checked={alertasEmail} onCheckedChange={setAlertasEmail} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
};

export default Configuracoes;
