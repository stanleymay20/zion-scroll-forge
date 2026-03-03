import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";
import { Breadcrumbs } from "./Breadcrumbs";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-6xl">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
};
