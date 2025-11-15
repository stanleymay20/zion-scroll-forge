import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Calendar, Award } from "lucide-react";

console.info("✝️ Spiritual Mentors — Christ governs discipleship");

const mentors = [
  {
    id: "1",
    name: "Pastor Michael Johnson",
    specialty: "Leadership & Ministry",
    yearsExperience: 15,
    bio: "Passionate about raising up the next generation of kingdom leaders. Served as senior pastor for 10+ years and now focus on mentoring young ministers.",
    availability: "Tuesdays & Thursdays",
    students: 12,
    rating: 4.9,
    credentials: ["M.Div", "D.Min", "Certified Biblical Counselor"],
  },
  {
    id: "2",
    name: "Dr. Sarah Williams",
    specialty: "Theology & Academic Excellence",
    yearsExperience: 20,
    bio: "Seminary professor and author specializing in systematic theology and biblical studies. Love helping students integrate faith and scholarship.",
    availability: "Wednesdays & Saturdays",
    students: 8,
    rating: 5.0,
    credentials: ["Ph.D Theology", "Published Author", "Seminary Professor"],
  },
  {
    id: "3",
    name: "Rev. James Chen",
    specialty: "Missions & Cross-Cultural Ministry",
    yearsExperience: 18,
    bio: "Missionary for 15 years in Asia. Now mentoring students called to missions and cross-cultural work.",
    availability: "Mondays & Fridays",
    students: 15,
    rating: 4.8,
    credentials: ["M.A. Missions", "Cross-Cultural Expert", "Ordained Minister"],
  },
  {
    id: "4",
    name: "Evangelist Maria Rodriguez",
    specialty: "Evangelism & Discipleship",
    yearsExperience: 12,
    bio: "Gifted evangelist with a heart for soul-winning and discipleship. Leading campus ministry for 10 years.",
    availability: "Flexible Schedule",
    students: 20,
    rating: 4.9,
    credentials: ["B.A. Ministry", "Campus Ministry Director", "Evangelism Trainer"],
  },
];

export default function SpiritualMentor() {
  const queryClient = useQueryClient();
  const [selectedMentor, setSelectedMentor] = useState<typeof mentors[0] | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  const requestMentorship = useMutation({
    mutationFn: async (mentorId: string) => {
      toast({ title: "🙏 Mentorship request sent!" });
      return { success: true };
    },
    onSuccess: () => {
      setSelectedMentor(null);
      setRequestMessage("");
    },
  });

  return (
    <PageTemplate title="Spiritual Mentors" description="Find a mentor to guide your spiritual journey">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Heart className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Why Spiritual Mentorship?</h3>
                <p className="text-sm text-muted-foreground">
                  Every believer needs guidance and accountability. Our mentors are experienced ministry leaders 
                  committed to helping you grow in Christ, discover your calling, and develop as a kingdom leader.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {mentors.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {mentor.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{mentor.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{mentor.yearsExperience} years exp.</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-3 w-3 text-yellow-600" />
                        <span>{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{mentor.bio}</p>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Credentials:</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.credentials.map((cred, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cred}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{mentor.availability}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{mentor.students} students</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedMentor(mentor)}>
                      Request Mentorship
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Mentorship from {mentor.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Why do you want this mentor?</label>
                        <Textarea
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Share your spiritual goals and why you'd like this mentor..."
                          className="min-h-[120px] mt-2"
                        />
                      </div>
                      <Button
                        onClick={() => requestMentorship.mutate(mentor.id)}
                        disabled={!requestMessage.trim() || requestMentorship.isPending}
                        className="w-full"
                      >
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
}
