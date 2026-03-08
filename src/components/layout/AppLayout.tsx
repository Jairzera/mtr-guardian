import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";
import DraftBanner from "@/components/manifest/DraftBanner";
import OfflineBanner from "@/components/OfflineBanner";
import CompanySwitcher from "./CompanySwitcher";
import ViewOnlyBanner from "./ViewOnlyBanner";
import { useUserRole } from "@/hooks/useUserRole";

const AppLayout = () => {
  const { role } = useUserRole();
  const isViewOnly = role === "client_viewer";

  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <AppSidebar />
      <div className="md:ml-64">
        {isViewOnly && <ViewOnlyBanner />}
        {!isViewOnly && (
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-2 flex items-center">
            <CompanySwitcher />
          </header>
        )}
        <main className="pb-20 md:pb-0 min-h-[calc(100vh-49px)]">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      {!isViewOnly && <DraftBanner />}
    </div>
  );
};

export default AppLayout;
