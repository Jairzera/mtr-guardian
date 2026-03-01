import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanySettings {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  responsavel: string;
  phone: string;
}

const defaultSettings: CompanySettings = {
  razaoSocial: "",
  cnpj: "",
  endereco: "",
  responsavel: "",
  phone: "",
};

export function useCompanySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setSettings({
        razaoSocial: data.razao_social,
        cnpj: data.cnpj,
        endereco: data.endereco,
        responsavel: data.responsavel,
        phone: data.phone || "",
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async (s: CompanySettings) => {
    if (!user) return false;
    const payload = {
      user_id: user.id,
      razao_social: s.razaoSocial,
      cnpj: s.cnpj,
      endereco: s.endereco,
      responsavel: s.responsavel,
      phone: s.phone,
    } as any;

    // Try update first, then insert
    const { data: existing } = await supabase
      .from("company_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("company_settings")
        .update(payload)
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase
        .from("company_settings")
        .insert(payload));
    }

    if (error) {
      console.error("Error saving settings:", error);
      return false;
    }
    setSettings(s);
    return true;
  };

  return { settings, loading, saveSettings, refetch: fetchSettings };
}
