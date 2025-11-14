import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Star, BookOpen, Crown, Loader2, Calendar, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSpiritualMetrics } from "@/hooks/useSpiritualFormation";

console.info("✝️ Spiritual Formation — Christ governs all transformation");

export default function SpiritualFormation() {
  const { data: metrics, isLoading } = useSpiritualMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const spiritualMetrics = [
    { 
      label: "Divine Scorecard", 
      value: metrics?.divine_score || 0, 
      icon: Star,
      description: "Overall spiritual growth assessment"
    },
    { 
      label: "Prayer Consistency", 
      value: metrics?.prayer_streak || 0, 
      icon: Heart,
      description: "Daily prayer commitment maintained",
      unit: "days"
    },
    { 
      label: "Scripture Progress", 
      value: metrics?.scripture_progress || 0, 
      icon: BookOpen,
      description: "Regular Bible reading progress"
    },
    { 
      label: "Ministry Readiness", 
      value: metrics?.ministry_readiness || 0, 
      icon: Crown,
      description: "Preparation for kingdom service"
    },
  ];

  const growthAreas = [
    {
      area: "Prayer Life",
      currentLevel: metrics?.divine_score || 0,
      target: 95,
      description: "Consistency in daily prayer and intercession",
      icon: Heart
    },
    {
      area: "Biblical Knowledge",
      currentLevel: metrics?.scripture_progress || 0,
      target: 95,
      description: "Understanding of scripture and theological concepts",
      icon: BookOpen
    },
    {
      area: "Character Development",
      currentLevel: metrics?.ministry_readiness || 0,
      target: 98,
      description: "Christ-likeness in daily conduct and decisions",
      icon: Crown
    }
  ];

  return (
    <PageTemplate
      title="Spiritual Formation"
      description="Track your spiritual growth and Christ-centered development"
    >
      {/* Spiritual Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {spiritualMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const displayValue = metric.unit === 'days' 
            ? `${metric.value} ${metric.unit}` 
            : `${metric.value}%`;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{displayValue}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Growth Areas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Growth Areas</CardTitle>
              <CardDescription>Focus areas for continued development in Christ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {growthAreas.map((area, index) => {
                const Icon = area.icon;
                const progress = (area.currentLevel / area.target) * 100;
                
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{area.area}</h4>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {area.currentLevel}% / {area.target}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Daily Devotional Section */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Scripture</CardTitle>
              <CardDescription>Daily bread for spiritual nourishment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <blockquote className="border-l-4 border-primary pl-4 italic text-foreground">
                  "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope."
                </blockquote>
                <p className="text-sm text-muted-foreground">— Jeremiah 29:11 (ESV)</p>
                
                <div className="mt-6 space-y-2">
                  <h5 className="font-semibold text-sm">Reflection Prompts:</h5>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>How does knowing God has plans for you impact your daily decisions?</li>
                    <li>What areas of your life need surrender to God's perfect plan?</li>
                    <li>How can you demonstrate hope to others today?</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Actions & Resources */}
        <div className="space-y-6">
          {/* Prayer Journal */}
          <Card>
            <CardHeader>
              <CardTitle>Prayer Journal</CardTitle>
              <CardDescription>Record your conversations with God</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-semibold">{metrics?.prayer_streak || 0} days</span>
              </div>
              <Button className="w-full" asChild>
                <Link to="/prayer-requests">
                  <Heart className="mr-2 h-4 w-4" />
                  Open Prayer Journal
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Scripture Reading Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Scripture Reading</CardTitle>
              <CardDescription>Your Bible reading progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{metrics?.scripture_progress || 0}%</span>
                </div>
                <Progress value={metrics?.scripture_progress || 0} className="h-2" />
              </div>
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Continue Reading
              </Button>
            </CardContent>
          </Card>

          {/* Ministry Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Ministry Readiness</CardTitle>
              <CardDescription>Opportunities to serve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Readiness Level</span>
                  <span className="font-semibold">{metrics?.ministry_readiness || 0}%</span>
                </div>
                <Progress value={metrics?.ministry_readiness || 0} className="h-2" />
              </div>
              <Button variant="outline" className="w-full">
                <Target className="mr-2 h-4 w-4" />
                View Opportunities
              </Button>
            </CardContent>
          </Card>

          {/* Christ-Centered Message */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">✝️ Abiding in Christ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic">
                "Remain in me, as I also remain in you. No branch can bear fruit by itself; it must remain in the vine." - John 15:4
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Your spiritual formation is not about perfection, but about progressively becoming more like Christ through daily surrender and obedience.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Challenge */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>This Week's Challenge</CardTitle>
          <CardDescription>Practical steps for spiritual growth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm">Daily Prayer</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Spend 15 minutes each morning in prayer
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <BookOpen className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm">Scripture Meditation</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Read and meditate on one Psalm each day
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <Heart className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm">Acts of Service</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Perform at least one act of kindness daily
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
