import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck, MapPin, Flag, CheckCircle2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type TrackingState = "idle" | "transit" | "delivered";

const PublicTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<TrackingState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Load current status from DB
  useEffect(() => {
    const loadStatus = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("waste_manifests")
        .select("status")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        if (data.status === "em_transito") setState("transit");
        else if (data.status === "completed" || data.status === "received") setState("delivered");
      }
    };
    loadStatus();
  }, [id]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 13);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker when coords change
  useEffect(() => {
    if (!mapRef.current || !coords) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    } else {
      markerRef.current = L.marker([coords.lat, coords.lng])
        .addTo(mapRef.current)
        .bindPopup("📍 Localização do motorista");
    }
    mapRef.current.setView([coords.lat, coords.lng], 15);
  }, [coords]);

  const startGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Não foi possível obter a localização. Verifique as permissões.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    watchIdRef.current = watchId;
  };

  const stopGeolocation = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleStart = async () => {
    if (!id) return;
    setLoading(true);

    // Update status to em_transito
    const { error } = await supabase
      .from("waste_manifests")
      .update({ status: "em_transito" } as any)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao iniciar viagem. Tente novamente.");
      setLoading(false);
      return;
    }

    startGeolocation();
    setState("transit");
    toast.success("Viagem iniciada! Rastreamento ativo 📍");
    setLoading(false);
  };

  const handleFinish = async () => {
    if (!id) return;
    setLoading(true);

    const { error } = await supabase
      .from("waste_manifests")
      .update({ status: "completed" } as any)
      .eq("id", id);

    if (error) {
      toast.error("Erro ao finalizar entrega.");
      setLoading(false);
      return;
    }

    stopGeolocation();
    setState("delivered");
    toast.success("Entrega finalizada com sucesso! 🏁");
    setLoading(false);
  };

  // Cleanup geolocation on unmount
  useEffect(() => {
    return () => stopGeolocation();
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-500 ${
        state === "transit"
          ? "bg-green-50 dark:bg-green-950/30"
          : state === "delivered"
            ? "bg-blue-50 dark:bg-blue-950/30"
            : "bg-background"
      }`}
    >
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground">Rastreio CicloMTR</h1>
          <p className="text-muted-foreground mt-1 text-sm">MTR #{id?.slice(0, 8)}</p>
        </div>

        {/* Map - always visible */}
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
          <div ref={mapContainerRef} className="w-full h-[250px] z-0" />
        </div>

        {/* Location status */}
        {state === "transit" && coords && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Navigation className="w-4 h-4 text-primary animate-pulse" />
            <span>Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</span>
          </div>
        )}

        {/* Route info */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3 text-left">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Origem</p>
              <p className="text-base font-semibold text-foreground">Gerador</p>
            </div>
          </div>
          <div className="border-l-2 border-dashed border-border ml-2.5 h-5" />
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="text-base font-semibold text-foreground">Destinador</p>
            </div>
          </div>
        </div>

        {/* Status steps */}
        <div className="flex items-center justify-center gap-2">
          {["Coleta", "Trânsito", "Entregue"].map((label, i) => {
            const stepDone =
              (i === 0 && state !== "idle") ||
              (i === 1 && state === "delivered") ||
              (i === 2 && state === "delivered");
            const stepActive =
              (i === 0 && state === "idle") ||
              (i === 1 && state === "transit") ||
              (i === 2 && state === "delivered");

            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    stepDone
                      ? "bg-primary text-primary-foreground"
                      : stepActive
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepDone ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Action */}
        {state === "idle" && (
          <Button
            onClick={handleStart}
            size="lg"
            disabled={loading}
            className="w-full h-20 text-xl font-bold rounded-2xl gradient-primary shadow-primary"
          >
            <Truck className="w-8 h-8 mr-3" />
            {loading ? "Iniciando..." : "INICIAR VIAGEM 🚚"}
          </Button>
        )}

        {state === "transit" && (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-green-700 dark:text-green-400 animate-pulse">
              📍 Viagem em Andamento — Rastreando em tempo real
            </p>
            <Button
              onClick={handleFinish}
              size="lg"
              variant="destructive"
              disabled={loading}
              className="w-full h-20 text-xl font-bold rounded-2xl"
            >
              {loading ? "Finalizando..." : "FINALIZAR ENTREGA 🏁"}
            </Button>
          </div>
        )}

        {state === "delivered" && (
          <div className="space-y-2 pb-8">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <p className="text-xl font-bold text-foreground">Entrega Confirmada!</p>
            <p className="text-sm text-muted-foreground">
              O destinador foi notificado. Obrigado!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTracking;
