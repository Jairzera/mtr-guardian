import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import TrialExpiredModal from "./TrialExpiredModal";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const trial = useTrialStatus();

  if (loading || trial.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (trial.isExpired) {
    return <TrialExpiredModal />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
