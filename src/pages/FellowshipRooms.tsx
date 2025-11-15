import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Video, MessageCircle, Calendar } from "lucide-react";

console.info("✝️ Fellowship Rooms — Christ governs community");

const fellowshipRooms = [
  {
    id: "1",
    name: "Prayer Warriors Circle",
    description: "Join us for daily intercession and prayer support",
    members: 45,
    isLive: true,
    nextMeeting: "Today at 6:00 PM",
    category: "Prayer",
  },
  {
    id: "2",
    name: "Young Adults Fellowship",
    description: "Connect with other young adults navigating faith and life",
    members: 78,
    isLive: false,
    nextMeeting: "Friday at 7:00 PM",
    category: "Fellowship",
  },
  {
    id: "3",
    name: "Worship & Praise",
    description: "Worship together through music and song",
    members: 92,
    isLive: true,
    nextMeeting: "Now Live",
    category: "Worship",
  },
  {
    id: "4",
    name: "Bible Study Group",
    description: "Deep dive into Scripture together",
    members: 34,
    isLive: false,
    nextMeeting: "Wednesday at 8:00 PM",
    category: "Study",
  },
  {
    id: "5",
    name: "Ministry Leaders",
    description: "Support network for ministry leaders and pastors",
    members: 23,
    isLive: false,
    nextMeeting: "Saturday at 10:00 AM",
    category: "Leadership",
  },
  {
    id: "6",
    name: "Testimony Sharing",
    description: "Share what God is doing in your life",
    members: 56,
    isLive: false,
    nextMeeting: "Sunday at 5:00 PM",
    category: "Testimony",
  },
];

export default function FellowshipRooms() {
  const [filter, setFilter] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(fellowshipRooms.map(r => r.category)))];

  const filtered = filter && filter !== "All" 
    ? fellowshipRooms.filter(r => r.category === filter)
    : fellowshipRooms;

  return (
    <PageTemplate title="Fellowship Rooms" description="Connect with believers in virtual rooms">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat || (!filter && cat === "All") ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(cat === "All" ? null : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Rooms Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <Card key={room.id} className={room.isLive ? "border-2 border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    {room.isLive && (
                      <Badge className="mt-2 bg-red-600 animate-pulse">
                        <span className="mr-1">🔴</span>
                        LIVE NOW
                      </Badge>
                    )}
                    {!room.isLive && (
                      <Badge variant="secondary" className="mt-2">{room.category}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{room.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{room.members} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs">{room.nextMeeting}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {room.isLive ? (
                    <Button className="flex-1">
                      <Video className="mr-2 h-4 w-4" />
                      Join Now
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                      <Button className="flex-1">
                        Join Room
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
}
