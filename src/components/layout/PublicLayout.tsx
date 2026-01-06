import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "./Breadcrumbs";

/**
 * PublicLayout - Layout for publicly accessible pages (courses, faculties, degrees)
 * Does NOT require authentication or institution context
 */
export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
};
