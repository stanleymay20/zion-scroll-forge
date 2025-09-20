import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, MessageSquare, Calendar, TrendingUp, Star, 
  Heart, BookOpen, Trophy, Globe, UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";

const communityStats = [
  { label: "Active Members", value: "127,453", change: "+2,847 this month", icon: Users },
  { label: "Study Groups", value: "3,241", change: "+127 this week", icon: BookOpen },
  { label: "Prayer Requests", value: "8,756", change: "642 answered", icon: Heart },
  { label: "Global Reach", value: "198 Nations", change: "+5 new countries", icon: Globe },
];

const featuredGroups = [
  {
    id: 1,
    name: "Prophetic Intelligence Scholars",
    description: "Deep study of prophetic gifts and divine revelation in the modern era",
    members: 2847,
    activity: "Very Active",
    category: "Spiritual Formation",
    image: "/api/placeholder/300/200",
    moderator: "Dr. Sarah Prophet",
    nextMeeting: "Today 7:00 PM EST"
  },
  {
    id: 2, 
    name: "ScrollMedicine Practitioners",
    description: "Integrating medical science with supernatural healing principles",
    members: 1923,
    activity: "Active",
    category: "Healthcare",
    image: "/api/placeholder/300/200",
    moderator: "Dr. Michael Healer",
    nextMeeting: "Tomorrow 3:00 PM EST"
  },
  {
    id: 3,
    name: "Kingdom Economics Network",
    description: "Biblical wealth principles and ScrollCoin economic system",
    members: 4156,
    activity: "Very Active", 
    category: "Economics",
    image: "/api/placeholder/300/200",
    moderator: "Prof. David Wealth",
    nextMeeting: "Wednesday 6:00 PM EST"
  }
];

const recentActivity = [
  {
    type: "discussion",
    user: "Samuel Scroll",
    action: "started a discussion",
    topic: "Prophetic Dreams and Global Events",
    group: "Prophetic Intelligence Scholars",
    time: "2 hours ago",
    replies: 23
  },
  {
    type: "prayer",
    user: "Mary Faith",
    action: "submitted prayer request",
    topic: "Healing for global pandemic aftermath",
    group: "Prayer Warriors Network",
    time: "4 hours ago",
    supporters: 156
  },
  {
    type: "study",
    user: "John Scholar",
    action: "shared study notes",
    topic: "Quantum Physics and Divine Creation",
    group: "Edenic Science Research",
    time: "6 hours ago",
    views: 89
  },
  {
    type: "achievement",
    user: "Rachel Builder",
    action: "earned ScrollBadge",
    topic: "Community Leader Gold",
    group: "Global Community",
    time: "1 day ago",
    congratulations: 34
  }
];

const upcomingEvents = [
  {
    title: "Global Prayer and Worship Night",
    date: "Today, 8:00 PM EST",
    type: "Prayer Meeting",
    attendees: 15627,
    host: "ScrollUniversity Prayer Team"
  },
  {
    title: "Prophetic Intelligence Symposium",
    date: "Tomorrow, 2:00 PM EST",
    type: "Academic Conference",
    attendees: 8934,
    host: "GeoProphetic Intelligence Faculty"
  },
  {
    title: "ScrollCoin Economics Workshop",
    date: "Wednesday, 7:00 PM EST",
    type: "Workshop",
    attendees: 5247,
    host: "Scroll Economy Faculty"
  },
  {
    title: "Divine Healing Testimonies",
    date: "Friday, 6:00 PM EST",
    type: "Testimony Meeting",
    attendees: 12456,
    host: "ScrollMedicine Community"
  }
];

export default function Community() {
  return (
    <PageTemplate
      title="ScrollUniversity Community"
      description="Connect with 127,000+ believers across 198 nations in Christ-centered learning"
      actions={
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Events Calendar
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Join Study Group
          </Button>
        </div>
      }
    >
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {communityStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/forums">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Discussion Forums</h3>
                  <p className="text-sm text-muted-foreground">Join conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/study-groups">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Study Groups</h3>
                  <p className="text-sm text-muted-foreground">Collaborative learning</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/prayer-requests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Prayer Center</h3>
                  <p className="text-sm text-muted-foreground">Submit & support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/mentorship">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Mentorship</h3>
                  <p className="text-sm text-muted-foreground">Find guidance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Featured Study Groups */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Featured Study Groups</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredGroups.map((group) => (
            <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className="mb-2">{group.category}</Badge>
                  <Badge variant={group.activity === "Very Active" ? "default" : "outline"}>
                    {group.activity}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{group.members.toLocaleString()} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">{group.nextMeeting}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Moderator: </span>
                    <span className="font-medium">{group.moderator}</span>
                  </div>
                  
                  <Link to={`/study-groups/${group.id}`}>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Group
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Community Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Community Activity</CardTitle>
            <CardDescription>Latest discussions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">"{activity.topic}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      in {activity.group} • {activity.time}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {activity.replies && (
                        <span>{activity.replies} replies</span>
                      )}
                      {activity.supporters && (
                        <span>{activity.supporters} supporters</span>
                      )}
                      {activity.views && (
                        <span>{activity.views} views</span>
                      )}
                      {activity.congratulations && (
                        <span>{activity.congratulations} congratulations</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Community Events</CardTitle>
            <CardDescription>Join global gatherings and workshops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground">
                        Hosted by {event.host}
                      </p>
                    </div>
                    <Badge variant="outline">{event.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{event.attendees.toLocaleString()} attending</span>
                    </div>
                    <Button size="sm">Join Event</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Calendar className="h-4 w-4 mr-2" />
              View Events Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Global Impact */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Global Kingdom Impact</CardTitle>
          <CardDescription>
            ScrollUniversity community transforming nations through Christ-centered education
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">198</div>
              <div className="text-sm text-muted-foreground">Nations Reached</div>
            </div>
            <div className="text-center">
              <Heart className="h-12 w-12 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">50,847</div>
              <div className="text-sm text-muted-foreground">Prayers Answered</div>
            </div>
            <div className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">12,456</div>
              <div className="text-sm text-muted-foreground">Lives Transformed</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-lg font-serif italic text-primary">
              "Where two or three gather in my name, there am I with them." - Matthew 18:20
            </p>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}