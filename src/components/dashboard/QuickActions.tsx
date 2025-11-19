import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, Bot, Heart, Coins, Users, Video, 
  FileText, Calendar, Trophy, MessageSquare, GraduationCap
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: any;
  description: string;
  variant?: "default" | "outline" | "secondary";
}

const quickActions: QuickAction[] = [
  {
    label: "Browse Courses",
    href: "/courses",
    icon: BookOpen,
    description: "Explore our 12 Supreme Faculties",
    variant: "default"
  },
  {
    label: "Start AI Session",
    href: "/ai-tutors",
    icon: Bot,
    description: "Get personalized tutoring",
    variant: "default"
  },
  {
    label: "Join Study Group",
    href: "/study-groups",
    icon: Users,
    description: "Collaborate with peers",
    variant: "outline"
  },
  {
    label: "Daily Devotion",
    href: "/daily-devotion",
    icon: Heart,
    description: "Today's spiritual formation",
    variant: "outline"
  },
  {
    label: "XR Classroom",
    href: "/xr-classrooms",
    icon: Video,
    description: "Immersive learning experience",
    variant: "outline"
  },
  {
    label: "Submit Prayer",
    href: "/prayer-requests",
    icon: Heart,
    description: "Share your prayer needs",
    variant: "outline"
  },
  {
    label: "View Wallet",
    href: "/scrollcoin-wallet",
    icon: Coins,
    description: "Check ScrollCoin balance",
    variant: "secondary"
  },
  {
    label: "Community Feed",
    href: "/community-feed",
    icon: MessageSquare,
    description: "Connect with scholars",
    variant: "outline"
  },
  {
    label: "My Transcript",
    href: "/transcript",
    icon: GraduationCap,
    description: "View academic progress",
    variant: "outline"
  },
  {
    label: "Achievements",
    href: "/achievements",
    icon: Trophy,
    description: "View your badges",
    variant: "outline"
  },
  {
    label: "Calendar",
    href: "/events",
    icon: Calendar,
    description: "Upcoming events",
    variant: "outline"
  },
  {
    label: "Assessments",
    href: "/assessments",
    icon: FileText,
    description: "View assignments",
    variant: "outline"
  },
];

export const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts for your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Button
                variant={action.variant || "outline"}
                className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
