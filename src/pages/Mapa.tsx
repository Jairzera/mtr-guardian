import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Truck, CheckCircle2, Clock, Copy } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/EmptyState";
import { Package } from "lucide-react";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const truckIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "hue-rotate-[120deg]",
});

interface Shipment {
  id: string;
  mtrCode: string;
  transporter: string;
  status: "collecting" | "in_transit" | "delivered";
  wasteClass: string;
  weightKg: number;
  updatedAt: string;
  origin: string;
}

const statusConfig = {
  collecting: { label: "Enviado", color: "bg-warning/10 text-warning", icon: Clock },
  in_transit: { label: "Em Trânsito", color: "bg-warning/10 text-warning", icon: Truck },
  delivered: { label: "Concluído", color: "bg-accent text-accent-foreground", icon: CheckCircle2 },
};

const statusMap: Record<string, "collecting" | "in_transit" | "delivered"> = {
  enviado: "collecting",
  em_transito: "in_transit",
  completed: "delivered",
  received: "delivered",
};

const Mapa = () => {
  const { role } = useUserRole();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShipments = async () => {
      const { data } = await supabase
        .from("waste_manifests")
        .select("id, transporter_name, waste_class, weight_kg, status, updated_at, origin")
        .in("status", ["enviado", "em_transito", "completed", "received"])
        .order("updated_at", { ascending: false });

      if (data) {
        setShipments(
          data.map((m: any) => ({
            id: m.id,
            mtrCode: m.id.slice(0, 8).toUpperCase(),
            transporter: m.transporter_name,
            status: statusMap[m.status] || "collecting",
            wasteClass: m.waste_class,
            weightKg: m.weight_kg,
            updatedAt: new Date(m.updated_at).toLocaleDateString("pt-BR"),
            origin: m.origin || "descarte",
          }))
        );
      }
      setLoading(false);
    };
    fetchShipments();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 10);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleCopyLink = (mtrCode: string) => {
    const link = `${window.location.origin}/tracking/${mtrCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de rastreio copiado!");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Logística Reversa & Rastreio</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe suas cargas em tempo real</p>
      </div>

      <Card className="shadow-card border-border/60 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-[50vh] md:h-80 z-0" />
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Cargas Ativas</h2>

        {shipments.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhuma carga em andamento"
            description="Cargas enviadas e em trânsito aparecerão aqui para acompanhamento em tempo real."
          />
        ) : (
          shipments.map((s) => {
            const cfg = statusConfig[s.status];
            const StatusIcon = cfg.icon;
            return (
              <Card key={s.id} className="p-4 md:p-5 shadow-card border-border/60 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">MTR-{s.mtrCode}</p>
                    <p className="text-sm text-muted-foreground">{s.transporter}</p>
                  </div>
                  <Badge className={`${cfg.color} border-0 gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{s.wasteClass}</span>
                  <span>•</span>
                  <span>{s.weightKg} kg</span>
                  <span>•</span>
                  <span>{s.updatedAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {s.status === "delivered" ? "Entregue" : "Em andamento"}
                    {s.origin === "descarte" && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">Descarte</Badge>
                    )}
                  </p>
                  <div className="flex gap-2">
                    {s.origin === "descarte" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleCopyLink(s.mtrCode)}>
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Link Rastreio</span>
                      </Button>
                    )}
                    {role !== "receiver" && s.origin !== "descarte" && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleCopyLink(s.mtrCode)}>
                        <Copy className="w-3 h-3" />
                        <span className="hidden sm:inline">Copiar Link</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Mapa;
