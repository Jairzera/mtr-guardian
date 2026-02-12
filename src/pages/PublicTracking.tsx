import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck, MapPin, Flag, CheckCircle2 } from "lucide-react";

type TrackingState = "idle" | "transit" | "delivered";

const PublicTracking = () => {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<TrackingState>("idle");

  const handleStart = () => {
    toast.info("Simulando envio de coordenadas lat/long para o servidor...");
    setState("transit");
  };

  const handleFinish = () => {
    toast.success("Entrega finalizada com sucesso!");
    setState("delivered");
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
        state === "transit"
          ? "bg-green-50 dark:bg-green-950/30"
          : state === "delivered"
            ? "bg-blue-50 dark:bg-blue-950/30"
            : "bg-background"
      }`}
    >
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rastreio CicloMTR</h1>
          <p className="text-muted-foreground mt-1 text-sm">MTR #{id?.slice(0, 8)}</p>
        </div>

        {/* Route info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Origem</p>
              <p className="text-lg font-semibold text-foreground">Fábrica Central LTDA</p>
            </div>
          </div>
          <div className="border-l-2 border-dashed border-border ml-3 h-6" />
          <div className="flex items-center gap-3">
            <Flag className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="text-lg font-semibold text-foreground">EcoRecicla S.A.</p>
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
            className="w-full h-20 text-xl font-bold rounded-2xl gradient-primary shadow-primary animate-pulse"
          >
            <Truck className="w-8 h-8 mr-3" />
            INICIAR VIAGEM 🚚
          </Button>
        )}

        {state === "transit" && (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-green-700 dark:text-green-400 animate-pulse">
              Viagem em Andamento... Rastreando
            </p>
            <Button
              onClick={handleFinish}
              size="lg"
              variant="destructive"
              className="w-full h-20 text-xl font-bold rounded-2xl"
            >
              FINALIZAR ENTREGA 🏁
            </Button>
          </div>
        )}

        {state === "delivered" && (
          <div className="space-y-2">
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
