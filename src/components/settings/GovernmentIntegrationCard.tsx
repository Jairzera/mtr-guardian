import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle, Link2, HelpCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import sinirLogin from "@/assets/sinir-login.png";
import sinirMenuConfig from "@/assets/sinir-menu-config.png";
import sinirUsuarioApiMenu from "@/assets/sinir-usuario-api-menu.png";
import sinirUsuarioApi from "@/assets/sinir-usuario-api.png";
import sinirAdicionar from "@/assets/sinir-adicionar.png";
import sinirPerfil from "@/assets/sinir-perfil.png";

type ConnectionStatus = "idle" | "saving" | "testing" | "success" | "error";

const GovernmentIntegrationCard = () => {
  const { user } = useAuth();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleSaveAndTest = async () => {
    if (!token || !user) return;

    // Step 1: Save token
    setStatus("saving");
    setErrorMessage("");

    const { error: saveError } = await supabase
      .from("company_settings")
      .update({ gov_api_token: token } as any)
      .eq("user_id", user.id);

    if (saveError) {
      setStatus("error");
      setErrorMessage("Erro ao salvar o token.");
      toast({ title: "Erro", description: "Não foi possível salvar o token.", variant: "destructive" });
      return;
    }

    // Step 2: Test connection
    setStatus("testing");

    try {
      const { data, error } = await supabase.functions.invoke("test-sinir-connection", {
        method: "POST",
      });

      if (error) {
        setStatus("error");
        setErrorMessage("Erro ao testar a conexão.");
        toast({ title: "Erro", description: "Erro ao testar a conexão com o SINIR.", variant: "destructive" });
        return;
      }

      if (data?.success) {
        setStatus("success");
        toast({ title: "Sucesso!", description: "Conexão com o SINIR estabelecida com sucesso!" });
      } else {
        setStatus("error");
        setErrorMessage(data?.error || "Token inválido ou expirado.");
        toast({ title: "Falha na conexão", description: data?.error || "Token inválido ou expirado.", variant: "destructive" });
      }
    } catch {
      setStatus("error");
      setErrorMessage("Não foi possível conectar à API.");
      toast({ title: "Erro", description: "Erro inesperado ao testar conexão.", variant: "destructive" });
    }
  };

  return (
    <>
      <Card className="shadow-card border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Conexão com o SINIR</CardTitle>
          </div>
          <CardDescription>
            Cole seu Token API do SINIR para habilitar a emissão automática de MTRs.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Token */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="gov-token">Token API SINIR</Label>
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

          {/* Save & Test Button */}
          <Button
            onClick={handleSaveAndTest}
            disabled={!token || status === "saving" || status === "testing"}
            className="gap-2"
          >
            {(status === "saving" || status === "testing") && <Loader2 className="w-4 h-4 animate-spin" />}
            {status === "saving" ? "Salvando token..." : status === "testing" ? "Testando conexão..." : "Salvar e Testar Conexão"}
          </Button>

          {/* Status feedback */}
          {status === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent text-accent-foreground border border-primary/20">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm font-medium">
                Conexão com o SINIR estabelecida com sucesso!
              </span>
              <Badge variant="outline" className="ml-auto text-xs border-primary/30 text-primary">
                SINIR
              </Badge>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutorial Modal */}
      <Dialog open={tutorialOpen} onOpenChange={setTutorialOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Como obter seu Token de Integração</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo no portal do SINIR.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <Step number={1} text='Acesse o portal mtr.sinir.gov.br e faça login com suas credenciais.' image={sinirLogin} />
            <Step number={2} text='No menu superior, clique em "Configurações".' image={sinirMenuConfig} />
            <Step number={3} text='Selecione "Usuário API" no submenu.' image={sinirUsuarioApiMenu} />
            <Step number={4} text='Na tela de Usuário API, localize ou gere seu token de acesso.' image={sinirUsuarioApi} />
            <Step number={5} text='Clique em "Adicionar" para confirmar a permissão.' image={sinirAdicionar} />
            <Step number={6} text='Verifique seu perfil para confirmar que a integração está ativa.' image={sinirPerfil} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Step = ({ number, text, image }: { number: number; text: string; image?: string }) => (
  <div className="space-y-2">
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
        {number}
      </span>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
    {image && (
      <div className="ml-9">
        <img src={image} alt={`Passo ${number}`} className="rounded-lg border border-border w-full" />
      </div>
    )}
  </div>
);

export default GovernmentIntegrationCard;
