import { useState } from "react";
import { MapPin, Truck, CheckCircle2, Clock, ExternalLink, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Shipment {
  id: string;
  mtrNumber: string;
  transporter: string;
  origin: string;
  destination: string;
  status: "collecting" | "in_transit" | "delivered";
  progress: number;
  eta: string;
}

const mockShipments: Shipment[] = [
  { id: "1", mtrNumber: "MTR-2026-0042", transporter: "TransEco Ltda", origin: "São Paulo, SP", destination: "Guarulhos, SP", status: "in_transit", progress: 65, eta: "14:30" },
  { id: "2", mtrNumber: "MTR-2026-0041", transporter: "Verde Log", origin: "Campinas, SP", destination: "Jundiaí, SP", status: "collecting", progress: 10, eta: "16:00" },
  { id: "3", mtrNumber: "MTR-2026-0039", transporter: "ReciclaJá", origin: "Osasco, SP", destination: "Barueri, SP", status: "delivered", progress: 100, eta: "Entregue" },
];

const statusConfig = {
  collecting: { label: "Coleta Iniciada", color: "bg-warning/10 text-warning", icon: Clock },
  in_transit: { label: "Em Trânsito", color: "bg-primary/10 text-primary", icon: Truck },
  delivered: { label: "Recebido no Destino", color: "bg-accent text-accent-foreground", icon: CheckCircle2 },
};

const Mapa = () => {
  const [shipments] = useState<Shipment[]>(mockShipments);

  const handleCopyLink = (mtrNumber: string) => {
    const link = `${window.location.origin}/rastreio/${mtrNumber}`;
    navigator.clipboard.writeText(link);
    toast.success("Link de rastreio copiado!");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Logística Reversa & Rastreio</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe suas cargas em tempo real</p>
      </div>

      {/* Simulated Map */}
      <Card className="shadow-card border-border/60 overflow-hidden">
        <div className="relative w-full h-64 md:h-80 bg-muted flex items-center justify-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
          <div className="relative text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Mapa Interativo</p>
              <p className="text-sm text-muted-foreground">Rastreamento em tempo real simulado</p>
            </div>
            {/* Simulated route dots */}
            <div className="flex items-center justify-center gap-1 pt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < 8 ? "bg-primary" : "bg-muted-foreground/30"}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Shipments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Cargas Ativas</h2>
        {shipments.map((s) => {
          const cfg = statusConfig[s.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={s.id} className="p-5 shadow-card border-border/60 space-y-3">
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

              {/* Route visualization */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{s.origin}
                </div>
                <div className="flex-1 h-1.5 bg-muted rounded-full relative">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full gradient-primary transition-all"
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
                    Copiar Link
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs">
                    <ExternalLink className="w-3 h-3" />
                    Gerar Link de Rastreio
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
