import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
