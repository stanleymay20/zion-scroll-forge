import { Outlet } from "react-router-dom";
import { MainNavigation } from "./MainNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { Breadcrumbs } from "./Breadcrumbs";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <MainNavigation />
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Main Content */}
      <div className="lg:ml-64 pb-16 lg:pb-0">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs />
          <Outlet />
        </div>
      </div>
    </div>
  );
};