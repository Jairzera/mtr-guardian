import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, Loader2, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import sinirLogin from "@/assets/sinir-login.png";
import sinirMenuConfig from "@/assets/sinir-menu-config.png";
import sinirUsuarioApiMenu from "@/assets/sinir-usuario-api-menu.png";
import sinirUsuarioApi from "@/assets/sinir-usuario-api.png";
import sinirAdicionar from "@/assets/sinir-adicionar.png";

const CNPJ_CICLOMTR = "00.000.000/0001-00";

const SuccessIntegration = () => {
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CNPJ_CICLOMTR);
    setCopied(true);
    toast.success("CNPJ copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidate = () => {
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
            <strong className="text-foreground">conectar o sistema ao Governo.</strong>
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
                Integração com o SINIR / MTR Nacional
              </span>
            </div>

            {/* Step 1 */}
            <Step number={1} title="Acesse o portal oficial e faça login com seu CNPJ">
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
                e faça login selecionando <strong>CNPJ</strong>, conforme destacado abaixo.
              </p>
              <img
                src={sinirLogin}
                alt="Tela de login do SINIR com opção CNPJ destacada"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Step 2 */}
            <Step number={2} title='No menu superior, clique em "Configurações" > "Usuário API"'>
              <p className="text-sm text-muted-foreground mb-3">
                Após fazer login, localize o menu <strong>Configurações</strong> na barra superior e clique em{" "}
                <strong>Usuário API</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <img
                  src={sinirMenuConfig}
                  alt="Menu Configurações aberto no SINIR"
                  className="rounded-lg border w-full"
                  loading="lazy"
                />
                <img
                  src={sinirUsuarioApiMenu}
                  alt="Opção Usuário API destacada no menu"
                  className="rounded-lg border w-full"
                  loading="lazy"
                />
              </div>
            </Step>

            {/* Step 3 */}
            <Step number={3} title="Copie o CNPJ do CicloMTR e busque no sistema do governo">
              <p className="text-sm text-muted-foreground mb-3">
                Na tela de <strong>Usuário API</strong>, cole o CNPJ abaixo no campo de busca e clique na lupa para pesquisar.
              </p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center gap-2 rounded-md border bg-muted px-4 py-2.5">
                  <span className="font-mono text-sm font-semibold text-foreground tracking-wide">
                    {CNPJ_CICLOMTR}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <img
                src={sinirUsuarioApi}
                alt="Tela de Usuário API com campo CNPJ"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>

            {/* Step 4 */}
            <Step number={4} title='Encontre o CicloMTR e clique em "Adicionar"'>
              <p className="text-sm text-muted-foreground mb-3">
                O sistema irá localizar o CicloMTR na busca. Clique no botão{" "}
                <strong>"Adicionar"</strong> para nos dar a permissão de operar em seu nome.
              </p>
              <img
                src={sinirAdicionar}
                alt="Resultado da busca com botão Adicionar destacado"
                className="rounded-lg border w-full"
                loading="lazy"
              />
            </Step>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button
          onClick={handleValidate}
          disabled={isValidating}
          size="lg"
          className="w-full text-base font-semibold gap-2 h-14"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validando conexão com o órgão ambiental...
            </>
          ) : (
            <>
              Já autorizei! Testar Conexão e Acessar Dashboard
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
