import { useCallback } from "react";

const DRAFT_KEY = "mtr_draft";

export interface ManifestDraft {
  step: number;
  photoUrl: string | null;
  selectedWasteCodeId: string;
  aiSuggested: boolean;
  formData: {
    wasteClass: string;
    quantity: string;
    unit: string;
    transporterName: string;
    transporterCnpj: string;
    destinationType: string;
    physicalState: string;
    packaging: string;
    destinationCompanyName: string;
    destinationCnpj: string;
    destinationLicense: string;
    driverName: string;
    vehiclePlate: string;
    transportDate: string;
  };
  expirationDate: string | null;
  savedAt: number;
}

export function useManifestDraft() {
  const saveDraft = useCallback((draft: Omit<ManifestDraft, "savedAt">) => {
    const hasData =
      draft.step > 0 ||
      draft.selectedWasteCodeId ||
      draft.formData.quantity ||
      draft.formData.transporterCnpj;

    if (!hasData) return;

    const payload: ManifestDraft = { ...draft, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, []);

  const loadDraft = useCallback((): ManifestDraft | null => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft: ManifestDraft = JSON.parse(raw);
      if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return draft;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const hasDraft = useCallback((): boolean => {
    return loadDraft() !== null;
  }, [loadDraft]);

  return { saveDraft, loadDraft, clearDraft, hasDraft };
}
