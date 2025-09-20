import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Book, Users, Coins, Menu, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: Book },
  { label: "Community", href: "/community", icon: Users },
  { label: "ScrollCoin", href: "/scrollcoin", icon: Coins },
  { label: "Prayer", href: "/prayer-requests", icon: Heart },
];

export const MobileNavigation = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="lg:hidden">
      {/* Top Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-serif font-semibold text-primary">ScrollUniversity</span>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <div className="space-y-2">
                  {mobileNavItems.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive(item.href) && "bg-accent"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex justify-around py-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs transition-colors",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Content padding for mobile */}
      <div className="pt-16 pb-16">
        {/* This ensures content doesn't go under the fixed headers */}
      </div>
    </div>
  );
};