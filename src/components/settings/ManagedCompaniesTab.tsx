import { useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useManagedCompanies } from "@/hooks/useManagedCompanies";
import { formatCNPJ } from "@/lib/cnpj";
import { toast } from "@/hooks/use-toast";

const ManagedCompaniesTab = () => {
  const { companies, activeCount, addCompany, toggleActive, removeCompany, isLoading } = useManagedCompanies();
  const [open, setOpen] = useState(false);
  const [cnpj, setCnpj] = useState("");
  const [razao, setRazao] = useState("");

  const handleAdd = async () => {
    if (!cnpj || !razao) return;
    try {
      await addCompany.mutateAsync({ cnpj, razao_social: razao });
      toast({ title: "CNPJ adicionado com sucesso" });
      setCnpj("");
      setRazao("");
      setOpen(false);
    } catch {
      toast({ title: "Erro ao adicionar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Filiais / CNPJs Gerenciados</CardTitle>
                <CardDescription>Gerencie os CNPJs das empresas que você administra</CardDescription>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="w-4 h-4" /> Adicionar CNPJ
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Filial / CNPJ</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Razão Social</Label>
                    <Input className="mt-1" value={razao} onChange={(e) => setRazao(e.target.value)} placeholder="Nome da empresa" />
                  </div>
                  <div>
                    <Label>CNPJ</Label>
                    <Input className="mt-1" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
                  </div>
                  <Button onClick={handleAdd} disabled={addCompany.isPending || !cnpj || !razao} className="w-full">
                    {addCompany.isPending ? "Salvando..." : "Adicionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{activeCount} CNPJs ativos</Badge>
            <Badge variant="outline">{companies.length} total</Badge>
          </div>

          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum CNPJ gerenciado. Adicione filiais ou clientes para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {companies.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.razao_social}</p>
                    <p className="text-xs text-muted-foreground">{c.cnpj}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">{c.is_active ? "Ativo" : "Inativo"}</span>
                      <Switch
                        checked={c.is_active}
                        onCheckedChange={(v) => toggleActive.mutate({ id: c.id, is_active: v })}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        removeCompany.mutate(c.id);
                        toast({ title: "CNPJ removido" });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagedCompaniesTab;
