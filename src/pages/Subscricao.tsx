import { useState } from "react";
import {
  Lock, Copy, Wallet, Users, ArrowUpRight, Zap, Crown,
  CheckCircle2, XCircle, ExternalLink, Gift, TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/* ─── mock data ─── */
const USED_CNPJS = 15;
const FREE_LIMIT = 15;
const INVITE_CODE = "consultor123";
const BALANCE = 436.5;
const TOTAL_REFERRALS = 12;

const referralHistory = [
  { company: "Indústria Alpha Ltda", date: "2026-01-15", active: true },
  { company: "Metalúrgica Beta S/A", date: "2026-02-02", active: true },
  { company: "Plásticos Gama ME", date: "2025-12-10", active: false },
  { company: "Têxtil Delta Ltda", date: "2026-01-28", active: true },
  { company: "Química Epsilon S/A", date: "2026-02-20", active: true },
  { company: "Alimentos Zeta Ltda", date: "2025-11-05", active: false },
  { company: "Madeireira Eta ME", date: "2026-03-01", active: true },
];

const plans = [
  {
    name: "Growth",
    price: "49,90",
    limit: "Até 30 CNPJs",
    icon: Zap,
    popular: false,
    features: [
      "Gestão de até 30 empresas",
      "Dashboard Torre de Controle",
      "Alertas automáticos",
      "Relatórios oficiais",
    ],
  },
  {
    name: "Max",
    price: "89,90",
    limit: "CNPJs Ilimitados",
    icon: Crown,
    popular: true,
    features: [
      "Tudo do Growth",
      "Empresas ilimitadas",
      "Suporte prioritário",
      "API dedicada",
      "White-label reports",
    ],
  },
];

/* ─── component ─── */
const Subscricao = () => {
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const usagePercent = Math.round((USED_CNPJS / FREE_LIMIT) * 100);
  const isAtLimit = USED_CNPJS >= FREE_LIMIT;
  const inviteLink = `ciclomtr.com/invite/${INVITE_CODE}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`);
    toast({ title: "Link copiado!", description: "Partilhe com as fábricas que pretende indicar." });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Subscrição & Carteira de Parceiro
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gira o seu plano e acompanhe as comissões dos clientes indicados.
        </p>
      </div>

      {/* ══════════════════════════════════════════════
          SECÇÃO 1 — Medidor de Utilização
      ══════════════════════════════════════════════ */}
      <Card className={`border-2 ${isAtLimit ? "border-destructive/40 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
        <CardContent className="py-5 px-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                A utilizar {USED_CNPJS} de {FREE_LIMIT} CNPJs gratuitos
              </span>
            </div>
            {isAtLimit && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                Limite atingido
              </Badge>
            )}
          </div>

          <Progress value={usagePercent} className="h-3" />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              {isAtLimit
                ? "Faça upgrade para continuar a adicionar empresas."
                : `Ainda pode adicionar ${FREE_LIMIT - USED_CNPJS} empresa(s) no plano gratuito.`}
            </p>
            <Button
              size="sm"
              variant={isAtLimit ? "default" : "outline"}
              className="gap-2"
              onClick={() => setUpgradeOpen(true)}
            >
              <Lock className="w-3.5 h-3.5" />
              Adicionar Nova Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════
          SECÇÃO 2 — Painel de Planos (inline)
      ══════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Destrave a sua faturação e gira clientes ilimitados
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Escolha o plano ideal para escalar a sua consultoria.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-shadow hover:shadow-lg ${
                  plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                    MAIS POPULAR
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <CardDescription className="text-xs">{plan.limit}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">R$ {plan.price}</span>
                    <span className="text-sm text-muted-foreground">/ mês</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full gap-2" variant={plan.popular ? "default" : "outline"}>
                    <ArrowUpRight className="w-4 h-4" />
                    Subscrever {plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ROI Simulator Card */}
        <Card className="bg-success/5 border-success/20">
          <CardContent className="py-4 px-6 flex items-start gap-3">
            <div className="p-2 rounded-full bg-success/10 shrink-0 mt-0.5">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Sabia que esta subscrição se paga sozinha?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ao adicionar apenas <strong className="text-foreground">1 ou 2 clientes</strong> com o
                seu link de parceiro, as suas comissões recorrentes cobrem o valor do plano — e
                o restante é lucro direto na sua carteira.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════
          SECÇÃO 3 — Carteira de Comissões (Partner Wallet)
      ══════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Carteira de Parceiro
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indique fábricas e ganhe comissões recorrentes por cada subscrição ativa.
          </p>
        </div>

        {/* Invite Link */}
        <Card>
          <CardContent className="py-4 px-6">
            <p className="text-sm font-medium text-foreground mb-2">O seu link de convite exclusivo</p>
            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="font-mono text-sm bg-muted/50" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Saldo Disponível</span>
              </div>
              <p className="text-3xl font-extrabold text-success">
                R$ {BALANCE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <Button className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Levantar via PIX
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5 px-6 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Empresas Indicadas</span>
              </div>
              <p className="text-3xl font-extrabold text-foreground">{TOTAL_REFERRALS}</p>
              <p className="text-xs text-muted-foreground">
                Clientes ativos a gerar comissão recorrente para si.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral History Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Histórico de Indicações</CardTitle>
            <CardDescription className="text-xs">
              Empresas que se registaram com o seu link de parceiro.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory.map((r) => (
                  <TableRow key={r.company}>
                    <TableCell className="font-medium text-foreground">{r.company}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.active ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                          <XCircle className="w-3 h-3" /> Inativo
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ─── Upgrade Modal ─── */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Limite de CNPJs atingido
            </DialogTitle>
            <DialogDescription>
              O seu plano gratuito permite até {FREE_LIMIT} empresas. Faça upgrade para continuar a crescer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card key={plan.name} className={`cursor-pointer transition-all hover:shadow-md ${plan.popular ? "border-primary/50" : ""}`}>
                  <CardContent className="py-4 px-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.limit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">R$ {plan.price}</p>
                      <p className="text-[10px] text-muted-foreground">/ mês</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-success/5 border-success/20 mt-1">
            <CardContent className="py-3 px-5 flex items-start gap-3">
              <TrendingUp className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Adicione <strong className="text-foreground">1-2 clientes</strong> com o seu link de parceiro e as
                comissões pagam a subscrição.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscricao;
