import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileDown, CheckCircle2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MtrPreviewData {
  mtrNumber?: string;
  wasteClass: string;
  quantity: string;
  unit: string;
  transporterName: string;
  transporterCnpj?: string;
  destinationType: string;
  destinationCompanyName?: string;
  destinationCnpj?: string;
  destinationLicense?: string;
  driverName?: string;
  vehiclePlate?: string;
  transportDate?: string;
  physicalState?: string;
  packaging?: string;
  expirationDate?: string;
  generatorName?: string;
  generatorCnpj?: string;
  generatorAddress?: string;
}

interface MtrPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: MtrPreviewData;
  saving?: boolean;
}

function generateMtrPreviewPdf(data: MtrPreviewData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Government-style header
  doc.setFillColor(0, 100, 0);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("REPÚBLICA FEDERATIVA DO BRASIL", pageWidth / 2, 10, { align: "center" });
  doc.text("MINISTÉRIO DO MEIO AMBIENTE", pageWidth / 2, 16, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("MANIFESTO DE TRANSPORTE DE RESÍDUOS - MTR", pageWidth / 2, 24, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema Nacional de Informações sobre a Gestão dos Resíduos Sólidos – SINIR", pageWidth / 2, 31, { align: "center" });

  y = 42;
  doc.setTextColor(0, 0, 0);

  // MTR Number
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const mtrNum = data.mtrNumber || `MTR-PRÉVIA-${new Date().getTime().toString(36).toUpperCase()}`;
  doc.text(`Nº ${mtrNum}`, 14, y);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("PRÉVIA — Documento não oficial", pageWidth - 14, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 8;

  // Separator
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.8);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Generator Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 0);
  doc.text("1. GERADOR", 14, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["Razão Social", data.generatorName || "—"],
      ["CNPJ", data.generatorCnpj || "—"],
      ["Endereço", data.generatorAddress || "—"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 100, 0], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Waste Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 0);
  doc.text("2. DADOS DO RESÍDUO", 14, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["Classe do Resíduo", data.wasteClass],
      ["Quantidade", `${data.quantity} ${data.unit}`],
      ["Estado Físico", data.physicalState || "—"],
      ["Acondicionamento", data.packaging || "—"],
      ["Tipo de Destinação", data.destinationType],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 100, 0], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Transporter Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 0);
  doc.text("3. TRANSPORTADOR", 14, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["Razão Social", data.transporterName || "—"],
      ["CNPJ", data.transporterCnpj || "—"],
      ["Motorista", data.driverName || "—"],
      ["Placa do Veículo", data.vehiclePlate || "—"],
      ["Data de Transporte", data.transportDate ? new Date(data.transportDate).toLocaleDateString("pt-BR") : "—"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 100, 0], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // Destination Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 100, 0);
  doc.text("4. DESTINADOR FINAL", 14, y);
  doc.setTextColor(0, 0, 0);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["Razão Social", data.destinationCompanyName || "—"],
      ["CNPJ", data.destinationCnpj || "—"],
      ["Nº Licença Ambiental", data.destinationLicense || "—"],
      ["Validade da Licença", data.expirationDate ? new Date(data.expirationDate).toLocaleDateString("pt-BR") : "—"],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [0, 100, 0], textColor: 255 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(0, 100, 0);
  doc.line(14, pageHeight - 30, pageWidth - 14, pageHeight - 30);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("PRÉVIA DO MANIFESTO — Sujeito a alterações até a emissão oficial", 14, pageHeight - 24);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")} — CicloMTR`, 14, pageHeight - 19);
  doc.text("Este documento NÃO possui validade legal", pageWidth - 14, pageHeight - 19, { align: "right" });

  doc.save(`PREVIA-MTR-${Date.now()}.pdf`);
}

const MtrPreviewModal = ({ open, onClose, onConfirm, data, saving }: MtrPreviewModalProps) => {
  const rows = [
    { label: "Classe do Resíduo", value: data.wasteClass },
    { label: "Quantidade", value: `${data.quantity} ${data.unit}` },
    { label: "Estado Físico", value: data.physicalState },
    { label: "Acondicionamento", value: data.packaging },
    { label: "Tipo de Destinação", value: data.destinationType },
    { label: "Transportadora", value: data.transporterName },
    { label: "CNPJ Transportadora", value: data.transporterCnpj },
    { label: "Motorista", value: data.driverName },
    { label: "Placa", value: data.vehiclePlate },
    { label: "Data de Transporte", value: data.transportDate ? new Date(data.transportDate).toLocaleDateString("pt-BR") : undefined },
    { label: "Destinador", value: data.destinationCompanyName },
    { label: "CNPJ Destinador", value: data.destinationCnpj },
    { label: "Licença Ambiental", value: data.destinationLicense },
    { label: "Validade da Licença", value: data.expirationDate ? new Date(data.expirationDate).toLocaleDateString("pt-BR") : undefined },
  ].filter((r) => r.value);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Prévia do MTR
            <Badge variant="outline" className="text-xs">Formato Governo</Badge>
          </DialogTitle>
          <DialogDescription>
            Revise os dados antes de confirmar o lançamento no sistema.
          </DialogDescription>
        </DialogHeader>

        {/* Government-style card */}
        <div className="border-2 border-primary/30 rounded-lg overflow-hidden">
          {/* Header bar */}
          <div className="bg-primary p-3 text-primary-foreground text-center">
            <p className="text-xs font-medium">MANIFESTO DE TRANSPORTE DE RESÍDUOS</p>
            <p className="text-lg font-bold mt-1">MTR — SINIR</p>
          </div>

          {/* Generator info */}
          {(data.generatorName || data.generatorCnpj) && (
            <div className="p-3 bg-muted/30 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">GERADOR</p>
              <p className="text-sm font-medium">{data.generatorName || "—"}</p>
              {data.generatorCnpj && (
                <p className="text-xs text-muted-foreground">CNPJ: {data.generatorCnpj}</p>
              )}
            </div>
          )}

          {/* Data rows */}
          <div className="divide-y divide-border">
            {rows.map((row, i) => (
              <div key={i} className="flex justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-xs font-medium text-foreground text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-muted/30 p-2 text-center">
            <p className="text-[10px] text-muted-foreground">PRÉVIA — Documento sujeito a alterações até emissão oficial</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => generateMtrPreviewPdf(data)}
          >
            <FileDown className="w-4 h-4" />
            Baixar Prévia PDF
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose}>
            Voltar e Editar
          </Button>
          <Button
            size="sm"
            className="gradient-primary shadow-primary font-semibold gap-1"
            onClick={onConfirm}
            disabled={saving}
          >
            <CheckCircle2 className="w-4 h-4" />
            {saving ? "Confirmando..." : "Confirmar e Lançar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MtrPreviewModal;
