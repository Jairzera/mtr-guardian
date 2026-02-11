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

interface CDFItem {
  id: string;
  date: string;
  certNumber: string;
  linkedMTR: string;
  destinador: string;
}

const mockData: CDFItem[] = [
  { id: "1", date: "12/02/2026", certNumber: "CDF-2026/0045", linkedMTR: "MTR-002", destinador: "EcoSoluções Ambientais" },
  { id: "2", date: "10/02/2026", certNumber: "CDF-2026/0044", linkedMTR: "MTR-003", destinador: "Verde Logística" },
  { id: "3", date: "05/02/2026", certNumber: "CDF-2026/0039", linkedMTR: "MTR-001", destinador: "ReciclaMax Ltda" },
  { id: "4", date: "28/01/2026", certNumber: "CDF-2026/0031", linkedMTR: "MTR-005", destinador: "EcoSoluções Ambientais" },
  { id: "5", date: "20/01/2026", certNumber: "CDF-2026/0025", linkedMTR: "MTR-004", destinador: "Ambiental Sul S.A." },
];

const handleDownload = (certNumber: string) => {
  toast({ title: "Download iniciado", description: `Baixando ${certNumber}.pdf` });
};

const Certificados = () => {
  const isMobile = useIsMobile();
  const { settings: company } = useCompanySettings();

  const cdfColumns = [
    { header: "Data de Emissão", key: "date" },
    { header: "Nº do Certificado", key: "certNumber" },
    { header: "MTR Vinculado", key: "linkedMTR" },
    { header: "Destinador Final", key: "destinador" },
  ];

  const handleExportCSV = () => exportCSV({ title: "Certificados_CDF", columns: cdfColumns, rows: mockData as unknown as Record<string, unknown>[] });
  const handleExportPDF = () => exportPDF({ title: "Certificados CDF", columns: cdfColumns, rows: mockData as unknown as Record<string, unknown>[], company });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Certificados</h1>
          <p className="text-sm text-muted-foreground mt-1">Certificados de Destinação Final (CDF)</p>
        </div>
        <ExportDropdown onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {mockData.map((item) => (
            <Card key={item.id} className="p-4 shadow-card border-border/60">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-card-foreground">{item.certNumber}</span>
                  <p className="text-xs text-muted-foreground">{item.destinador}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDownload(item.certNumber)}>
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
              {mockData.map((item) => (
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
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(item.certNumber)}>
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
