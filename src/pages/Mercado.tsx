import { useState } from "react";
import { Package, TrendingUp, Users, Plus, Sparkles, MessageCircle } from "lucide-react";
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
  pricePerKg: string;
  buyers: number;
  status: "active" | "matched";
  region: string;
}

const mockListings: Listing[] = [
  { id: "1", material: "Sucata de Alumínio", quantity: "1.200", unit: "kg", estimatedValue: "R$ 4.500,00", pricePerKg: "R$ 3,75/kg", buyers: 3, status: "matched", region: "São Paulo, SP" },
  { id: "2", material: "Papelão Ondulado", quantity: "3.500", unit: "kg", estimatedValue: "R$ 1.750,00", pricePerKg: "R$ 0,50/kg", buyers: 7, status: "active", region: "Campinas, SP" },
  { id: "3", material: "Plástico PEAD", quantity: "800", unit: "kg", estimatedValue: "R$ 960,00", pricePerKg: "R$ 1,20/kg", buyers: 2, status: "active", region: "Guarulhos, SP" },
  { id: "4", material: "Sucata de Ferro", quantity: "5.000", unit: "kg", estimatedValue: "R$ 3.000,00", pricePerKg: "R$ 0,60/kg", buyers: 5, status: "matched", region: "Osasco, SP" },
  { id: "5", material: "Vidro Transparente", quantity: "2.000", unit: "kg", estimatedValue: "R$ 400,00", pricePerKg: "R$ 0,20/kg", buyers: 1, status: "active", region: "Barueri, SP" },
];

const buildWhatsAppLink = (material: string, quantity: string, unit: string) => {
  const msg = encodeURIComponent(
    `Olá! Vi no CicloMTR que há ${quantity} ${unit} de *${material}* disponível. Tenho interesse em negociar. Podemos conversar?`
  );
  return `https://wa.me/?text=${msg}`;
};

const Mercado = () => {
  const [listings] = useState<Listing[]>(mockListings);
  const [dialogOpen, setDialogOpen] = useState(false);

  const totalRevenue = listings.reduce((sum, l) => {
    const val = parseFloat(l.estimatedValue.replace(/[R$\s.]/g, "").replace(",", "."));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receita Verde</h1>
          <p className="text-sm text-muted-foreground mt-1">Marketplace de resíduos com valor comercial</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary shadow-primary font-semibold gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Anunciar</span>
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

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Anúncios</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">{listings.length}</p>
          </div>
        </Card>
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">R$ {totalRevenue.toLocaleString("pt-BR")}</p>
          </div>
        </Card>
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><Users className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Compradores</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">{listings.reduce((s, l) => s + l.buyers, 0)}</p>
          </div>
        </Card>
      </div>

      {/* Listings - vertical cards, mobile friendly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {listings.map((item) => (
          <Card key={item.id} className="p-4 md:p-5 shadow-card border-border/60 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{item.material}</h3>
                  {item.status === "matched" && (
                    <Badge className="bg-primary/10 text-primary border-0 gap-1 text-xs">
                      <Sparkles className="w-3 h-3" /> Match!
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{item.quantity} {item.unit} · {item.region}</p>
                <p className="text-xs text-muted-foreground">{item.pricePerKg}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-primary">{item.estimatedValue}</p>
                <p className="text-xs text-muted-foreground">{item.buyers} compradores</p>
              </div>
            </div>

            {item.status === "matched" && (
              <div className="p-3 rounded-lg bg-accent border border-primary/20 text-sm text-foreground">
                🎉 Potencial de Venda: {item.estimatedValue}. Existem {item.buyers} compradores na sua região.
              </div>
            )}

            <Button
              className="w-full gap-2 font-semibold"
              variant={item.status === "matched" ? "default" : "outline"}
              asChild
            >
              <a href={buildWhatsAppLink(item.material, item.quantity, item.unit)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" />
                Tenho Interesse
              </a>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Mercado;
