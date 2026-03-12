import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UserRoleProvider } from "./hooks/useUserRole";
import { ActiveCompanyProvider } from "./hooks/useActiveCompany";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MTRList from "./pages/MTRList";
import HistoricoCargas from "./pages/HistoricoCargas";
import NewManifest from "./pages/NewManifest";
import CDFVault from "./pages/CDFVault";
import Relatorios from "./pages/Relatorios";
import Licencas from "./pages/Licencas";
import Configuracoes from "./pages/Configuracoes";
import Auditoria from "./pages/Auditoria";
import ControleABC from "./pages/ControleABC";
import Subscricao from "./pages/Subscricao";

import Mapa from "./pages/Mapa";
import ESG from "./pages/ESG";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import PublicTracking from "./pages/PublicTracking";
import NotFound from "./pages/NotFound";
import SuccessIntegration from "./pages/SuccessIntegration";
import RoleSelection from "./pages/RoleSelection";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <UserRoleProvider>
              <ActiveCompanyProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/escolher-perfil" element={<RoleSelection />} />
                  <Route path="/sucesso" element={<SuccessIntegration />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mtrs" element={<MTRList />} />
                    <Route path="/historico-cargas" element={<HistoricoCargas />} />
                    <Route path="/novo-manifesto" element={<NewManifest />} />
                    <Route path="/cofre-cdf" element={<CDFVault />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/auditoria" element={<Auditoria />} />
                    <Route path="/controle-abc" element={<ControleABC />} />
                    
                    <Route path="/mapa" element={<Mapa />} />
                    <Route path="/esg" element={<ESG />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/licencas" element={<Licencas />} />
                    <Route path="/subscricao" element={<Subscricao />} />
                  </Route>
                  <Route path="/tracking/:id" element={<PublicTracking />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ActiveCompanyProvider>
            </UserRoleProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
