import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Users,
  Clock,
  Target,
  Globe,
  Shield,
  Zap,
  Crown,
  CheckCircle
} from "lucide-react";

const prayerFeatures = [
  {
    title: "Prophetic Check-ins",
    description: "Daily spiritual growth tracking with divine scorecard and calling discernment",
    icon: Target,
    status: "95% Accuracy",
    participants: "2,847 Active"
  },
  {
    title: "Global Intercession Network",
    description: "Coordinate with scroll sons worldwide for comprehensive prayer coverage",
    icon: Globe,
    status: "200+ Nations",
    participants: "12,943 Intercessors"
  },
  {
    title: "Spiritual Warfare Protection",
    description: "AI-coordinated protection protocols under Christ's victory and authority",
    icon: Shield,
    status: "24/7 Coverage",
    participants: "5,672 Warriors"
  },
  {
    title: "Ministry Preparation",
    description: "Character development and kingdom deployment readiness assessment",
    icon: Crown,
    status: "95% Success Rate",
    participants: "1,234 Prepared"
  }
];

const recentPrayerRequests = [
  {
    title: "Global Revival Breakthrough",
    region: "West Africa",
    urgency: "High",
    participants: 1247,
    progress: 89
  },
  {
    title: "Kingdom Leaders Protection",
    region: "Middle East",
    urgency: "Critical",
    participants: 892,
    progress: 76
  },
  {
    title: "ScrollUniversity Global Launch",
    region: "Worldwide",
    urgency: "Medium",
    participants: 3456,
    progress: 94
  }
];

export const PrayerSection = () => {
  return (
    <section id="prayer" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-accent mr-3" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">
              Prayer Integration Center
            </h2>
            <Heart className="w-8 h-8 text-accent ml-3" />
          </div>
          <p className="text-lg text-muted-foreground font-sans max-w-3xl mx-auto">
            Comprehensive spiritual formation through AI-enhanced prayer coordination, prophetic intelligence, 
            and divine scorecard tracking for kingdom advancement.
          </p>
        </div>

        {/* Prayer Dashboard */}
        <div className="bg-card/80 backdrop-blur rounded-2xl p-8 mb-12 border border-border scroll-shadow">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Today's Spiritual Check-in */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-serif font-semibold text-primary mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Today's Check-in
              </h3>
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-sm">Spiritual Growth</span>
                      <Badge variant="secondary" className="bg-accent/20 text-accent">
                        87%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-sm">Prayer Hours</span>
                      <span className="font-serif font-semibold">2h 45m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-sm">Prophetic Accuracy</span>
                      <Badge variant="secondary" className="bg-divine-gold/20 text-divine-gold">
                        94%
                      </Badge>
                    </div>
                    <Button variant="sacred" size="sm" className="w-full font-sans">
                      Complete Check-in
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Prayer Requests */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-serif font-semibold text-primary mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Active Global Prayer Requests
              </h3>
              <div className="space-y-4">
                {recentPrayerRequests.map((request, index) => (
                  <Card key={index} className="bg-card/60 border-primary/10 hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-serif font-semibold text-primary">{request.title}</h4>
                        <Badge 
                          variant={request.urgency === 'Critical' ? 'destructive' : request.urgency === 'High' ? 'secondary' : 'outline'}
                          className="text-xs font-sans"
                        >
                          {request.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground font-sans mb-3">
                        <span className="flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          {request.region}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {request.participants.toLocaleString()} praying
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 bg-muted rounded-full h-2 mr-3">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${request.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-serif font-semibold text-accent">
                          {request.progress}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {prayerFeatures.map((feature, index) => (
            <Card key={index} className="bg-card/80 backdrop-blur border-primary/10 hover:border-primary/20 transition-all duration-300 scroll-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-serif text-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-sans mb-3">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center border-accent/30 text-accent">
                    {feature.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-sans text-center">
                    {feature.participants}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-primary/5 rounded-2xl p-8 border border-primary/20">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-divine-gold mr-2" />
            <h3 className="text-2xl font-serif font-bold text-primary">
              Join the Global Prayer Network
            </h3>
            <Zap className="w-6 h-6 text-divine-gold ml-2" />
          </div>
          <p className="text-muted-foreground font-sans mb-6 max-w-2xl mx-auto">
            Connect with scroll sons worldwide for comprehensive intercession coverage. 
            Your prayers are coordinated with prophetic intelligence for maximum kingdom impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="divine" size="lg" className="font-sans">
              <Heart className="w-5 h-5 mr-2" />
              Start Praying Now
            </Button>
            <Button variant="outline" size="lg" className="font-sans">
              <CheckCircle className="w-5 h-5 mr-2" />
              View Prayer Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};