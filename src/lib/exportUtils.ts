import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanySettings } from "@/hooks/useCompanySettings";

interface ExportColumn {
  header: string;
  key: string;
}

interface ExportOptions {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  company?: CompanySettings;
  logoBase64?: string;
}

// ── CSV ────────────────────────────────────────────────────────────────
export function exportCSV(options: ExportOptions) {
  const { columns, rows, title } = options;
  const headers = columns.map((c) => c.header);
  const csvRows = rows.map((row) =>
    columns.map((c) => {
      const val = String(row[c.key] ?? "");
      // Escape quotes
      return `"${val.replace(/"/g, '""')}"`;
    })
  );

  const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${title}.csv`);
}

// ── PDF ────────────────────────────────────────────────────────────────
export function exportPDF(options: ExportOptions) {
  const { title, columns, rows, company } = options;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header – Logo text
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 139, 34); // green
  doc.text("CicloMTR", 14, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Compliance Ambiental", 14, y + 5);
  y += 14;

  // Company info
  if (company && company.razaoSocial) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Empresa Geradora", 14, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const lines = [
      company.razaoSocial,
      company.cnpj ? `CNPJ: ${company.cnpj}` : "",
      company.endereco,
      company.responsavel ? `Resp. Técnico: ${company.responsavel}` : "",
    ].filter(Boolean);
    lines.forEach((line) => {
      doc.text(line, 14, y);
      y += 4;
    });
    y += 2;
  }

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Title
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y);
  y += 8;

  // Table
  autoTable(doc, {
    startY: y,
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => String(row[c.key] ?? ""))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  const now = new Date().toLocaleString("pt-BR");
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(130, 130, 130);
    doc.text(`Gerado em ${now} - CicloMTR Compliance`, 14, pageHeight - 8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }

  doc.save(`${title}.pdf`);
}

// ── Helper ─────────────────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
