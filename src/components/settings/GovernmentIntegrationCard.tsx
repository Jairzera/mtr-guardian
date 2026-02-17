import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Link2, HelpCircle, ExternalLink } from "lucide-react";

const SYSTEMS = [
  { value: "sinir", label: "SINIR (Nacional)" },
  { value: "mtr-mg", label: "MTR-MG (Feam)" },
  { value: "sigor", label: "SIGOR (SP)" },
  { value: "inea", label: "INEA (RJ)" },
];

type ConnectionStatus = "idle" | "testing" | "success" | "error";

const GovernmentIntegrationCard = () => {
  const [system, setSystem] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [connectedName, setConnectedName] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleTestConnection = async () => {
    if (!system || !token) return;
    setStatus("testing");

    // Simulate API ping (replace with real edge function call)
    await new Promise((r) => setTimeout(r, 1800));

    // Mock response: success if token length > 10
    if (token.length > 10) {
      setStatus("success");
      setConnectedName("Empresa Demonstração LTDA");
    } else {
      setStatus("error");
      setConnectedName("");
    }
  };

  const selectedLabel = SYSTEMS.find((s) => s.value === system)?.label ?? "";

  return (
    <>
      <Card className="shadow-card border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Conexão com Órgão Ambiental</CardTitle>
          </div>
          <CardDescription>
            Integre sua conta ao sistema governamental de MTR para emissão automática.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Sistema */}
          <div className="space-y-2">
            <Label htmlFor="gov-system">Sistema</Label>
            <Select value={system} onValueChange={(v) => { setSystem(v); setStatus("idle"); }}>
              <SelectTrigger id="gov-system">
                <SelectValue placeholder="Selecione o sistema" />
              </SelectTrigger>
              <SelectContent>
                {SYSTEMS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="gov-token">Chave de Acesso (Token API)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setTutorialOpen(true)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Onde pego meu token?
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Clique para ver o passo a passo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="relative">
              <Input
                id="gov-token"
                type={showToken ? "text" : "password"}
                placeholder="Cole aqui seu token de integração"
                value={token}
                onChange={(e) => { setToken(e.target.value); setStatus("idle"); }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showToken ? "Ocultar token" : "Mostrar token"}
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Button */}
          <Button
            onClick={handleTestConnection}
            disabled={!system || !token || status === "testing"}
            variant="outline"
            className="gap-2"
          >
            {status === "testing" && <Loader2 className="w-4 h-4 animate-spin" />}
            Testar Conexão
          </Button>

          {/* Status feedback */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent text-accent-foreground border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium">
                Conectado: <span className="font-bold">{connectedName}</span>
              </span>
              <Badge variant="outline" className="ml-auto text-xs border-primary/30 text-primary">
                {selectedLabel}
              </Badge>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">
                Token Inválido. Verifique no site do MTR.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutorial Modal */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Como obter seu Token de Integração</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo no site do órgão ambiental.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-3">
              <Step number={1} text='Acesse o portal do sistema governamental (ex: mtr.sinir.gov.br) e faça login com suas credenciais.' />
              <Step number={2} text='Navegue até o menu "Minha Conta" ou "Configurações de API".' />
              <Step number={3} text='Clique em "Gerar Chave de Acesso" ou "Token de Integração".' />
              <Step number={4} text="Copie o token gerado e cole no campo acima." />
            </div>

            {/* Fictitious screenshot placeholder */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center space-y-2">
              <div className="mx-auto w-full max-w-[280px] h-32 rounded-md bg-muted flex items-center justify-center">
                <div className="text-center space-y-1">
                  <ExternalLink className="w-6 h-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Tela do portal governamental</p>
                  <p className="text-[10px] text-muted-foreground/60">Menu → Configurações → Gerar Token</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Exemplo ilustrativo do fluxo de geração de token
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Step = ({ number, text }: { number: number; text: string }) => (
  <div className="flex items-start gap-3">
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
      {number}
    </span>
    <p className="text-sm text-foreground leading-relaxed">{text}</p>
  </div>
);

export default GovernmentIntegrationCard;
