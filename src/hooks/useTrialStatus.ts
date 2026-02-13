import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TrialStatus {
  isExpired: boolean;
  daysLeft: number;
  status: string; // 'trial' | 'active' | 'suspended'
  plan: string;
  loading: boolean;
}

export function useTrialStatus(): TrialStatus {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isExpired: false,
    daysLeft: 14,
    status: "trial",
    plan: "standard",
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setTrialStatus((s) => ({ ...s, loading: false }));
      return;
    }

    const fetch = async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("trial_start_date, subscription_status, plan")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setTrialStatus((s) => ({ ...s, loading: false }));
        return;
      }

      const status = (data as any).subscription_status as string ?? "trial";
      const plan = (data as any).plan as string ?? "standard";

      if (status === "active") {
        setTrialStatus({ isExpired: false, daysLeft: -1, status, plan, loading: false });
        return;
      }

      const trialStart = new Date((data as any).trial_start_date as string);
      const now = new Date();
      const diffMs = now.getTime() - trialStart.getTime();
      const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, 14 - daysPassed);
      const isExpired = daysPassed >= 14 && status !== "active";

      setTrialStatus({ isExpired, daysLeft, status, plan, loading: false });
    };

    fetch();
  }, [user]);

  return trialStatus;
}
