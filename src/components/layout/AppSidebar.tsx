import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, ShieldCheck, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.gif";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mtrs", label: "MTRs", icon: FileText },
  { to: "/certificados", label: "Certificados", icon: ShieldCheck },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar text-sidebar-foreground min-h-screen fixed left-0 top-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img src={logo} alt="CicloMTR" className="w-10 h-10" />
        <span className="text-xl font-bold tracking-tight">CicloMTR</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
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

      <div className="px-3 pb-6">
        <NavLink to="/novo-manifesto">
          <Button className="w-full gradient-primary shadow-primary font-semibold gap-2">
            <Plus className="w-4 h-4" />
            Novo Manifesto
          </Button>
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;
