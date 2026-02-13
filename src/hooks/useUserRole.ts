import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

export type AppRole = "generator" | "receiver";

interface UserRoleContextType {
  role: AppRole;
  loading: boolean;
  toggleDevRole: () => void;
  isDevOverride: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: "generator",
  loading: true,
  toggleDevRole: () => {},
  isDevOverride: false,
});

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
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

  return React.createElement(
    UserRoleContext.Provider,
    { value: { role: activeRole, loading, toggleDevRole, isDevOverride: devOverride !== null } },
    children
  );
};

export const useUserRole = () => useContext(UserRoleContext);
