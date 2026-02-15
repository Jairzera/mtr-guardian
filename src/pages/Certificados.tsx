import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import ExportDropdown from "@/components/ExportDropdown";
import { exportCSV, exportPDF } from "@/lib/exportUtils";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { generateCDFPdf } from "@/lib/cdfPdfUtils";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/EmptyState";
import { ShieldCheck } from "lucide-react";

interface CDFItem {
  id: string;
  date: string;
  certNumber: string;
  linkedMTR: string;
  destinador: string;
}

const Certificados = () => {
  const isMobile = useIsMobile();
  const { settings: company } = useCompanySettings();
  const [certificates, setCertificates] = useState<CDFItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompleted = async () => {
      const { data } = await supabase
        .from("waste_manifests")
        .select("id, updated_at, waste_class, transporter_name, status")
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      if (data) {
        setCertificates(
          data.map((m, i) => ({
            id: m.id,
            date: new Date(m.updated_at).toLocaleDateString("pt-BR"),
            certNumber: `CDF-${new Date(m.updated_at).getFullYear()}/${String(i + 1).padStart(4, "0")}`,
            linkedMTR: m.id.slice(0, 8).toUpperCase(),
            destinador: m.transporter_name,
          }))
        );
      }
      setLoading(false);
    };
    fetchCompleted();
  }, []);

  const handleDownload = (item: CDFItem) => {
    toast({ title: "Preparando download...", description: `Gerando ${item.certNumber}.pdf` });
    generateCDFPdf(item, company);
  };

  const cdfColumns = [
    { header: "Data de Emissão", key: "date" },
    { header: "Nº do Certificado", key: "certNumber" },
    { header: "MTR Vinculado", key: "linkedMTR" },
    { header: "Destinador Final", key: "destinador" },
  ];

  const handleExportCSV = () => exportCSV({ title: "Certificados_CDF", columns: cdfColumns, rows: certificates as unknown as Record<string, unknown>[] });
  const handleExportPDF = () => exportPDF({ title: "Certificados CDF", columns: cdfColumns, rows: certificates as unknown as Record<string, unknown>[], company });

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <p className="text-muted-foreground">Carregando certificados...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Certificados</h1>
          <p className="text-sm text-muted-foreground mt-1">Certificados de Destinação Final (CDF)</p>
        </div>
        {certificates.length > 0 && (
          <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        )}
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Nenhum certificado disponível"
          description="Certificados serão gerados automaticamente quando cargas forem entregues e validadas."
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {certificates.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-card-foreground">{item.certNumber}</span>
                  <p className="text-xs text-muted-foreground">{item.destinador}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(item)}>
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Data de Emissão</TableHead>
                <TableHead>Nº do Certificado</TableHead>
                <TableHead>MTR Vinculado</TableHead>
                <TableHead>Destinador Final</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{item.date}</TableCell>
                  <TableCell className="font-medium">{item.certNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      {item.linkedMTR}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.destinador}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(item)}>
                      <Download className="w-4 h-4" />
                    </Button>
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

export default Certificados;
