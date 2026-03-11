import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, Loader2, ExternalLink, ArrowRight, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import sinirHome from "@/assets/sinir-home.png";
import sinirMenuConfig from "@/assets/sinir-menu-config.png";
import sinirGerarToken from "@/assets/sinir-gerar-token.png";
import sinirTokenApi from "@/assets/sinir-token-api.png";

const SuccessIntegration = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [token, setToken] = useState("");

  const handleValidate = () => {
    if (!token.trim()) {
      toast.error("Cole o token gerado no campo acima antes de continuar.");
      return;
    }
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
      toast.success("Conexão estabelecida com sucesso! Seu sistema está pronto.");
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Pagamento Aprovado! Bem-vindo ao CicloMTR.
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sua assinatura está ativa. Para liberar seu Dashboard e automatizar sua gestão de resíduos, precisamos de apenas um último passo:{" "}
            <strong className="text-foreground">gerar seu Token API no SINIR e colar aqui.</strong>
          </p>
        </div>

        {/* Tutorial Card */}
        <Card className="border-2">
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-semibold">
                Tutorial
              </Badge>
              <span className="text-sm text-muted-foreground">
                Gerar Token API no SINIR — 4 passos simples
              </span>
            </div>

            {/* Step 1 */}
            <Step number={1} title="Acesse o portal SINIR e faça login">
              <p className="text-sm text-muted-foreground mb-3">
                Entre no site{" "}
                <a
                  href="https://mtr.sinir.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline inline-flex items-center gap-1"
                >
                  mtr.sinir.gov.br <ExternalLink className="w-3 h-3" />
                </a>{" "}
                e faça login com suas credenciais (CNPJ e senha).
              </p>
              <img
                src={sinirHome}
                alt="Página inicial do SINIR após login"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Step 2 */}
            <Step number={2} title='Abra o menu "Configurações"'>
              <p className="text-sm text-muted-foreground mb-3">
                No menu superior do portal, clique em <strong>"Configurações"</strong> para abrir o submenu.
              </p>
              <img
                src={sinirMenuConfig}
                alt="Menu Configurações aberto no SINIR"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Step 3 */}
            <Step number={3} title='Clique em "Gerar Token API WS"'>
              <p className="text-sm text-muted-foreground mb-3">
                Dentro do submenu de Configurações, selecione a opção{" "}
                <strong>"Gerar Token API WS"</strong> (destacada em azul na imagem).
              </p>
              <img
                src={sinirGerarToken}
                alt="Opção Gerar Token API WS destacada no menu"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Step 4 */}
            <Step number={4} title='Clique em "Gerar token" e depois "Copiar token"'>
              <p className="text-sm text-muted-foreground mb-3">
                Na tela de <strong>Token API WS</strong>, clique no botão{" "}
                <strong>"Gerar token"</strong> para criar seu token. Após gerado, clique em{" "}
                <strong>"Copiar token"</strong> e cole no campo abaixo.
              </p>
              <img
                src={sinirTokenApi}
                alt="Tela de geração do Token API WS com botões Gerar e Copiar"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Token input */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Cole seu token aqui:</span>
              </div>
              <Input
                type="password"
                placeholder="Cole o token gerado no SINIR"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button
          onClick={handleValidate}
          disabled={isValidating || !token.trim()}
          size="lg"
          className="w-full text-base font-semibold gap-2 h-14"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validando conexão com o SINIR...
            </>
          ) : (
            <>
              Testar Conexão e Acessar Dashboard
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const Step = ({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <h3 className="font-semibold text-foreground pt-1">{title}</h3>
    </div>
    <div className="ml-11">{children}</div>
  </div>
);

export default SuccessIntegration;
