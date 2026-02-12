import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Building2, Recycle } from "lucide-react";
import logo from "@/assets/logo.gif";

type AppRole = "generator" | "receiver";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else {
        navigate("/");
      }
    } else {
      // Validate role selection for signup
      if (!selectedRole) {
        toast.error("Selecione um perfil de atuação para continuar");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      
      if (error) {
        toast.error(error.message);
        setLoading(false);
      } else if (data.user) {
        // Save role to user_roles table
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: selectedRole });
        
        if (roleError) {
          toast.error("Erro ao salvar perfil. Tente novamente.");
          setLoading(false);
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar.");
          setLoading(false);
          // Clear form
          setEmail("");
          setPassword("");
          setSelectedRole(null);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-card border-border/60 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="CicloMTR" className="w-16 h-16" />
          <h1 className="text-2xl font-bold text-foreground">CicloMTR</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
              <Input
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Senha</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-muted-foreground">Selecione seu Perfil de Atuação</Label>
              <RadioGroup value={selectedRole || ""} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                <div className="space-y-2">
                  {/* Generator Card */}
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === "generator"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 bg-card"
                  }`}>
                    <RadioGroupItem value="generator" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">🏭 Sou Gerador</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Indústrias, Fábricas e Obras que geram resíduos.
                      </p>
                    </div>
                  </label>

                  {/* Receiver Card */}
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRole === "receiver"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 bg-card"
                  }`}>
                    <RadioGroupItem value="receiver" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Recycle className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">♻️ Sou Destinador</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recicladoras, Aterros e Transportadoras.
                      </p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (!isLogin && !selectedRole)}
            className="w-full h-12 gradient-primary shadow-primary font-semibold"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLogin ? "Entrar" : "Criar Conta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setSelectedRole(null);
            }}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Faça login"}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
