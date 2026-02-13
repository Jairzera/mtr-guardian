import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";

const TrialExpiredModal = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleChoosePlan = () => {
    navigate("/pricing");
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <AlertDialog open>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <ShieldAlert className="w-7 h-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg">
            Seu período de teste acabou
          </AlertDialogTitle>
          <AlertDialogDescription>
            Escolha um plano para continuar operando com segurança e
            conformidade ambiental.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full h-12 gradient-primary shadow-primary text-primary-foreground font-semibold"
            onClick={handleChoosePlan}
          >
            Ver Planos
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TrialExpiredModal;
