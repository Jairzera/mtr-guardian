import { useState } from "react";
import { Package, TrendingUp, Users, Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Listing {
  id: string;
  material: string;
  quantity: string;
  unit: string;
  estimatedValue: string;
  buyers: number;
  status: "active" | "matched";
}

const mockListings: Listing[] = [
  { id: "1", material: "Sucata de Alumínio", quantity: "1.200", unit: "kg", estimatedValue: "R$ 4.500,00", buyers: 3, status: "matched" },
  { id: "2", material: "Papelão Ondulado", quantity: "3.500", unit: "kg", estimatedValue: "R$ 1.750,00", buyers: 7, status: "active" },
  { id: "3", material: "Plástico PEAD", quantity: "800", unit: "kg", estimatedValue: "R$ 960,00", buyers: 2, status: "active" },
];

const Mercado = () => {
  const [listings] = useState<Listing[]>(mockListings);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receita Verde</h1>
          <p className="text-sm text-muted-foreground mt-1">Marketplace de resíduos com valor comercial</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary shadow-primary font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Anunciar Resíduo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vender Resíduo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Material</Label>
                <Input placeholder="Ex: Sucata de Alumínio" className="mt-1.5" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Quantidade</Label>
                  <Input placeholder="Ex: 500" inputMode="decimal" className="mt-1.5" />
                </div>
                <div className="w-28">
                  <Label>Unidade</Label>
                  <Select defaultValue="kg">
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-primary shadow-primary font-semibold" onClick={() => setDialogOpen(false)}>
                Publicar Anúncio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Anúncios Ativos</p>
            <p className="text-2xl font-bold text-card-foreground">{listings.length}</p>
          </div>
        </Card>
        <Card className="p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Receita Potencial</p>
            <p className="text-2xl font-bold text-card-foreground">R$ 7.210</p>
          </div>
        </Card>
        <Card className="p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-sm text-muted-foreground">Compradores Interessados</p>
            <p className="text-2xl font-bold text-card-foreground">12</p>
          </div>
        </Card>
      </div>

      {/* Listings */}
      <div className="space-y-3">
        {listings.map((item) => (
          <Card key={item.id} className="p-5 shadow-card border-border/60">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{item.material}</h3>
                  {item.status === "matched" && (
                    <Badge className="bg-primary/10 text-primary border-0 gap-1">
                      <Sparkles className="w-3 h-3" /> Match!
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.quantity} {item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{item.estimatedValue}</p>
                <p className="text-xs text-muted-foreground">{item.buyers} compradores na região</p>
              </div>
            </div>
            {item.status === "matched" && (
              <div className="mt-4 p-3 rounded-lg bg-accent border border-primary/20 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  🎉 Potencial de Venda: {item.estimatedValue}. Existem {item.buyers} compradores na sua região.
                </p>
                <Button size="sm" className="gradient-primary shadow-primary font-semibold shrink-0 ml-3">
                  Conectar com Comprador
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Mercado;
