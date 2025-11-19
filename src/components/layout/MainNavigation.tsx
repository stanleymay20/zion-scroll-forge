import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, FileText, Bot, Zap, Settings, Activity, 
  ChevronDown, ChevronRight, BarChart3, Code, Workflow,
  GitBranch, Database, Monitor, Users, Cpu, BookOpen,
  GraduationCap, Heart, Coins, MessageSquare, Trophy,
  Calendar, Video, Briefcase, Shield, Bell
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { NotificationBell } from "@/components/NotificationBell";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";

interface NavSection {
  title: string;
  items: NavItem[];
  icon?: any;
  roles?: string[]; // Roles that can see this section
}

interface NavItem {
  label: string;
  href: string;
  icon?: any;
  badge?: string;
  roles?: string[]; // Roles that can see this item
}

// Navigation sections based on user roles
const getNavigationSections = (userRole: string): NavSection[] => {
  const allSections: NavSection[] = [
    {
      title: "Overview",
      icon: Home,
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
        { label: "My Courses", href: "/courses", icon: BookOpen },
        { label: "Calendar", href: "/events", icon: Calendar },
      ]
    },
    {
      title: "Learning",
      icon: GraduationCap,
      items: [
        { label: "Course Catalog", href: "/courses", icon: BookOpen },
        { label: "AI Tutors", href: "/ai-tutors", icon: Bot },
        { label: "XR Classrooms", href: "/xr-classrooms", icon: Video },
        { label: "Virtual Labs", href: "/virtual-labs", icon: Monitor },
        { label: "Assessments", href: "/assessments", icon: FileText },
        { label: "Study Groups", href: "/study-groups", icon: Users },
      ]
    },
    {
      title: "Spiritual Formation",
      icon: Heart,
      items: [
        { label: "Daily Devotion", href: "/daily-devotion", icon: Heart },
        { label: "Prayer Journal", href: "/prayer-journal", icon: FileText },
        { label: "Scripture Memory", href: "/scripture-memory", icon: BookOpen },
        { label: "Prayer Requests", href: "/prayer-requests", icon: Heart },
        { label: "Spiritual Mentor", href: "/spiritual-mentor", icon: Users },
      ]
    },
    {
      title: "Community",
      icon: Users,
      items: [
        { label: "Community Feed", href: "/community-feed", icon: Activity },
        { label: "Messaging", href: "/messaging", icon: MessageSquare },
        { label: "Fellowship Rooms", href: "/fellowship-rooms", icon: Users },
        { label: "Testimonies", href: "/testimonies", icon: Heart },
      ]
    },
    {
      title: "ScrollCoin Economy",
      icon: Coins,
      items: [
        { label: "My Wallet", href: "/scrollcoin-wallet", icon: Coins },
        { label: "Earn ScrollCoin", href: "/scrollcoin", icon: Trophy },
        { label: "Redemption Store", href: "/redemption-store", icon: Briefcase },
        { label: "Leaderboard", href: "/scrollcoin-leaderboard", icon: Trophy },
      ]
    },
    {
      title: "Academic Progress",
      icon: GraduationCap,
      items: [
        { label: "Transcript", href: "/transcript", icon: FileText },
        { label: "Degree Audit", href: "/degree-audit", icon: GraduationCap },
        { label: "Achievements", href: "/achievements", icon: Trophy },
        { label: "Scholarships", href: "/scholarships", icon: Coins },
      ]
    },
    {
      title: "Faculty Tools",
      icon: Users,
      roles: ["faculty", "admin"],
      items: [
        { label: "Faculty Dashboard", href: "/faculty", icon: Home, roles: ["faculty", "admin"] },
        { label: "Course Management", href: "/faculty/admin", icon: BookOpen, roles: ["faculty", "admin"] },
        { label: "Gradebook", href: "/faculty/gradebook", icon: FileText, roles: ["faculty", "admin"] },
        { label: "Faculty Analytics", href: "/faculty-analytics", icon: BarChart3, roles: ["faculty", "admin"] },
      ]
    },
    {
      title: "Administration",
      icon: Shield,
      roles: ["admin"],
      items: [
        { label: "Admin Dashboard", href: "/admin", icon: Shield, roles: ["admin"] },
        { label: "Admissions Review", href: "/admin/admissions", icon: Users, roles: ["admin"] },
        { label: "Analytics", href: "/analytics/dashboard", icon: BarChart3, roles: ["admin"] },
        { label: "Content Generation", href: "/admin/content-generation", icon: Bot, roles: ["admin"] },
        { label: "Institutions", href: "/admin/institutions", icon: Monitor, roles: ["admin"] },
        { label: "System Status", href: "/system-status", icon: Activity, roles: ["admin"] },
      ]
    },
  ];

  // Filter sections and items based on user role
  return allSections
    .filter(section => !section.roles || section.roles.includes(userRole))
    .map(section => ({
      ...section,
      items: section.items.filter(item => !item.roles || item.roles.includes(userRole))
    }))
    .filter(section => section.items.length > 0);
};

export const MainNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Overview", "Learning"]);

  // Get user role from metadata or default to student
  const userRole = user?.user_metadata?.role || "student";
  const navigationSections = getNavigationSections(userRole);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionTitle)
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col z-40">
      {/* Logo Header */}
      <div className="p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center space-x-3">
          <img src={scrollLogo} alt="ScrollUniversity" className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-serif font-bold text-primary">ScrollUniversity</h1>
            <p className="text-xs text-muted-foreground font-sans">Veritas et Sapientia</p>
          </div>
        </Link>
      </div>

      {/* User Profile & Notifications */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <UserProfileDropdown />
        <NotificationBell />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-between text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => toggleSection(section.title)}
              >
                <div className="flex items-center space-x-2">
                  {section.icon && <section.icon className="h-4 w-4" />}
                  <span>{section.title}</span>
                </div>
                {expandedSections.includes(section.title) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              {expandedSections.includes(section.title) && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => (
                    <Link key={item.href} to={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm",
                          isActive(item.href) 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div className="flex items-center space-x-2">
                          {item.icon && <item.icon className="h-4 w-4" />}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link to="/ai-tutors">
            <Button size="sm" className="w-full">
              <Bot className="h-4 w-4 mr-2" />
              Start AI Session
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};