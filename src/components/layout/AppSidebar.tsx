import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Settings, Plus, LogOut,
  ShieldAlert, Store, MapPin, Leaf, PackageCheck, ClipboardCheck, History, FileCheck, BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";

import logo from "@/assets/logo.png";

const generatorItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mtrs", label: "MTRs", icon: FileText },
  { to: "/historico-cargas", label: "Histórico de Cargas", icon: History },
  { to: "/auditoria", label: "Auditoria", icon: ShieldAlert },
  { to: "/controle-abc", label: "Controle ABC", icon: BarChart3 },
  { to: "/mercado", label: "Mercado", icon: Store },
  { to: "/mapa", label: "Mapa", icon: MapPin },
  { to: "/esg", label: "ESG", icon: Leaf },
  { to: "/cofre-cdf", label: "Cofre de CDFs", icon: FileCheck },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const receiverItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mercado", label: "Mercado", icon: Store },
  { to: "/mapa", label: "Mapa", icon: MapPin },
  { to: "/validar-carga", label: "Validar Carga", icon: ClipboardCheck },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { role } = useUserRole();

  const navItems = role === "receiver" ? receiverItems : generatorItems;
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar text-sidebar-foreground min-h-screen fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img src={logo} alt="CicloMTR" className="w-10 h-10" />
        <span className="text-xl font-bold tracking-tight">CicloMTR</span>
      </div>


      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6 space-y-2">
        {role === "generator" ? (
          <NavLink to="/novo-manifesto">
            <Button className="w-full gradient-primary shadow-primary font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Novo Manifesto
            </Button>
          </NavLink>
        ) : (
          <NavLink to="/receber-carga">
            <Button className="w-full gradient-primary shadow-primary font-semibold gap-2">
              <PackageCheck className="w-4 h-4" />
              Receber Carga
            </Button>
          </NavLink>
        )}
        <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
