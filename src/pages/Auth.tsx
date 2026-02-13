import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2, Recycle, ArrowLeft } from "lucide-react";
import { formatCNPJ, isValidCNPJ } from "@/lib/cnpj";
import { formatPhone, isValidPhone } from "@/lib/phone";
import logo from "@/assets/logo.gif";

type AppRole = "generator" | "receiver";
type Step = "role" | "form";

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("role");
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    // Small delay for visual feedback before showing form
    setTimeout(() => setStep("form"), 200);
  };

  const handleBack = () => {
    setStep("role");
  };

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
      return;
    }

    // Signup validations
    if (!razaoSocial.trim()) {
      toast.error("Informe a Razão Social");
      setLoading(false);
      return;
    }
    if (!isValidCNPJ(cnpj)) {
      toast.error("CNPJ inválido. Informe os 14 dígitos.");
      setLoading(false);
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Telefone inválido. Informe DDD + número.");
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
      return;
    }

    if (data.user) {
      // Save role via secure RPC (no direct INSERT policy)
      const { error: roleError } = await supabase
        .rpc("assign_user_role", { _user_id: data.user.id, _role: selectedRole! });

      if (roleError) {
        toast.error("Erro ao salvar perfil. Tente novamente.");
        setLoading(false);
        return;
      }

      // Save company settings
      const { error: companyError } = await supabase
        .from("company_settings")
        .insert({
          user_id: data.user.id,
          razao_social: razaoSocial.trim(),
          cnpj: cnpj.replace(/\D/g, ""),
          phone: phone.replace(/\D/g, ""),
          trial_start_date: new Date().toISOString(),
          subscription_status: "trial",
          plan: selectedRole === "receiver" ? "corporate" : "standard",
        } as any);

      if (companyError) {
        console.error("Error saving company settings:", companyError);
      }

      toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      setLoading(false);
      setEmail("");
      setPassword("");
      setRazaoSocial("");
      setCnpj("");
      setPhone("");
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="CicloMTR" className="w-16 h-16" />
          <h1 className="text-2xl font-bold text-foreground">CicloMTR</h1>
        </div>

        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-center text-sm text-muted-foreground">
              Como você atua?
            </p>

            <button
              type="button"
              onClick={() => handleRoleSelect("generator")}
              className={`w-full flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                selectedRole === "generator"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <Building2 className="w-8 h-8 text-primary mt-0.5 shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-foreground text-base">
                  🏭 Sou Gerador de Resíduos
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Para Indústrias, Obras e Comércios.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect("receiver")}
              className={`w-full flex items-start gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all ${
                selectedRole === "receiver"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
            >
              <Recycle className="w-8 h-8 text-primary mt-0.5 shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-foreground text-base">
                  ♻️ Sou Destinador / Transportador
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Para Recicladoras, Aterros e Logística.
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Login/Signup Form */}
        {step === "form" && (
          <Card className="p-6 shadow-card border-border/60 space-y-5 animate-fade-in">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Acesse sua conta" : "Crie sua conta"} como{" "}
                <span className="font-semibold text-foreground">
                  {selectedRole === "generator" ? "🏭 Gerador" : "♻️ Destinador"}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Signup-only fields */}
              {!isLogin && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Razão Social *
                    </Label>
                    <Input
                      className="mt-1.5"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      required
                      placeholder="Nome da empresa"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      CNPJ *
                    </Label>
                    <Input
                      className="mt-1.5"
                      value={cnpj}
                      onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      WhatsApp / Telefone *
                    </Label>
                    <Input
                      className="mt-1.5"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      required
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              )}

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

              <Button
                type="submit"
                disabled={loading}
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
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Cadastre-se" : "Faça login"}
              </button>
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
