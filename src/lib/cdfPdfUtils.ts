import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanySettings } from "@/hooks/useCompanySettings";

interface CDFData {
  certNumber: string;
  date: string;
  linkedMTR: string;
  destinador: string;
}

export function generateCDFPdf(cdf: CDFData, company?: CompanySettings) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 139, 34);
  doc.text("CicloMTR", 14, y);
  doc.setTextColor(0, 0, 0);
  y += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Comprovante Interno de Destinação", 14, y);
  y += 8;

  // Disclaimer banner
  doc.setFillColor(255, 243, 205);
  doc.rect(14, y, pageWidth - 28, 12, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 100, 0);
  doc.text("⚠ COMPROVANTE INTERNO — Este documento NÃO substitui o CDF oficial emitido pelo órgão ambiental.", 18, y + 5);
  doc.text("O CDF oficial deve ser obtido no portal do SINIR: mtr.sinir.gov.br", 18, y + 9);
  doc.setTextColor(0, 0, 0);
  y += 16;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref. ${cdf.certNumber}`, 14, y);
  y += 10;

  // Separator
  doc.setDrawColor(34, 139, 34);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Company info
  doc.setTextColor(0, 0, 0);
  if (company && company.razaoSocial) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Empresa Geradora", 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = [
      company.razaoSocial,
      company.cnpj ? `CNPJ: ${company.cnpj}` : "",
      company.endereco,
      company.responsavel ? `Resp. Técnico: ${company.responsavel}` : "",
    ].filter(Boolean);
    lines.forEach((line) => {
      doc.text(line, 14, y);
      y += 5;
    });
    y += 6;
  }

  // Certificate details table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhes do Comprovante", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["Referência Interna", cdf.certNumber],
      ["Data de Emissão", cdf.date],
      ["MTR Vinculado", cdf.linkedMTR],
      ["Destinador Final", cdf.destinador],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date().toLocaleString("pt-BR");

  doc.setDrawColor(200, 200, 200);
  doc.line(14, pageHeight - 30, pageWidth - 14, pageHeight - 30);

  doc.setFillColor(255, 243, 205);
  doc.rect(14, pageHeight - 28, pageWidth - 28, 8, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 100, 0);
  doc.text("DOCUMENTO INTERNO — NÃO SUBSTITUI O CDF OFICIAL DO ÓRGÃO AMBIENTAL", pageWidth / 2, pageHeight - 24, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(`Gerado em ${now} — CicloMTR (comprovante interno)`, 14, pageHeight - 13);
  doc.text("Página 1 de 1", pageWidth - 14, pageHeight - 13, { align: "right" });

  doc.save(`${cdf.certNumber}.pdf`);
}
