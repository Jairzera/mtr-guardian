import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

const Configuracoes = () => (
  <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
    <Card className="p-12 shadow-card border-border/60 text-center">
      <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-lg font-semibold text-foreground">Em breve</p>
      <p className="text-sm text-muted-foreground mt-1">Gerenciamento de conta e preferências.</p>
    </Card>
  </div>
);

export default Configuracoes;
