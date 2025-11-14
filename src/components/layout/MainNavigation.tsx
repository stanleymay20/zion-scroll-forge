import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, Book, Users, Coins, GraduationCap, Brain, Microscope, 
  Trophy, Briefcase, Search, MessageSquare, Heart, Settings,
  ChevronDown, ChevronRight, BarChart3, GitCompare
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import scrollLogo from "@/assets/scroll-university-logo-optimized.png";
import { NotificationDropdown } from "./NotificationDropdown";
import { InstitutionSwitcher } from "@/components/InstitutionSwitcher";

interface NavSection {
  title: string;
  items: NavItem[];
  icon?: any;
}

interface NavItem {
  label: string;
  href: string;
  icon?: any;
  badge?: string;
}

const navigationSections: NavSection[] = [
  {
    title: "Dashboard",
    icon: Home,
    items: [
      { label: "Home Dashboard", href: "/dashboard", icon: Home },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Faculty Gallery", href: "/faculties", icon: GraduationCap },
      { label: "My Profile", href: "/profile", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ]
  },
  {
    title: "Learning",
    icon: Book,
    items: [
      { label: "Course Catalog", href: "/courses", icon: Book },
      { label: "Degree Programs", href: "/degrees", icon: GraduationCap },
      { label: "AI Tutors", href: "/ai-tutors", icon: Brain },
      { label: "Office Hours", href: "/ai-tutors/office-hours", icon: Users },
      { label: "Tutor Analytics", href: "/ai-tutors/analytics", icon: BarChart3 },
      { label: "Customize Avatar", href: "/avatar-customization", icon: Users },
      { label: "Content Generation", href: "/content-generation", icon: Settings },
      { label: "XR Classrooms", href: "/xr-classrooms", icon: Microscope },
      { label: "Virtual Labs", href: "/virtual-labs", icon: Microscope },
      { label: "Assessments", href: "/assessments", icon: Trophy },
    ]
  },
  {
    title: "Spiritual Formation",
    icon: Heart,
    items: [
      { label: "Spiritual Dashboard", href: "/spiritual-formation", icon: Heart },
      { label: "Divine Scorecard", href: "/divine-scorecard", icon: Trophy },
      { label: "Prophetic Check-ins", href: "/prophetic-checkins", icon: MessageSquare },
      { label: "Prayer Center", href: "/prayer-requests", icon: Heart },
      { label: "Calling Discernment", href: "/calling-discernment", icon: Search },
    ]
  },
  {
    title: "Community",
    icon: Users,
    items: [
      { label: "Community Hub", href: "/community", icon: Users },
      { label: "Discussion Forums", href: "/forums", icon: MessageSquare },
      { label: "Study Groups", href: "/study-groups", icon: Users },
      { label: "Mentorship", href: "/mentorship", icon: Users },
      { label: "Collaborative Projects", href: "/projects", icon: Briefcase },
    ]
  },
  {
    title: "ScrollCoin Economy",
    icon: Coins,
    items: [
      { label: "ScrollCoin Wallet", href: "/scrollcoin", icon: Coins },
      { label: "Marketplace", href: "/marketplace", icon: Briefcase },
      { label: "ScrollBadges", href: "/badges", icon: Trophy },
      { label: "Achievements", href: "/achievements", icon: Trophy },
    ]
  },
  {
    title: "Faculties",
    icon: GraduationCap,
    items: [
      { label: "All Faculties", href: "/faculties", icon: GraduationCap },
      { label: "Compare Faculties", href: "/faculties/compare", icon: GitCompare },
      { label: "ScrollMedicine", href: "/faculties/scroll-medicine", icon: Heart },
      { label: "Prophetic Law", href: "/faculties/prophetic-law", icon: Briefcase },
      { label: "Scroll Economy", href: "/faculties/scroll-economy", icon: Coins },
      { label: "Edenic Science", href: "/faculties/edenic-science", icon: Microscope },
      { label: "GeoProphetic Intelligence", href: "/faculties/geoprophetic-intelligence", icon: Brain },
      { label: "Scroll Theology", href: "/faculties/scroll-theology", icon: Book },
      { label: "Scroll AI", href: "/faculties/scroll-ai", icon: Brain },
      { label: "Scroll Engineering", href: "/faculties/scroll-engineering", icon: Settings },
      { label: "Scroll Arts", href: "/faculties/scroll-arts", icon: Book },
      { label: "Scroll Business", href: "/faculties/scroll-business", icon: Briefcase },
      { label: "Scroll Education", href: "/faculties/scroll-education", icon: GraduationCap },
      { label: "Scroll Communications", href: "/faculties/scroll-communications", icon: MessageSquare },
    ]
  },
  {
    title: "Career Development",
    icon: Briefcase,
    items: [
      { label: "Career Pathways", href: "/career-pathways", icon: Briefcase },
      { label: "Job Board", href: "/job-board", icon: Search },
      { label: "Resume Builder", href: "/resume-builder", icon: Briefcase },
      { label: "Interview Prep", href: "/interview-prep", icon: MessageSquare },
    ]
  },
  {
    title: "Research & Innovation",
    icon: Microscope,
    items: [
      { label: "Research Hub", href: "/research", icon: Microscope },
      { label: "Virtual Labs", href: "/research/labs", icon: Microscope },
      { label: "Publications", href: "/research/publications", icon: Book },
      { label: "Innovation Challenges", href: "/innovation-challenges", icon: Trophy },
    ]
  },
  {
    title: "Support & Help",
    icon: MessageSquare,
    items: [
      { label: "Help Center", href: "/help", icon: MessageSquare },
      { label: "Accessibility", href: "/accessibility", icon: Heart },
      { label: "Technical Support", href: "/technical-support", icon: Settings },
      { label: "Contact Us", href: "/contact", icon: MessageSquare },
    ]
  }
];

export const MainNavigation = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Dashboard", "Learning"]);

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
    <div className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col">
      {/* Logo Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src={scrollLogo} alt="ScrollUniversity Logo" className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-serif font-semibold text-primary">ScrollUniversity</h1>
              <p className="text-xs text-muted-foreground font-sans">Veritas et Sapientia</p>
            </div>
          </Link>
          <NotificationDropdown />
        </div>
        <InstitutionSwitcher />
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
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Button size="sm" className="w-full">
            <Heart className="h-4 w-4 mr-2" />
            Quick Prayer
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Coins className="h-4 w-4 mr-2" />
            1,247 ScrollCoins
          </Button>
        </div>
      </div>
    </div>
  );
};