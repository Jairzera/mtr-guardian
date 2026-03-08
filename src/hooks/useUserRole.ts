import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

export type AppRole = "generator" | "consultant";

interface UserRoleContextType {
  role: AppRole;
  loading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: "generator",
  loading: true,
});

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("generator");
  const [loading, setLoading] = useState(true);

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
        const r = data.role as string;
        setRole(r === "consultant" ? "consultant" : "generator");
      } else {
        await supabase.rpc("assign_user_role", { _user_id: user.id, _role: "generator" });
        setRole("generator");
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return React.createElement(
    UserRoleContext.Provider,
    { value: { role, loading } },
    children
  );
};

export const useUserRole = () => useContext(UserRoleContext);
