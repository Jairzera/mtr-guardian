import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, X } from "lucide-react";
import { useManifestDraft } from "@/hooks/useManifestDraft";

const DraftBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasDraft, clearDraft } = useManifestDraft();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on pages other than the manifest form
    if (location.pathname === "/novo-manifesto") {
      setVisible(false);
    } else {
      setVisible(hasDraft());
    }
  }, [location.pathname, hasDraft]);

  // Monitor localStorage changes (from other tabs/windows or same window)
  useEffect(() => {
    const handleStorageChange = () => {
      if (location.pathname !== "/novo-manifesto") {
        setVisible(hasDraft());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location.pathname, hasDraft]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-primary text-primary-foreground rounded-lg shadow-lg px-4 py-3 max-w-sm">
        <FileText className="w-5 h-5 shrink-0" />
        <button
          onClick={() => navigate("/novo-manifesto")}
          className="text-sm font-medium text-left hover:underline"
        >
          Rascunho de MTR em andamento. Clique para continuar.
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearDraft();
            setVisible(false);
          }}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Descartar rascunho"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DraftBanner;
