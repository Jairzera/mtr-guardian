import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface MTRItem {
  id: string;
  date: string;
  wasteClass: string;
  weightKg: number;
  status: "conformidade" | "pendente" | "risco";
  transporter: string;
}

const mockData: MTRItem[] = [
  { id: "MTR-001", date: "2026-02-10", wasteClass: "Classe I - Perigoso", weightKg: 1200, status: "conformidade", transporter: "TransLog Ambiental" },
  { id: "MTR-002", date: "2026-02-09", wasteClass: "Classe II A - Não Inerte", weightKg: 3400, status: "pendente", transporter: "EcoTransp Ltda" },
  { id: "MTR-003", date: "2026-02-08", wasteClass: "Classe II B - Inerte", weightKg: 5600, status: "conformidade", transporter: "Verde Logística" },
  { id: "MTR-004", date: "2026-02-07", wasteClass: "Classe I - Perigoso", weightKg: 800, status: "risco", transporter: "TransLog Ambiental" },
  { id: "MTR-005", date: "2026-02-06", wasteClass: "Classe II A - Não Inerte", weightKg: 2100, status: "pendente", transporter: "EcoTransp Ltda" },
];

const statusConfig = {
  conformidade: { label: "Em Conformidade", className: "bg-accent text-accent-foreground border-0" },
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning border-0" },
  risco: { label: "Risco", className: "bg-risk/15 text-risk border-0" },
};

const MTRList = () => {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus MTRs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manifestos de Transporte de Resíduos</p>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {mockData.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-card-foreground">{item.id}</span>
                <Badge className={statusConfig[item.status].className}>
                  {statusConfig[item.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.wasteClass}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <span className="text-sm font-medium text-card-foreground">{item.weightKg} kg</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Peso (kg)</TableHead>
                <TableHead>Transportadora</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.wasteClass}</TableCell>
                  <TableCell>{item.weightKg.toLocaleString()}</TableCell>
                  <TableCell>{item.transporter}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[item.status].className}>
                      {statusConfig[item.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default MTRList;
