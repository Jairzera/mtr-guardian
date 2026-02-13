import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "generator" | "receiver";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("generator");
  const [loading, setLoading] = useState(true);
  const [devOverride, setDevOverride] = useState<AppRole | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setRole(data.role as AppRole);
      } else {
        // Auto-assign default role via secure RPC
        await supabase.rpc("assign_user_role", { _user_id: user.id, _role: "generator" });
        setRole("generator");
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const toggleDevRole = useCallback(() => {
    setDevOverride((prev) => {
      const current = prev ?? role;
      return current === "generator" ? "receiver" : "generator";
    });
  }, [role]);

  const activeRole = devOverride ?? role;

  return { role: activeRole, loading, toggleDevRole, isDevOverride: devOverride !== null };
};
