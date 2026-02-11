import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const ExportDropdown = ({ onExportCSV, onExportPDF }: ExportDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown className="w-4 h-4" />
          Exportar Relatório
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          Baixar Excel (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Baixar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
