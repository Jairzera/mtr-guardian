import {
  Copy, Wallet, Users, ExternalLink, Gift,
  CheckCircle2, XCircle, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const BALANCE = 593.70;
const ACTIVE_SUBS = 10;
const MRR = 1979.00;
const INVITE_CODE = "consultor123";

const referralHistory = [
  { company: "Indústria Alpha Ltda", plan: "Básico R$ 197,90", active: true, commission: 59.37 },
  { company: "Metalúrgica Beta S/A", plan: "Básico R$ 197,90", active: true, commission: 59.37 },
  { company: "Plásticos Gama ME", plan: "Básico R$ 197,90", active: false, commission: 0 },
  { company: "Têxtil Delta Ltda", plan: "Avançado R$ 297,90", active: true, commission: 89.37 },
  { company: "Química Epsilon S/A", plan: "Básico R$ 197,90", active: true, commission: 59.37 },
  { company: "Alimentos Zeta Ltda", plan: "Básico R$ 197,90", active: false, commission: 0 },
  { company: "Madeireira Eta ME", plan: "Avançado R$ 297,90", active: true, commission: 89.37 },
  { company: "Cerâmica Theta Ltda", plan: "Básico R$ 197,90", active: true, commission: 59.37 },
  { company: "Siderúrgica Iota S/A", plan: "Ilimitado R$ 397,90", active: true, commission: 119.37 },
  { company: "Papelaria Kappa ME", plan: "Básico R$ 197,90", active: true, commission: 59.37 },
];

const PartnerWallet = () => {
  const inviteLink = `ciclomtr.com/invite/${INVITE_CODE}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`);
    toast({ title: "Link copiado!", description: "Compartilhe com as fábricas que deseja indicar." });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Dashboard do Programa de Parceiros
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Indique fábricas e ganhe 30% de comissão recorrente por cada assinatura ativa.
        </p>
      </div>

      {/* Invite Link */}
      <Card>
        <CardContent className="py-4 px-6">
          <p className="text-sm font-medium text-foreground mb-2">Seu link de indicação exclusivo</p>
          <div className="flex gap-2">
            <Input readOnly value={inviteLink} className="font-mono text-sm bg-muted/50" />
            <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-success/20">
          <CardContent className="py-5 px-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Saldo Disponível</span>
            </div>
            <p className="text-3xl font-extrabold text-success">
              R$ {BALANCE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <Button className="w-full gap-2" size="sm">
              <ExternalLink className="w-4 h-4" />
              Solicitar Saque PIX
            </Button>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="py-5 px-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Assinaturas Ativas</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{ACTIVE_SUBS}</p>
            <p className="text-xs text-muted-foreground">
              Empresas gerando comissão recorrente.
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="py-5 px-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">MRR Gerado</span>
            </div>
            <p className="text-3xl font-extrabold text-success">
              R$ {MRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">
              Receita recorrente mensal dos indicados.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral History Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Clientes Indicados</CardTitle>
          <CardDescription className="text-xs">
            Empresas que assinaram usando seu link de parceiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Comissão/mês</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referralHistory.map((r) => (
                <TableRow key={r.company}>
                  <TableCell className="font-medium text-foreground">{r.company}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.plan}</TableCell>
                  <TableCell>
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
                  <TableCell className="text-right font-semibold text-foreground">
                    {r.active
                      ? `R$ ${r.commission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerWallet;
