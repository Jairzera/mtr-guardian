import { Check, Shield, Zap, TrendingUp, ArrowRight, FileText, Truck, Award, Factory, Building2, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroMockup from "@/assets/hero-mockup.jpg";

const plans = [
  {
    name: "Standard",
    subtitle: "Para Geradores",
    price: "R$ 497",
    period: "/mês",
    focus: "PMEs e Fábricas",
    features: [
      "Gestão de MTRs ilimitada",
      "App para Operadores",
      "Auditoria de Compliance",
      "Validade Jurídica completa",
      "Suporte por e-mail",
    ],
    cta: "Começar Teste Grátis",
    highlight: false,
    href: "/auth",
  },
  {
    name: "Corporate",
    subtitle: "Para Destinadores",
    price: "R$ 1.997",
    period: "/mês",
    focus: "Aterros, Recicladoras e Indústrias",
    features: [
      "Tudo do Standard +",
      "Painel de Recebimento",
      "Emissão Automática de CDF",
      "Gestão de Clientes",
      "Integração com Balança",
      "Multi-usuários",
      "API dedicada",
      "Suporte prioritário",
    ],
    cta: "Falar com Especialista",
    highlight: true,
    href: "https://wa.me/5511999999999?text=Olá!%20Tenho%20interesse%20no%20plano%20Corporate%20do%20CicloMTR.",
  },
];

const faqs = [
  {
    q: "O MTR gerado aqui vale para o IBAMA?",
    a: "Sim. Nosso sistema segue a IN 13/2012 do IBAMA/SINIR. Todos os campos obrigatórios (Estado Físico, Acondicionamento, CNPJ e Licença do Destinador) são validados automaticamente antes da emissão, garantindo total validade jurídica.",
  },
  {
    q: "Preciso instalar algo no meu computador?",
    a: "Não. O CicloMTR é 100% Web e Cloud. Funciona em qualquer navegador, computador ou celular. Basta criar sua conta e começar a usar imediatamente.",
  },
  {
    q: "E se o destinador não usar o sistema?",
    a: "Sem problema. Temos a opção de upload manual de comprovante de recebimento. Você não fica na mão e mantém sua documentação completa e auditável.",
  },
  {
    q: "Quanto tempo leva para emitir um MTR?",
    a: "Menos de 10 segundos. Nosso sistema pré-carrega os dados cadastrados e valida automaticamente. Compare com os 15-20 minutos do processo manual no site do governo.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem fidelidade, sem multa de cancelamento. Teste 14 dias grátis e cancele quando quiser, com seus dados exportáveis.",
  },
  {
    q: "O sistema gera o CDF automaticamente?",
    a: "Sim. Quando o destinador valida o recebimento da carga, o Certificado de Destinação Final é gerado automaticamente e fica disponível no seu painel para download e auditoria.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  const handleCta = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank");
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ───── NAVBAR ───── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={logo} alt="CicloMTR" className="w-9 h-9" />
            <span className="font-bold text-lg text-foreground">CicloMTR</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para Quem</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              Entrar
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary" onClick={() => navigate("/auth")}>
              Teste Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="text-xs font-medium">
                🛡️ Plataforma de Inteligência Ambiental
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-foreground">
                A Primeira Plataforma que{" "}
                <span className="text-primary">Blinda sua Fábrica de Multas</span>{" "}
                e Automatiza o MTR.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Esqueça o site lento do governo. Gere manifestos em <strong className="text-foreground">10 segundos</strong>, rastreie a carga em tempo real e receba o Certificado (CDF) automaticamente. Tudo com validade jurídica.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground shadow-primary h-14 px-8 text-base font-semibold"
                  onClick={() => navigate("/auth")}
                >
                  Começar Teste Grátis de 14 Dias
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-semibold"
                  onClick={() => {
                    document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ver Como Funciona
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Cancele quando quiser</span>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border">
                <img src={heroMockup} alt="Dashboard CicloMTR – Gestão de MTRs e Rastreio de Resíduos" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg px-4 py-3 shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">+10.000 ton</p>
                  <p className="text-xs text-muted-foreground">rastreadas com segurança</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── LOGOS / SOCIAL PROOF BAR ───── */}
      <section className="border-y border-border bg-muted/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">Conformidade baseada em:</span>
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-foreground/70">
            <span>IN 13/2012 IBAMA</span>
            <span className="hidden md:inline text-border">|</span>
            <span>SINIR</span>
            <span className="hidden md:inline text-border">|</span>
            <span>PNRS</span>
            <span className="hidden md:inline text-border">|</span>
            <span>CONAMA</span>
          </div>
        </div>
      </section>

      {/* ───── 3 PILARES ───── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Por que o CicloMTR?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Três pilares para sua operação ficar <span className="text-primary">blindada</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Deixe de lado planilhas, sites lentos e o medo de fiscalização.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Blindagem Jurídica",
                desc: "O sistema valida se o resíduo combina com o destino. Nunca mais envie carga errada e evite multas milionárias do IBAMA.",
                accent: "bg-primary/10 text-primary",
              },
              {
                icon: Zap,
                title: "Automação com IA",
                desc: "Scan Inteligente: Tire foto da nota fiscal e o MTR é preenchido sozinho. Fim da digitação manual e dos erros humanos.",
                accent: "bg-warning/10 text-warning",
              },
              {
                icon: TrendingUp,
                title: "Marketplace de Resíduos",
                desc: "Conecte-se a quem compra seu lixo. Transforme custo de descarte em nova receita para sua empresa.",
                accent: "bg-accent text-accent-foreground",
              },
            ].map((pillar) => (
              <Card key={pillar.title} className="p-8 border-2 border-border hover:border-primary/30 transition-colors group">
                <div className={`w-14 h-14 rounded-xl ${pillar.accent} flex items-center justify-center mb-6`}>
                  <pillar.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── COMO FUNCIONA ───── */}
      <section id="como-funciona" className="py-20 md:py-28 bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge className="mb-4 text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground border-0">
              Simples como 1-2-3
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona o CicloMTR
            </h2>
            <p className="text-sidebar-foreground/70 text-lg">
              Do manifesto ao certificado — tudo automatizado.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-0.5 bg-sidebar-border" />
            {[
              { step: "01", icon: FileText, title: "Emita o MTR", desc: "Preencha em segundos pelo painel web ou app mobile. Dados validados automaticamente." },
              { step: "02", icon: Truck, title: "Rastreie a Carga", desc: "O motorista recebe o link de rastreio. Acompanhe a ida e a entrega em tempo real." },
              { step: "03", icon: Award, title: "Receba o CDF", desc: "O destinador valida o recebimento e o Certificado de Destinação Final é gerado automaticamente." },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-primary relative z-10">
                  <s.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-xs font-bold text-sidebar-primary tracking-widest uppercase">Passo {s.step}</span>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-sidebar-foreground/70 max-w-xs mx-auto">{s.desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-16 w-6 h-6 text-sidebar-primary transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PARA QUEM ───── */}
      <section id="para-quem" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Segmentação</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Feito para quem <span className="text-primary">gera</span> e quem <span className="text-primary">recebe</span> resíduos
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Geradores */}
            <Card className="p-8 border-2 border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Factory className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Para Geradores</h3>
                  <p className="text-sm text-muted-foreground">Indústrias, Construtoras e PMEs</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Evite multas do IBAMA com validação automática",
                  "Emita MTRs em 10 segundos (não em 20 minutos)",
                  "Rastreie cada carga até o destino final",
                  "Tenha todos os CDFs organizados e auditáveis",
                  "Venda resíduos no Marketplace integrado",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full gradient-primary text-primary-foreground shadow-primary h-12 font-semibold" onClick={() => navigate("/auth")}>
                Começar Teste Grátis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>

            {/* Destinadores */}
            <Card className="p-8 border-2 border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Para Destinadores</h3>
                  <p className="text-sm text-muted-foreground">Aterros e Recicladoras</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Receba mais cargas com validação digital instantânea",
                  "Emissão automática de CDF sem papelada",
                  "Painel de recebimento com peso e foto",
                  "Gestão completa de clientes geradores",
                  "Integração com balança e API dedicada",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full h-12 font-semibold" onClick={() => handleCta("https://wa.me/5511999999999?text=Olá!%20Tenho%20interesse%20no%20CicloMTR%20para%20Destinadores.")}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Falar com Especialista
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── PLANOS ───── */}
      <section id="planos" className="py-20 md:py-28 bg-muted/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Planos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investimento que se paga na <span className="text-primary">primeira multa evitada</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Teste 14 dias sem compromisso. Sem cartão de crédito. Cancele quando quiser.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col p-8 border-2 transition-shadow hover:shadow-lg ${
                  plan.highlight ? "border-primary shadow-primary" : "border-border"
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs gradient-primary text-primary-foreground border-0">
                    Mais Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{plan.subtitle}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.focus}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full h-12 font-semibold ${
                    plan.highlight ? "gradient-primary shadow-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => handleCta(plan.href)}
                >
                  {plan.highlight && <MessageCircle className="w-4 h-4 mr-1" />}
                  {!plan.highlight && <ArrowRight className="w-4 h-4 mr-1" />}
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Precisa de algo maior? <button onClick={() => handleCta("https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20cotar%20o%20plano%20Enterprise%20do%20CicloMTR.")} className="text-primary font-medium hover:underline">Fale conosco sobre o plano Enterprise.</button>
          </p>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Dúvidas Frequentes</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Tudo que você precisa saber
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="py-20 md:py-28 bg-sidebar text-sidebar-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Sua operação <span className="text-sidebar-primary">100% legalizada</span> hoje.
          </h2>
          <p className="text-sidebar-foreground/70 text-lg max-w-xl mx-auto">
            Junte-se a empresas que já eliminaram o risco de multas e automatizaram a gestão de resíduos.
          </p>
          <Button
            size="lg"
            className="gradient-primary text-primary-foreground shadow-primary h-14 px-10 text-base font-semibold"
            onClick={() => navigate("/auth")}
          >
            Começar Teste Grátis de 14 Dias
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <p className="text-xs text-sidebar-foreground/50">Sem cartão de crédito. Sem compromisso.</p>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-border bg-card py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CicloMTR" className="w-7 h-7" />
              <span className="font-bold text-foreground">CicloMTR</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
              <a
                href="https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20suporte%20no%20CicloMTR."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Suporte WhatsApp
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} CicloMTR. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
