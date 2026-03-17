import { useState, useEffect, useRef } from "react";
import {
  Check, Shield, Zap, TrendingUp, ArrowRight, FileText, Truck, Award,
  Factory, Building2, MessageCircle, ChevronRight, Clock, AlertTriangle,
  BarChart3, Lock, Globe, Users, Star, Sparkles, Play, X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroMockup from "@/assets/hero-mockup.jpg";

/* ── Animated counter hook ── */
function useCountUp(end: number, duration = 2000, suffix = "") {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, display: `${value.toLocaleString("pt-BR")}${suffix}` };
}

type Period = "mensal" | "semestral" | "anual";

const plans = [
  {
    name: "Profissional",
    price: { mensal: "R$ 797,90", semestral: "R$ 4.308,66", anual: "R$ 7.659,84" },
    monthlyEquiv: { mensal: "797,90", semestral: "718,11", anual: "638,32" },
    periodLabel: { mensal: "/mês", semestral: "/semestre", anual: "/ano" },
    subtitle: "Para empresas de resíduos",
    features: ["MTRs ilimitados", "Até 10 empresas/clientes incluídos", "+R$ 397/cada 10 adicionais", "Gestão multiempresa", "Suporte prioritário"],
    links: {
      mensal: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=QZMTVR0",
      semestral: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WKEZ3Y5",
      anual: "https://checkout.nexano.com.br/checkout/cmlx0xo8z05791xqefmwp6f6f?offer=WI87DD5",
    },
    highlight: true,
    badge: null,
  },
];

const faqs = [
  {
    q: "O MTR gerado aqui vale para o IBAMA?",
    a: "Sim. Nosso sistema emite o MTR diretamente na API oficial do SINIR (IN 13/2012 IBAMA). Todos os campos obrigatórios são validados automaticamente antes da emissão, garantindo total validade jurídica.",
  },
  {
    q: "Preciso instalar algo no meu computador?",
    a: "Não. O CicloMTR é 100% Web e Cloud. Funciona em qualquer navegador, computador ou celular. Basta criar sua conta e começar a usar imediatamente.",
  },
  {
    q: "Como gerencio os MTRs dos meus clientes?",
    a: "Pelo painel multiempresa você cadastra os CNPJs dos seus clientes e emite, acompanha e documenta todos os MTRs de forma centralizada, sem precisar acessar conta por conta.",
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
    q: "Como funciona o CDF (Certificado de Destinação Final)?",
    a: "O CDF oficial é emitido pelo portal do SINIR. No CicloMTR, oferecemos o Cofre de CDFs: um repositório seguro onde você faz upload dos CDFs oficiais, mantendo tudo organizado e auditável num só lugar.",
  },
  {
    q: "Posso dar acesso de visualização aos meus clientes?",
    a: "Sim. Com o acesso View-Only, seus clientes acompanham os MTRs e comprovantes sem poder editar nada — total transparência na prestação de serviço.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [selectedPeriods, setSelectedPeriods] = useState<Record<string, Period>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stat1 = useCountUp(10000, 2200, "+");
  const stat2 = useCountUp(98, 1800, "%");
  const stat3 = useCountUp(10, 1200, "s");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ───── NAVBAR ───── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={logo} alt="CicloMTR" className="w-9 h-9" />
            <span className="font-bold text-lg tracking-tight text-foreground">CicloMTR</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#problema" className="hover:text-foreground transition-colors">O Problema</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#para-quem" className="hover:text-foreground transition-colors">Para Quem</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hidden sm:inline-flex">
              Entrar
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground shadow-primary font-semibold" onClick={() => navigate("/auth")}>
              Teste Grátis
            </Button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            {[
              { href: "#problema", label: "O Problema" },
              { href: "#como-funciona", label: "Como Funciona" },
              { href: "#para-quem", label: "Para Quem" },
              { href: "#planos", label: "Planos" },
              { href: "#faq", label: "FAQ" },
            ].map((link) => (
              <a key={link.href} href={link.href} className="block text-sm font-medium text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </a>
            ))}
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="w-full justify-start">
              Entrar
            </Button>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/50 via-background to-background" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Plataforma para Empresas de Resíduos
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold leading-[1.15] tracking-tight text-foreground">
                Gerencie MTRs de{" "}
                <span className="relative inline-block">
                  <span className="text-primary">todos os seus clientes</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6C50 2 150 2 198 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" opacity="0.3"/></svg>
                </span>{" "}
                em um único painel.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Feito para quem coleta, transporta, trata e destina resíduos. Automatize manifestos, rastreie cargas e mantenha a documentação 100% auditável — tudo centralizado.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground shadow-primary h-14 px-8 text-base font-semibold group"
                  onClick={() => navigate("/auth")}
                >
                  Começar Teste Grátis de 14 Dias
                  <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-semibold"
                  onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Ver Como Funciona
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Cancele quando quiser</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Setup em 2 minutos</span>
              </div>
            </div>

            {/* Hero mockup */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/60 ring-1 ring-border/20">
                <img
                  src={heroMockup}
                  alt="Dashboard CicloMTR – Gestão de MTRs e Rastreio de Resíduos"
                  className="w-full h-auto"
                  loading="eager"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/20 to-transparent" />
              </div>

              {/* Floating card - bottom left */}
              <div className="absolute -bottom-5 -left-3 sm:-left-6 bg-card border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-primary shrink-0">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                 <p className="text-sm font-bold text-foreground">100% Compliance</p>
                  <p className="text-xs text-muted-foreground">Validação SINIR automática</p>
                </div>
              </div>

              {/* Floating card - top right */}
              <div className="absolute -top-3 -right-2 sm:-right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">10s por MTR</p>
                  <p className="text-xs text-muted-foreground">vs 20 min manual</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF BAR ───── */}
      <section className="border-y border-border/60 bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Conformidade baseada em:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-semibold text-foreground/60">
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary/60" /> IN 13/2012 IBAMA</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary/60" /> SINIR</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary/60" /> PNRS</span>
              <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-primary/60" /> CONAMA</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            <div ref={stat1.ref}>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat1.display}</p>
              <p className="text-sm text-muted-foreground mt-1">Toneladas rastreadas</p>
            </div>
            <div ref={stat2.ref}>
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat2.display}</p>
              <p className="text-sm text-muted-foreground mt-1">Compliance na emissão</p>
            </div>
            <div ref={stat3.ref} className="col-span-2 md:col-span-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat3.display}</p>
              <p className="text-sm text-muted-foreground mt-1">Para emitir um MTR</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── O PROBLEMA ───── */}
      <section id="problema" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">O Problema</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O processo manual está <span className="text-destructive">travando sua operação</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Cada erro no manifesto é uma multa potencial. Cada minuto no site do governo é um cliente a menos atendido.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Before */}
            <Card className="p-8 border-2 border-destructive/20 bg-destructive/5 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge variant="destructive" className="text-xs">Sem CicloMTR</Badge>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Processo Manual</h3>
              <ul className="space-y-3">
                {[
                  { icon: Clock, text: "15-20 minutos por MTR no site do governo, por cliente" },
                  { icon: AlertTriangle, text: "Erros de preenchimento = multas e perda de contratos" },
                  { icon: FileText, text: "CDFs e comprovantes espalhados em pastas e e-mails" },
                  { icon: XIcon, text: "Sem visibilidade centralizada das cargas" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <item.icon className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </Card>

            {/* After */}
            <Card className="p-8 border-2 border-primary/20 bg-accent/30 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="text-xs gradient-primary text-primary-foreground border-0">Com CicloMTR</Badge>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">Processo Automatizado</h3>
              <ul className="space-y-3">
                {[
                  { icon: Zap, text: "MTR emitido em 10 segundos com validação" },
                  { icon: Shield, text: "Campos validados contra a base oficial do IBAMA" },
                  { icon: Lock, text: "Cofre jurídico de CDFs organizado e auditável" },
                  { icon: Truck, text: "Rastreio de cada carga em tempo real" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── 3 PILARES ───── */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Por que o CicloMTR?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Três pilares para escalar sua operação com <span className="text-primary">segurança</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Deixe de lado planilhas e sites lentos. Gerencie dezenas de clientes sem aumentar equipe.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Blindagem Jurídica",
                desc: "O sistema valida se o resíduo combina com o destino. Proteja sua empresa e seus clientes de multas e não-conformidades.",
                accent: "bg-primary/10 text-primary",
                border: "hover:border-primary/40",
              },
              {
                icon: Zap,
                title: "Gestão Multiempresa",
                desc: "Cadastre dezenas de CNPJs de clientes e opere tudo em um único painel. Emita, rastreie e documente sem trocar de conta.",
                accent: "bg-warning/10 text-warning",
                border: "hover:border-warning/40",
              },
              {
                icon: TrendingUp,
                title: "Rastreio e Comprovação",
                desc: "Acompanhe cada carga em tempo real e centralize CDFs e comprovantes. Ofereça transparência total ao seu cliente.",
                accent: "bg-accent text-accent-foreground",
                border: "hover:border-accent-foreground/30",
              },
            ].map((pillar) => (
              <Card key={pillar.title} className={`p-8 border-2 border-border ${pillar.border} transition-all duration-300 group hover:shadow-lg`}>
                <div className={`w-14 h-14 rounded-2xl ${pillar.accent} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
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
      <section id="como-funciona" className="py-16 md:py-24 bg-sidebar text-sidebar-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge className="mb-4 text-xs font-medium bg-sidebar-accent text-sidebar-accent-foreground border-0">
              Simples como 1-2-3
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona o CicloMTR
            </h2>
            <p className="text-sidebar-foreground/70 text-lg">
              Do manifesto ao comprovante — tudo automatizado.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
            {[
              { step: "01", icon: FileText, title: "Emita o MTR", desc: "Preencha em segundos pelo painel web. Selecione o cliente, o resíduo e o destino — tudo validado automaticamente." },
              { step: "02", icon: Truck, title: "Rastreie a Carga", desc: "O motorista recebe o link de rastreio. Você e seu cliente acompanham a coleta e a entrega em tempo real." },
              { step: "03", icon: Award, title: "Documente Tudo", desc: "Comprovantes de recebimento e CDFs ficam organizados no Cofre Jurídico. Relatórios prontos para fiscalização." },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-primary relative z-10 transition-transform hover:scale-105">
                  <s.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="text-xs font-bold text-sidebar-primary tracking-[0.2em] uppercase">Passo {s.step}</span>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="text-sidebar-foreground/60 max-w-xs mx-auto leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PARA QUEM ───── */}
      <section id="para-quem" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Para Quem</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Feito para quem <span className="text-primary">coleta</span>, <span className="text-primary">transporta</span> e <span className="text-primary">destina</span> resíduos
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Transportadoras e Coletoras */}
            <Card className="p-8 border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Truck className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Coleta e Transporte</h3>
                  <p className="text-sm text-muted-foreground">Transportadoras e coletoras de resíduos</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Emita MTRs para múltiplos clientes em segundos",
                  "Rastreie cada carga com link para o motorista",
                  "Gerencie dezenas de CNPJs num único painel",
                  "Cofre jurídico com todos os comprovantes",
                  "Acesso de visualização para o cliente acompanhar",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full gradient-primary text-primary-foreground shadow-primary h-12 font-semibold group/btn" onClick={() => navigate("/auth")}>
                Começar Teste Grátis
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Card>

            {/* Tratamento e Destinação */}
            <Card className="p-8 border-2 border-border hover:border-accent-foreground/20 transition-all hover:shadow-lg group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center transition-transform group-hover:scale-110">
                  <Factory className="w-7 h-7 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Tratamento e Destinação</h3>
                  <p className="text-sm text-muted-foreground">Aterros, recicladoras e unidades de tratamento</p>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "Receba e confirme MTRs dos geradores com agilidade",
                  "Emita CDFs e mantenha tudo centralizado no Cofre",
                  "Controle o peso recebido vs. declarado automaticamente",
                  "Relatórios de compliance prontos para fiscalização",
                  "Monitoramento de licenças com alertas de vencimento",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full gradient-primary text-primary-foreground shadow-primary h-12 font-semibold group/btn" onClick={() => navigate("/auth")}>
                Começar Teste Grátis
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF / TESTIMONIALS ───── */}
      <section className="py-16 md:py-20 bg-muted/30 border-y border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Gerenciamos mais de 40 clientes e o CicloMTR centralizou tudo. Reduzimos erros e o tempo de operação caiu pela metade.",
                name: "Carlos M.",
                role: "Diretor Operacional",
                company: "Transportadora de Resíduos",
              },
              {
                quote: "A validação automática nos salvou de erros que poderiam gerar multas sérias para nossos clientes. Hoje temos confiança total na documentação.",
                name: "Ana R.",
                role: "Coordenadora Ambiental",
                company: "Empresa de Coleta",
              },
              {
                quote: "O rastreio em tempo real e o Cofre de CDFs são diferenciais competitivos. Nossos clientes adoram a transparência.",
                name: "Roberto S.",
                role: "Gerente de Operações",
                company: "Recicladora",
              },
            ].map((t, i) => (
              <Card key={i} className="p-6 border border-border hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PLANOS ───── */}
      <section id="planos" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Planos</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investimento que se paga no <span className="text-primary">primeiro mês de operação</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              14 dias grátis. Gerencie todos os seus clientes sem limites.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
            {plans.map((plan) => {
              const period = selectedPeriods[plan.name] || "mensal";
              return (
                <Card
                  key={plan.name}
                  className={`relative flex flex-col p-6 border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.highlight ? "border-primary shadow-primary scale-[1.02]" : "border-border hover:border-primary/20"
                  }`}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs gradient-primary text-primary-foreground border-0 shadow-primary">
                      {plan.badge}
                    </Badge>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>
                  <div className="mb-1">
                    <span className="text-3xl font-extrabold text-foreground">{plan.price[period]}</span>
                    <span className="text-sm text-muted-foreground ml-1">{plan.periodLabel[period]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">14 dias grátis para testar</p>
                  <div className="mb-6">
                    <Select
                      value={period}
                      onValueChange={(v) => setSelectedPeriods((prev) => ({ ...prev, [plan.name]: v as Period }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className={`w-full h-12 font-semibold ${plan.highlight ? "gradient-primary shadow-primary text-primary-foreground" : ""}`}
                    onClick={() => window.open(plan.links[period], "_blank")}
                  >
                    Assinar Agora
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section id="faq" className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 text-xs font-medium">Dúvidas Frequentes</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Tudo que você precisa saber
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card data-[state=open]:shadow-sm transition-shadow">
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ───── CTA FINAL ───── */}
      <section className="py-16 md:py-24 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sidebar-primary/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-sidebar-primary/5 blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Escale sua operação <span className="text-sidebar-primary">sem aumentar equipe</span>.
          </h2>
          <p className="text-sidebar-foreground/60 text-lg max-w-xl mx-auto">
            Junte-se a empresas de resíduos que automatizaram a gestão de MTRs e multiplicaram a carteira de clientes.
          </p>
          <div className="pt-2">
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground shadow-primary h-14 px-10 text-base font-semibold group"
              onClick={() => navigate("/auth")}
            >
              Começar Teste Grátis de 14 Dias
              <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <p className="text-xs text-sidebar-foreground/40">Sem cartão de crédito. Sem compromisso. Cancele quando quiser.</p>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="CicloMTR" className="w-8 h-8" />
                <span className="font-bold text-foreground text-lg">CicloMTR</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                A plataforma para empresas de coleta, transporte, tratamento e destinação de resíduos que querem escalar com compliance.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Produto</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
                <a href="#planos" className="hover:text-foreground transition-colors">Planos e Preços</a>
                <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
                <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
                <a
                  href="https://wa.me/5511999999999?text=Olá!%20Preciso%20de%20suporte%20no%20CicloMTR."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Suporte WhatsApp
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} CicloMTR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
