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
import { CreditCard, LogOut } from "lucide-react";

const PaymentFailedModal = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleChoosePlan = () => {
    navigate("/subscricao");
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
            <CreditCard className="w-7 h-7 text-destructive" />
          </div>
          <AlertDialogTitle className="text-lg">
            Falha no pagamento
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Verifique o método de pagamento. Caso contrário, a sua conta será
            bloqueada em 7 dias.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full h-12 gradient-primary shadow-primary text-primary-foreground font-semibold"
            onClick={handleChoosePlan}
          >
            Verificar Pagamento
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

export default PaymentFailedModal;
