import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { FileX2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface MTRItem {
  id: string;
  created_at: string;
  waste_class: string;
  weight_kg: number;
  status: string;
  transporter_name: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  conformidade: { label: "Em Conformidade", className: "bg-accent text-accent-foreground border-0" },
  pendente: { label: "Pendente", className: "bg-warning/15 text-warning border-0" },
  risco: { label: "Risco", className: "bg-risk/15 text-risk border-0" },
};

const getStatusBadge = (status: string) => {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground border-0" };
  return config;
};

const MTRList = () => {
  const isMobile = useIsMobile();
  const [data, setData] = useState<MTRItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMTRs = async () => {
      const { data: manifests, error } = await supabase
        .from("waste_manifests")
        .select("id, created_at, waste_class, weight_kg, status, transporter_name")
        .order("created_at", { ascending: false });

      if (!error && manifests) {
        setData(manifests);
      }
      setLoading(false);
    };
    fetchMTRs();
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meus MTRs</h1>
        <p className="text-sm text-muted-foreground mt-1">Manifestos de Transporte de Resíduos</p>
      </div>

      {data.length === 0 ? (
        <Card className="p-12 shadow-card border-border/60 flex flex-col items-center justify-center gap-4 text-center">
          <FileX2 className="w-12 h-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-semibold text-foreground">Nenhum MTR registrado ainda.</p>
            <p className="text-sm text-muted-foreground mt-1">Registre seu primeiro manifesto para vê-lo aqui.</p>
          </div>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {data.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <Card key={item.id} className="p-4 shadow-card border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-card-foreground">{item.id.slice(0, 8)}</span>
                  <Badge className={badge.className}>{badge.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.waste_class}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                  <span className="text-sm font-medium text-card-foreground">{item.weight_kg} kg</span>
                </div>
              </Card>
            );
          })}
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
              {data.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{formatDate(item.created_at)}</TableCell>
                    <TableCell className="font-medium">{item.id.slice(0, 8)}</TableCell>
                    <TableCell>{item.waste_class}</TableCell>
                    <TableCell>{Number(item.weight_kg).toLocaleString()}</TableCell>
                    <TableCell>{item.transporter_name}</TableCell>
                    <TableCell>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default MTRList;
