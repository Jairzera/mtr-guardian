import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WasteCode = {
  id: string;
  code: string;
  description: string;
  class: string;
  requires_special_transport: boolean;
};

export function useWasteCodes() {
  const [wasteCodes, setWasteCodes] = useState<WasteCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("waste_codes_ibama")
        .select("*")
        .order("code");
      if (!error && data) setWasteCodes(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { wasteCodes, loading };
}
