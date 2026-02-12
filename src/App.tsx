import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MTRList from "./pages/MTRList";
import NewManifest from "./pages/NewManifest";
import Certificados from "./pages/Certificados";
import Configuracoes from "./pages/Configuracoes";
import Auditoria from "./pages/Auditoria";
import Mercado from "./pages/Mercado";
import Mapa from "./pages/Mapa";
import ESG from "./pages/ESG";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/mtrs" element={<MTRList />} />
                <Route path="/novo-manifesto" element={<NewManifest />} />
                <Route path="/certificados" element={<Certificados />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route path="/mercado" element={<Mercado />} />
                <Route path="/mapa" element={<Mapa />} />
                <Route path="/esg" element={<ESG />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
