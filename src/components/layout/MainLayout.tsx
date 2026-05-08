import { Outlet, useLocation } from "react-router-dom";
import { MainNavigation } from "./MainNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { Breadcrumbs } from "./Breadcrumbs";
import { BackButton } from "./BackButton";
import { InstitutionGuard } from "@/components/InstitutionGuard";

export const MainLayout = () => {
  const { pathname } = useLocation();
  const showBack = pathname !== "/dashboard" && pathname !== "/";
  const allowWithoutInstitution = ["/apply", "/orientation", "/matriculation"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const content = (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      <MobileNavigation />

      <main className="lg:ml-64 pb-20 lg:pb-8 pt-16 lg:pt-0">
        <div className="w-full max-w-7xl px-4 sm:px-6 py-5 sm:py-6 mx-auto">
          {showBack && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <BackButton />
            </div>
          )}
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );

  return (
    <InstitutionGuard allowWithoutInstitution={allowWithoutInstitution}>
      {content}
    </InstitutionGuard>
  );
};
