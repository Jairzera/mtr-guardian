import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ManagedCompany {
  id: string;
  cnpj: string;
  razao_social: string;
  is_active: boolean;
  last_activity_at: string | null;
  created_at: string;
}

export function useManagedCompanies() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["managed_companies", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managed_companies" as any)
        .select("*")
        .eq("owner_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ManagedCompany[];
    },
  });

  const addCompany = useMutation({
    mutationFn: async (company: { cnpj: string; razao_social: string }) => {
      const { error } = await supabase
        .from("managed_companies" as any)
        .insert({ owner_user_id: user!.id, ...company } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_companies"] }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("managed_companies" as any)
        .update({ is_active } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_companies"] }),
  });

  const removeCompany = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("managed_companies" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["managed_companies"] }),
  });

  const activeCount = (query.data || []).filter((c) => c.is_active).length;

  return { companies: query.data || [], isLoading: query.isLoading, activeCount, addCompany, toggleActive, removeCompany };
}
