import { useState, useEffect } from "react";
import { Package, TrendingUp, Users, Plus, MessageCircle, Store } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/format";
import { CardListSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";

interface ListingWithSeller {
  id: string;
  material: string;
  quantity: number;
  unit: string;
  price_per_kg: number | null;
  region: string;
  status: string;
  user_id: string;
  seller_phone: string | null;
  seller_email: string | null;
  seller_name: string | null;
}

const Mercado = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ListingWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newMaterial, setNewMaterial] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("kg");
  const [newPricePerKg, setNewPricePerKg] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const fetchListings = async () => {
    setLoading(true);
    const { data: listingsData, error } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
      setLoading(false);
      return;
    }

    if (!listingsData || listingsData.length === 0) {
      setListings([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(listingsData.map((l) => l.user_id))];
    const { data: settingsData } = await supabase
      .from("company_settings")
      .select("user_id, phone, razao_social")
      .in("user_id", userIds);

    const settingsMap = new Map<string, { phone: string; razao_social: string }>();
    settingsData?.forEach((s) => {
      settingsMap.set(s.user_id, { phone: s.phone, razao_social: s.razao_social });
    });

    const enriched: ListingWithSeller[] = listingsData.map((l) => {
      const settings = settingsMap.get(l.user_id);
      return {
        id: l.id,
        material: l.material,
        quantity: l.quantity,
        unit: l.unit,
        price_per_kg: l.price_per_kg,
        region: l.region,
        status: l.status,
        user_id: l.user_id,
        seller_phone: settings?.phone || null,
        seller_email: null,
        seller_name: settings?.razao_social || null,
      };
    });

    setListings(enriched);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateListing = async () => {
    if (!user) return;
    if (!newMaterial.trim() || !newQuantity.trim()) {
      toast.error("Preencha material e quantidade ❌");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("marketplace_listings").insert({
      user_id: user.id,
      material: newMaterial.trim(),
      quantity: parseFloat(newQuantity.replace(",", ".")),
      unit: newUnit,
      price_per_kg: newPricePerKg ? parseFloat(newPricePerKg.replace(",", ".")) : null,
      region: newRegion.trim(),
    });

    if (error) {
      toast.error("Erro ao criar anúncio ❌");
      console.error(error);
    } else {
      toast.success("Anúncio publicado com sucesso 🎉");
      setNewMaterial("");
      setNewQuantity("");
      setNewPricePerKg("");
      setNewRegion("");
      setDialogOpen(false);
      fetchListings();
    }
    setSubmitting(false);
  };

  const handleInterest = (item: ListingWithSeller) => {
    const phone = item.seller_phone?.replace(/\D/g, "");

    if (!phone) {
      toast.warning(
        `Contato do vendedor indisponível.${item.seller_name ? ` Empresa: ${item.seller_name}.` : ""} Tente novamente mais tarde.`
      );
      return;
    }

    const msg = encodeURIComponent(
      `Olá, vi seu anúncio de ${item.material} no CicloMTR e tenho interesse.`
    );
    const url = `https://wa.me/55${phone}?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatValue = (qty: number, pricePerKg: number | null) => {
    if (!pricePerKg) return null;
    return formatCurrency(qty * pricePerKg);
  };

  const totalRevenue = listings.reduce((sum, l) => {
    return sum + (l.price_per_kg ? l.quantity * l.price_per_kg : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receita Verde</h1>
          <p className="text-sm text-muted-foreground mt-1">Marketplace de resíduos com valor comercial</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary shadow-primary font-semibold gap-2 min-h-[44px]">
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
                <Label>Material *</Label>
                <Input placeholder="Ex: Sucata de Alumínio" className="mt-1.5" value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} maxLength={200} />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Quantidade *</Label>
                  <Input placeholder="Ex: 500" inputMode="decimal" className="mt-1.5" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
                </div>
                <div className="w-28">
                  <Label>Unidade</Label>
                  <Select value={newUnit} onValueChange={setNewUnit}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="L">Litros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Preço por kg (R$)</Label>
                <Input placeholder="Ex: 3,75" inputMode="decimal" className="mt-1.5" value={newPricePerKg} onChange={(e) => setNewPricePerKg(e.target.value)} />
              </div>
              <div>
                <Label>Região</Label>
                <Input placeholder="Ex: São Paulo, SP" className="mt-1.5" value={newRegion} onChange={(e) => setNewRegion(e.target.value)} maxLength={100} />
              </div>
              <Button className="w-full gradient-primary shadow-primary font-semibold min-h-[44px]" onClick={handleCreateListing} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Publicar Anúncio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><Package className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Anúncios</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">{listings.length}</p>
          </div>
        </Card>
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Receita</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>
        <Card className="p-3 md:p-4 shadow-card border-border/60 flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
          <div className="p-2.5 rounded-xl bg-primary/10 hidden sm:block"><Users className="w-5 h-5 text-primary" /></div>
          <div>
            <p className="text-xs text-muted-foreground">Vendedores</p>
            <p className="text-xl md:text-2xl font-bold text-card-foreground">{new Set(listings.map((l) => l.user_id)).size}</p>
          </div>
        </Card>
      </div>

      {/* Listings */}
      {loading ? (
        <CardListSkeleton count={4} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Nenhuma oportunidade na sua região ainda."
          description="Publique seu primeiro anúncio e conecte-se com compradores interessados."
          actionLabel="Anunciar Resíduo"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {listings.map((item) => {
            const estimatedValue = formatValue(item.quantity, item.price_per_kg);
            const isOwn = item.user_id === user?.id;

            return (
              <Card key={item.id} className="p-4 md:p-5 shadow-card border-border/60 space-y-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{item.material}</h3>
                      {isOwn && <Badge variant="secondary" className="text-xs">Seu anúncio</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(item.quantity)} {item.unit}
                      {item.region ? ` · ${item.region}` : ""}
                    </p>
                    {item.price_per_kg && (
                      <p className="text-xs text-muted-foreground">
                        R$ {item.price_per_kg.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/{item.unit}
                      </p>
                    )}
                    {item.seller_name && <p className="text-xs text-muted-foreground">{item.seller_name}</p>}
                  </div>
                  {estimatedValue && (
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{estimatedValue}</p>
                    </div>
                  )}
                </div>

                {!isOwn && (
                  <Button
                    className="w-full gap-2 font-semibold min-h-[44px]"
                    variant="default"
                    onClick={() => handleInterest(item)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Tenho Interesse
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Mercado;
