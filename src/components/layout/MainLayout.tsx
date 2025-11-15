import { Outlet } from "react-router-dom";
import { MainNavigation } from "./MainNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { Breadcrumbs } from "./Breadcrumbs";
import { InstitutionGuard } from "@/components/InstitutionGuard";

export const MainLayout = () => {
  return (
    <InstitutionGuard>
      <div className="min-h-screen bg-background">
        {/* Desktop Navigation */}
        <MainNavigation />
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        {/* Main Content */}
        <div className="lg:ml-64 pb-20 lg:pb-6 pt-16 lg:pt-0">
          <div className="w-full max-w-full px-3 sm:px-4 md:px-6 py-4 md:py-6 mx-auto">
            <Breadcrumbs />
            <Outlet />
          </div>
        </div>
      </div>
    </InstitutionGuard>
  );
};