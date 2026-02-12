import { useState, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Truck, CheckCircle2, Clock, Copy, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  mtrNumber: string;
  transporter: string;
  origin: string;
  destination: string;
  status: "collecting" | "in_transit" | "delivered";
  progress: number;
  eta: string;
  originCoords: [number, number];
  destCoords: [number, number];
  currentCoords: [number, number];
}

const mockShipments: Shipment[] = [
  {
    id: "1", mtrNumber: "MTR-2026-0042", transporter: "TransEco Ltda",
    origin: "São Paulo, SP", destination: "Guarulhos, SP",
    status: "in_transit", progress: 65, eta: "14:30",
    originCoords: [-23.5505, -46.6333],
    destCoords: [-23.4356, -46.5330],
    currentCoords: [-23.4900, -46.5800],
  },
  {
    id: "2", mtrNumber: "MTR-2026-0041", transporter: "Verde Log",
    origin: "Campinas, SP", destination: "Jundiaí, SP",
    status: "collecting", progress: 10, eta: "16:00",
    originCoords: [-22.9099, -47.0626],
    destCoords: [-23.1857, -46.8978],
    currentCoords: [-22.9099, -47.0626],
  },
  {
    id: "3", mtrNumber: "MTR-2026-0039", transporter: "ReciclaJá",
    origin: "Osasco, SP", destination: "Barueri, SP",
    status: "delivered", progress: 100, eta: "Entregue",
    originCoords: [-23.5325, -46.7917],
    destCoords: [-23.5107, -46.8761],
    currentCoords: [-23.5107, -46.8761],
  },
];

const statusConfig = {
  collecting: { label: "Coleta Iniciada", color: "bg-warning/10 text-warning", icon: Clock },
  in_transit: { label: "Em Trânsito", color: "bg-primary/10 text-primary", icon: Truck },
  delivered: { label: "Recebido", color: "bg-accent text-accent-foreground", icon: CheckCircle2 },
};

const Mapa = () => {
  const [shipments] = useState<Shipment[]>(mockShipments);

  const handleCopyLink = (mtrNumber: string) => {
    const link = `${window.location.origin}/tracking/${mtrNumber}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de rastreio copiado!");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Logística Reversa & Rastreio</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe suas cargas em tempo real</p>
      </div>

      {/* Leaflet Map */}
      <Card className="shadow-card border-border/60 overflow-hidden">
        <div className="w-full h-[50vh] md:h-80">
          <MapContainer
            center={[-23.5505, -46.6333]}
            zoom={10}
            scrollWheelZoom
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {shipments.map((s) => (
              <Fragment key={s.id}>
                <Marker position={s.currentCoords} icon={truckIcon}>
                  <Popup>
                    <strong>{s.mtrNumber}</strong><br />
                    {s.transporter}<br />
                    <em>{statusConfig[s.status].label}</em>
                  </Popup>
                </Marker>
                <Polyline
                  positions={[s.originCoords, s.currentCoords, s.destCoords]}
                  pathOptions={{
                    color: s.status === "delivered" ? "#22c55e" : "#3b82f6",
                    weight: 3,
                    dashArray: s.status === "collecting" ? "8 8" : undefined,
                  }}
                />
              </Fragment>
            ))}
          </MapContainer>
        </div>
      </Card>

      {/* Shipment cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Cargas Ativas</h2>
        {shipments.map((s) => {
          const cfg = statusConfig[s.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={s.id} className="p-4 md:p-5 shadow-card border-border/60 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{s.mtrNumber}</p>
                  <p className="text-sm text-muted-foreground">{s.transporter}</p>
                </div>
                <Badge className={`${cfg.color} border-0 gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <MapPin className="w-3 h-3" />{s.origin}
                </div>
                <div className="flex-1 h-1.5 bg-muted rounded-full relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full gradient-primary transition-all"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <MapPin className="w-3 h-3" />{s.destination}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {s.status === "delivered" ? "Entregue" : `ETA: ${s.eta}`}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleCopyLink(s.mtrNumber)}>
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Copiar Link</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Mapa;
