import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Truck, CheckCircle2, Clock, Copy, Link } from "lucide-react";
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
  status: "pending" | "collecting" | "awaiting_cdf" | "delivered";
  wasteClass: string;
  weightKg: number;
  updatedAt: string;
  origin: string;
}

const statusConfig = {
  pending: { label: "Pendente", color: "bg-destructive/10 text-destructive", icon: Clock },
  collecting: { label: "Enviado", color: "bg-warning/10 text-warning", icon: Truck },
  awaiting_cdf: { label: "Aguardando CDF", color: "bg-warning/10 text-warning", icon: Clock },
  delivered: { label: "Concluído", color: "bg-accent text-accent-foreground", icon: CheckCircle2 },
};

const statusMap: Record<string, "pending" | "collecting" | "awaiting_cdf" | "delivered"> = {
  pendente: "pending",
  enviado: "collecting",
  em_transito: "collecting",
  aguardando_validacao: "awaiting_cdf",
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
        .in("status", ["pendente", "enviado", "em_transito", "aguardando_validacao", "completed", "received"])
        .order("updated_at", { ascending: false });

      if (data) {
        setShipments(
          data.map((m: any) => ({
            id: m.id,
            mtrCode: m.id.slice(0, 8).toUpperCase(),
            transporter: m.transporter_name,
            status: statusMap[m.status] || "pending",
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

  const handleGenerateTrackingLink = async (shipment: Shipment) => {
    // Generate a secure tracking token
    const token = crypto.randomUUID();
    
    // If status is pending, update to enviado and set tracking token
    if (shipment.status === "pending") {
      const { error } = await supabase
        .from("waste_manifests")
        .update({ status: "enviado", tracking_token: token } as any)
        .eq("id", shipment.id);

      if (error) {
        toast.error("Erro ao atualizar status do MTR.");
        return;
      }

      // Update local state
      setShipments((prev) =>
        prev.map((s) => (s.id === shipment.id ? { ...s, status: "collecting" as const } : s))
      );
    } else {
      // For already-sent manifests, fetch existing token
      const { data } = await supabase
        .from("waste_manifests")
        .select("tracking_token")
        .eq("id", shipment.id)
        .maybeSingle();
      
      if (!data?.tracking_token) {
        toast.error("Token de rastreio não encontrado.");
        return;
      }
    }

    // Build link with token - for pending we use the new token, for others fetch it
    if (shipment.status === "pending") {
      const link = `${window.location.origin}/tracking/${shipment.id}?token=${token}`;
      navigator.clipboard.writeText(link);
    } else {
      const { data } = await supabase
        .from("waste_manifests")
        .select("tracking_token")
        .eq("id", shipment.id)
        .maybeSingle();
      const link = `${window.location.origin}/tracking/${shipment.id}?token=${data?.tracking_token}`;
      navigator.clipboard.writeText(link);
    }
    
    toast.success("Link de rastreio copiado! Envie ao motorista para iniciar o rastreio em tempo real.");
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
                    {s.status === "delivered" ? "CDF anexado" : s.status === "awaiting_cdf" ? "Entregue — aguardando CDF" : s.status === "collecting" ? "Em trânsito" : "Aguardando envio"}
                  </p>
                  {s.status !== "delivered" && (
                    <Button
                      size="sm"
                      className="gradient-primary gap-1.5 text-xs"
                      onClick={() => handleGenerateTrackingLink(s)}
                    >
                      <Link className="w-3.5 h-3.5" />
                      {s.status === "pending" ? "Gerar link de rastreio" : "Copiar link de rastreio"}
                    </Button>
                  )}
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
