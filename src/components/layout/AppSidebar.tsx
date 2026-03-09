import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Settings, Plus, LogOut,
  ShieldAlert, Store, MapPin, Leaf, History, FileCheck, BarChart3, ClipboardList, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";
import { ScrollArea } from "@/components/ui/scroll-area";

const allNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["generator", "consultant", "client_viewer"] },
  { to: "/mtrs", label: "MTRs", icon: FileText, roles: ["generator", "consultant", "client_viewer"] },
  { to: "/historico-cargas", label: "Histórico de Cargas", icon: History, roles: ["generator", "consultant"] },
  { to: "/auditoria", label: "Auditoria", icon: ShieldAlert, roles: ["generator", "consultant"] },
  { to: "/controle-abc", label: "Controle ABC", icon: BarChart3, roles: ["generator", "consultant"] },
  
  { to: "/mapa", label: "Mapa", icon: MapPin, roles: ["generator", "consultant"] },
  { to: "/esg", label: "ESG", icon: Leaf, roles: ["generator"] },
  { to: "/cofre-cdf", label: "Cofre de CDFs", icon: FileCheck, roles: ["generator", "consultant", "client_viewer"] },
  { to: "/licencas", label: "Licenças / CADRIs", icon: ShieldCheck, roles: ["generator", "consultant"] },
  { to: "/relatorios", label: "Relatórios Oficiais", icon: ClipboardList, roles: ["generator", "consultant"] },
  { to: "/subscricao", label: "Subscrição & Parceiro", icon: Store, roles: ["consultant"] },
  { to: "/configuracoes", label: "Configurações", icon: Settings, roles: ["generator", "consultant"] },
];

const roleLabelMap: Record<string, string> = {
  generator: "🏭 Gerador",
  consultant: "📋 Consultor",
  client_viewer: "👁️ Visualizador",
};

const AppSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { role, toggleDevRole, isDevOverride } = useUserRole();

  const navItems = allNavItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar text-sidebar-foreground min-h-screen fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img src={logo} alt="CicloMTR" className="w-10 h-10" />
        <span className="text-xl font-bold tracking-tight">CicloMTR</span>
      </div>

      <ScrollArea className="flex-1 [&>[data-radix-scroll-area-viewport]]:max-h-[calc(100vh-220px)]">
        <nav className="px-3 py-4 space-y-1">
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
      </ScrollArea>

      <div className="px-3 pb-6 space-y-2">
        {role !== "client_viewer" && (
          <NavLink to="/novo-manifesto">
            <Button className="w-full gradient-primary shadow-primary font-semibold gap-2">
              <Plus className="w-4 h-4" />
              Novo Manifesto
            </Button>
          </NavLink>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDevRole}
          className="w-full justify-center gap-2 text-xs"
        >
          {isDevOverride && <Badge variant="secondary" className="text-[10px] px-1 py-0">DEV</Badge>}
          {roleLabelMap[role] || role} — Trocar
        </Button>
        <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
