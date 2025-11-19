import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, BookOpen, Bot, Heart, Menu, Settings, 
  Users, Coins, GraduationCap, MessageSquare, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationBell } from "@/components/NotificationBell";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";
import { useState } from "react";

const getMobileNavItems = (userRole: string) => {
  const baseItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "AI Tutors", href: "/ai-tutors", icon: Bot },
    { label: "Community", href: "/community-feed", icon: Users },
    { label: "More", href: "#", icon: Menu, isMenu: true },
  ];

  return baseItems;
};

const getFullMenuItems = (userRole: string) => {
  const items = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "AI Tutors", href: "/ai-tutors", icon: Bot },
    { label: "Study Groups", href: "/study-groups", icon: Users },
    { label: "Spiritual Formation", href: "/spiritual-formation", icon: Heart },
    { label: "Community Feed", href: "/community-feed", icon: MessageSquare },
    { label: "ScrollCoin Wallet", href: "/scrollcoin-wallet", icon: Coins },
    { label: "Achievements", href: "/achievements", icon: Trophy },
    { label: "Transcript", href: "/transcript", icon: GraduationCap },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  // Add faculty/admin items
  if (userRole === "faculty" || userRole === "admin") {
    items.push({ label: "Faculty Dashboard", href: "/faculty", icon: Users });
  }
  if (userRole === "admin") {
    items.push({ label: "Admin Dashboard", href: "/admin", icon: Settings });
  }

  return items;
};

export const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userRole = user?.user_metadata?.role || "student";
  const mobileNavItems = getMobileNavItems(userRole);
  const fullMenuItems = getFullMenuItems(userRole);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="lg:hidden">
      {/* Top Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src={scrollLogo} alt="ScrollUniversity" className="h-8 w-8" />
            <span className="font-serif font-semibold text-primary">ScrollUniversity</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* User Profile Section */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <UserProfileDropdown />
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {fullMenuItems.map((item) => (
                        <Link 
                          key={item.href} 
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
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
                  </ScrollArea>

                  {/* Quick Actions */}
                  <div className="p-4 border-t">
                    <Link to="/ai-tutors" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full mb-2">
                        <Bot className="h-4 w-4 mr-2" />
                        Start AI Session
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex justify-around py-2">
          {mobileNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <Sheet key="menu" open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center py-2 px-3 text-xs transition-colors",
                        "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5 mb-1" />
                      <span>{item.label}</span>
                    </button>
                  </SheetTrigger>
                </Sheet>
              );
            }

            return (
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
            );
          })}
        </div>
      </div>

      {/* Content padding for mobile */}
      <div className="pt-16 pb-16">
        {/* This ensures content doesn't go under the fixed headers */}
      </div>
    </div>
  );
};