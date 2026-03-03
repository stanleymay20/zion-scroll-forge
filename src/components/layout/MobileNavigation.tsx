import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Home, BookOpen, Bot, Heart, Menu, Settings, 
  Users, Coins, GraduationCap, MessageSquare, Trophy, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationBell } from "@/components/NotificationBell";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";
import { useState } from "react";

const bottomNavItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "AI Tutor", href: "/ai-tutors", icon: Bot },
  { label: "Community", href: "/community-feed", icon: Users },
  { label: "More", href: "#", icon: Menu, isMenu: true },
];

const getFullMenuItems = (roles: string[]) => {
  const items = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "My Courses", href: "/courses", icon: BookOpen },
    { label: "AI Tutors", href: "/ai-tutors", icon: Bot },
    { label: "Study Groups", href: "/study-groups", icon: Users },
    { label: "Spiritual Formation", href: "/spiritual-formation", icon: Heart },
    { label: "Community Feed", href: "/community-feed", icon: MessageSquare },
    { label: "ScrollGold Wallet", href: "/scrollgold-wallet", icon: Coins },
    { label: "Achievements", href: "/achievements", icon: Trophy },
    { label: "Transcript", href: "/transcript", icon: GraduationCap },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (roles.includes("faculty") || roles.includes("admin")) {
    items.push({ label: "Faculty Dashboard", href: "/faculty", icon: Users });
  }
  if (roles.includes("admin")) {
    items.push({ label: "Admin Dashboard", href: "/admin", icon: Shield });
  }

  return items;
};

export const MobileNavigation = () => {
  const location = useLocation();
  const { roles } = useUserRoles();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fullMenuItems = getFullMenuItems(roles);
  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={scrollLogo} alt="ScrollUniversity" className="h-8 w-8" />
            <span className="font-serif font-semibold text-primary text-sm">ScrollUniversity</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-serif font-semibold text-primary">Menu</h2>
                      <UserProfileDropdown />
                    </div>
                  </div>

                  <ScrollArea className="flex-1 py-2">
                    <div className="px-2 space-y-0.5">
                      {fullMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors touch-target",
                              isActive(item.href)
                                ? "bg-accent/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-muted/50"
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {item.label}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-3 border-t border-border/50">
                    <Link to="/ai-tutors" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full font-sans text-sm" size="sm">
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

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 safe-bottom">
        <div className="flex justify-around items-center h-14 px-1">
          {bottomNavItems.map((item) => {
            if (item.isMenu) {
              return (
                <button
                  key="menu"
                  onClick={() => setIsMenuOpen(true)}
                  className="flex flex-col items-center justify-center py-1.5 px-2 text-muted-foreground"
                >
                  <item.icon className="h-5 w-5 mb-0.5" />
                  <span className="text-[10px] font-sans">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 transition-colors",
                  isActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 mb-0.5", isActive(item.href) && "text-primary")} />
                <span className={cn(
                  "text-[10px] font-sans",
                  isActive(item.href) && "font-semibold"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
