import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Star, Clock, Calendar, BookOpen, Users, 
  Target, TrendingUp, CheckCircle, Award, Flame, Crown
} from "lucide-react";
import { Link } from "react-router-dom";

const spiritualMetrics = [
  { 
    label: "Divine Scorecard", 
    value: "92%", 
    change: "+5% this month", 
    icon: Star,
    description: "Overall spiritual growth assessment"
  },
  { 
    label: "Prayer Consistency", 
    value: "21 days", 
    change: "Current streak", 
    icon: Heart,
    description: "Daily prayer commitment maintained"
  },
  { 
    label: "Scripture Study", 
    value: "Daily", 
    change: "85% completion", 
    icon: BookOpen,
    description: "Regular Bible reading progress"
  },
  { 
    label: "Ministry Readiness", 
    value: "78%", 
    change: "+12% this quarter", 
    icon: Crown,
    description: "Preparation for kingdom service"
  },
];

const spiritualGrowthAreas = [
  {
    area: "Prayer Life",
    currentLevel: 85,
    target: 95,
    description: "Consistency in daily prayer and intercession",
    recommendations: [
      "Join early morning prayer group",
      "Complete prophetic prayer course",
      "Increase prayer time to 45 minutes daily"
    ],
    icon: Heart
  },
  {
    area: "Prophetic Discernment",
    currentLevel: 72,
    target: 90,
    description: "Ability to receive and interpret divine insights",
    recommendations: [
      "Attend prophetic intelligence workshops",
      "Practice dream interpretation",
      "Study biblical prophecy patterns"
    ],
    icon: Star
  },
  {
    area: "Biblical Knowledge",
    currentLevel: 88,
    target: 95,
    description: "Understanding of scripture and theological concepts",
    recommendations: [
      "Complete advanced theology courses",
      "Memorize 50 key verses this month",
      "Study original Hebrew and Greek"
    ],
    icon: BookOpen
  },
  {
    area: "Character Development",
    currentLevel: 91,
    target: 98,
    description: "Christ-likeness in daily conduct and decisions",
    recommendations: [
      "Practice daily self-examination",
      "Seek accountability partner",
      "Volunteer in community service"
    ],
    icon: Crown
  }
];

const recentSpiritual = [
  {
    type: "prayer",
    title: "Morning Prayer Completed",
    description: "60 minutes of intercession for global awakening",
    time: "Today, 6:00 AM",
    icon: Heart,
    impact: "+5 Spiritual Growth Points"
  },
  {
    type: "study",
    title: "Prophetic Intelligence Module",
    description: "Completed study on discerning times and seasons",
    time: "Yesterday, 7:30 PM", 
    icon: Star,
    impact: "+15 Spiritual Growth Points"
  },
  {
    type: "ministry",
    title: "Prayer Request Answered",
    description: "Healing prayer for community member manifested",
    time: "2 days ago",
    icon: Award,
    impact: "+20 Ministry Readiness Points"
  },
  {
    type: "character",
    title: "Forgiveness Applied",
    description: "Demonstrated Christ's love in difficult situation",
    time: "3 days ago",
    icon: Crown,
    impact: "+10 Character Development Points"
  }
];

const upcomingSpiritual = [
  {
    title: "Prophetic Check-in Session",
    description: "Weekly assessment with spiritual mentor",
    time: "Tomorrow, 7:00 PM EST",
    type: "Mentoring",
    action: "Join Session"
  },
  {
    title: "Community Prayer & Fasting",
    description: "Global intercession for world revival",
    time: "Wednesday, 6:00 AM EST",
    type: "Prayer Meeting",
    action: "Commit to Participate"
  },
  {
    title: "Divine Healing Workshop",
    description: "Learn supernatural healing principles",
    time: "Friday, 3:00 PM EST",
    type: "Training",
    action: "Register Now"
  },
  {
    title: "Calling Discernment Retreat",
    description: "Discover your unique kingdom assignment",
    time: "Next Sunday, 9:00 AM EST",
    type: "Retreat",
    action: "Reserve Spot"
  }
];

const callingAssessment = {
  primaryCalling: "Prophetic Teacher",
  confidence: 87,
  giftings: [
    { name: "Prophetic Insight", strength: 92 },
    { name: "Teaching Ability", strength: 89 },
    { name: "Intercession", strength: 85 },
    { name: "Pastoral Care", strength: 78 }
  ],
  nextSteps: [
    "Complete advanced prophetic training",
    "Begin teaching in local study groups", 
    "Develop prophetic writing ministry",
    "Seek ordination for teaching ministry"
  ]
};

export default function SpiritualFormation() {
  return (
    <PageTemplate
      title="Spiritual Formation Dashboard"
      description="Your journey toward Christ-likeness and kingdom readiness"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" disabled>
            <Calendar className="h-4 w-4 mr-2" />
            Prayer Calendar (Coming Soon)
          </Button>
          <Link to="/prayer-requests">
            <Button>
              <Heart className="h-4 w-4 mr-2" />
              Submit Prayer Request
            </Button>
          </Link>
        </div>
      }
    >
      {/* Christ Lordship Acknowledgment */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <span>Daily Christ Lordship Acknowledgment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-serif italic text-primary mb-4">
            "Jesus Christ is Lord over my heart, my mind, my spirit, and my calling. 
            I surrender all aspects of my spiritual formation to His perfect will."
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Acknowledged Today
            </Badge>
            <Button 
              size="sm"
              onClick={() => {/* acknowledgeLordship hook can be added here */}}
            >
              <Heart className="h-4 w-4 mr-2" />
              Renew Daily Commitment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spiritual Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {spiritualMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.change}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spiritual Growth Areas */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Growth Areas</CardTitle>
              <CardDescription>Areas for continued development in Christ-likeness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {spiritualGrowthAreas.map((area) => (
                <div key={area.area} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <area.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{area.area}</h4>
                    </div>
                    <Badge variant="outline">{area.currentLevel}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Progress</span>
                      <span>{area.currentLevel}% of {area.target}% target</span>
                    </div>
                    <Progress value={area.currentLevel} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-medium">Recommended Actions:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {area.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-primary" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Spiritual Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Spiritual Activity</CardTitle>
              <CardDescription>Your journey of faith and growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSpiritual.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                        <Badge variant="secondary" className="text-xs">{activity.impact}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calling Discernment */}
          <Card>
            <CardHeader>
              <CardTitle>Your Kingdom Calling</CardTitle>
              <CardDescription>Divine assignment and spiritual gifts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-primary">{callingAssessment.primaryCalling}</h3>
                <p className="text-sm text-muted-foreground">Primary Calling</p>
                <div className="mt-2">
                  <Progress value={callingAssessment.confidence} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{callingAssessment.confidence}% confidence</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Spiritual Giftings</h4>
                {callingAssessment.giftings.map((gift, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{gift.name}</span>
                    <Badge variant="outline">{gift.strength}%</Badge>
                  </div>
                ))}
              </div>
              
              <Button size="sm" className="w-full" disabled>
                <Target className="h-4 w-4 mr-2" />
                Complete Full Assessment (Coming Soon)
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Spiritual Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Spiritual Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSpiritual.map((event, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{event.type}</Badge>
                    </div>
                    <Button size="sm" className="w-full">
                      {event.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prayer Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Prayer Life Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Streak</span>
                  <div className="flex items-center space-x-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-bold">21 days</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Prayer Time</span>
                  <span className="font-bold">847 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Requests Answered</span>
                  <span className="font-bold">234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">People Prayed For</span>
                  <span className="font-bold">156</span>
                </div>
              </div>
              <Link to="/prayer-requests">
                <Button size="sm" className="w-full mt-4">
                  <Heart className="h-4 w-4 mr-2" />
                  Visit Prayer Center
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}