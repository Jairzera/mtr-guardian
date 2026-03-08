import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, ScanLine, Map, User, FileText, FileCheck } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const BottomNav = () => {
  const location = useLocation();
  const { role } = useUserRole();
  const isViewOnly = role === "client_viewer";

  const linkClass = (path: string) =>
    `flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors min-w-[44px] min-h-[44px] py-1 ${
      location.pathname === path
        ? "text-primary"
        : "text-muted-foreground active:text-primary/70"
    }`;

  if (isViewOnly) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end justify-around h-16">
          <NavLink to="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard className="w-6 h-6" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/mtrs" className={linkClass("/mtrs")}>
            <FileText className="w-6 h-6" />
            <span>MTRs</span>
          </NavLink>
          <NavLink to="/cofre-cdf" className={linkClass("/cofre-cdf")}>
            <FileCheck className="w-6 h-6" />
            <span>CDFs</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around h-16">
        <NavLink to="/dashboard" className={linkClass("/dashboard")}>
          <LayoutDashboard className="w-6 h-6" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/mercado" className={linkClass("/mercado")}>
          <ShoppingCart className="w-6 h-6" />
          <span>Mercado</span>
        </NavLink>

        <NavLink to="/novo-manifesto" className="flex flex-col items-center -mt-5">
          <div className="w-14 h-14 rounded-full gradient-primary shadow-primary flex items-center justify-center active:scale-95 transition-transform">
            <ScanLine className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-xs font-semibold text-primary mt-1">Scan</span>
        </NavLink>

        <NavLink to="/mapa" className={linkClass("/mapa")}>
          <Map className="w-6 h-6" />
          <span>Mapa</span>
        </NavLink>

        <NavLink to="/configuracoes" className={linkClass("/configuracoes")}>
          <User className="w-6 h-6" />
          <span>Perfil</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
