import { useState, useRef } from "react";
import { Lock, Zap, Crown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import UsageBanner from "@/components/subscription/UsageBanner";
import PlanCards from "@/components/subscription/PlanCards";
import PartnerWallet from "@/components/subscription/PartnerWallet";

const USED_CNPJS = 15;
const FREE_LIMIT = 15;

const plans = [
  { name: "Growth", price: "49,90", limit: "Até 30 CNPJs", icon: Zap },
  { name: "Max", price: "89,90", limit: "CNPJs Ilimitados", icon: Crown, popular: true },
];

const Subscricao = () => {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);

  const handleUpgradeClick = () => {
    if (USED_CNPJS >= FREE_LIMIT) {
      plansRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Upgrade & Carteira de Parceiro
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seu plano e acompanhe as comissões dos clientes indicados.
        </p>
      </div>

      {/* Section 1: Usage Banner */}
      <UsageBanner used={USED_CNPJS} limit={FREE_LIMIT} onUpgradeClick={handleUpgradeClick} />

      {/* Section 2: Plan Cards */}
      <div ref={plansRef}>
        <PlanCards />
      </div>

      {/* Section 3: Partner Wallet */}
      <PartnerWallet />
    </div>
  );
};

export default Subscricao;
