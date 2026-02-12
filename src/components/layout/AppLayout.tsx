import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";
import DraftBanner from "@/components/manifest/DraftBanner";
import OfflineBanner from "@/components/OfflineBanner";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <OfflineBanner />
      <AppSidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <DraftBanner />
    </div>
  );
};

export default AppLayout;
