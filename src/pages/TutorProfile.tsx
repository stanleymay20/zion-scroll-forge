import { useParams, useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, MessageSquare, Star, Clock, Calendar, 
  BookOpen, Users, Award, Loader2 
} from "lucide-react";
import { useAITutor } from "@/hooks/useTutors";

export default function TutorProfile() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { data: tutor, isLoading } = useAITutor(tutorId || "");

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  if (!tutor) {
    return (
      <PageTemplate title="Tutor Not Found" description="">
        <Card>
          <CardContent className="pt-6">
            <p>This tutor could not be found.</p>
            <Button onClick={() => navigate("/ai-tutors")} className="mt-4">
              Back to AI Tutors
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={tutor.name}
      description={tutor.specialty}
      actions={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/ai-tutors")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => navigate(`/ai-tutors/${tutor.id}`)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Start Chat
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={tutor.avatar_image_url} />
                  <AvatarFallback className="text-3xl">
                    {tutor.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold mb-2">{tutor.name}</h2>
                <p className="text-muted-foreground mb-4">{tutor.specialty}</p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant={tutor.is_online ? "default" : "secondary"}>
                    {tutor.is_online ? "Online" : "Offline"}
                  </Badge>
                  <Badge variant="outline">AI Tutor</Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">&lt; 1s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-primary text-primary mr-1" />
                      <span className="font-medium">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Active Sessions</span>
                </div>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Messages Sent</span>
                </div>
                <span className="font-semibold">45,678</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Satisfaction</span>
                </div>
                <span className="font-semibold">98.7%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {tutor.description || 
                  `${tutor.name} is an advanced AI tutor specializing in ${tutor.specialty}. With extensive knowledge and personalized teaching methods, this tutor provides 24/7 support to help students master their subjects.`}
              </p>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Areas of Expertise</CardTitle>
              <CardDescription>Topics this tutor excels in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{tutor.specialty}</Badge>
                <Badge variant="secondary">Problem Solving</Badge>
                <Badge variant="secondary">Conceptual Understanding</Badge>
                <Badge variant="secondary">Exam Preparation</Badge>
                <Badge variant="secondary">Critical Thinking</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Approach */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Approach</CardTitle>
              <CardDescription>How this tutor helps students learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Adaptive Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Adjusts teaching style based on your learning pace and preferences
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Interactive Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    Engages with questions, examples, and practice problems
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Always Available</h4>
                  <p className="text-sm text-muted-foreground">
                    Get help whenever you need it, day or night
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Ready to learn?</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {tutor.name} now
                  </p>
                </div>
                <Button size="lg" onClick={() => navigate(`/ai-tutors/${tutor.id}`)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
