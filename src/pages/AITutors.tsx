import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  MessageSquare,
  BookOpenCheck,
  Loader2,
  CheckCircle2,
  VideoOff,
  MicOff,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAITutors } from "@/hooks/useTutors";

const capabilityRows = [
  {
    label: "Text AI tutor chat",
    status: "Live",
    icon: CheckCircle2,
    description: "Students can ask questions and receive faculty-aware AI guidance through chat.",
  },
  {
    label: "Learning memory",
    status: "Live",
    icon: CheckCircle2,
    description: "Tutor conversations update learning-pattern and engagement records.",
  },
  {
    label: "Voice tutor",
    status: "Not live yet",
    icon: MicOff,
    description: "Speech-to-text and text-to-speech are not implemented in the production tutor flow.",
  },
  {
    label: "Avatar classroom",
    status: "Not live yet",
    icon: VideoOff,
    description: "No streaming avatar or live video classroom is currently wired here.",
  },
];

export default function AITutors() {
  const { data: aiTutors, isLoading } = useAITutors();

  console.info("✝️ AI Tutors loaded — implemented as text-based Christ-centered tutoring");

  if (isLoading) {
    return (
      <PageTemplate title="Loading..." description="">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  const featuredTutors = aiTutors?.slice(0, 4) || [];
  const specializedTutors = aiTutors?.slice(4) || [];

  return (
    <PageTemplate
      title="ScrollIntel AI Tutors"
      description="Christ-centered text tutoring with faculty-aware AI guidance. Voice and avatar classroom modes are marked truthfully until their production services are wired."
      actions={
        <div className="flex space-x-2">
          <Link to="/ai-tutors/scrollmentor-gpt">
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Text Tutor
            </Button>
          </Link>
        </div>
      }
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Tutor Capability Truth Layer
          </CardTitle>
          <CardDescription>
            This page only markets what is implemented in code. Voice and avatar classroom modes remain disabled until their production services are wired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {capabilityRows.map((capability) => {
              const Icon = capability.icon;
              const live = capability.status === "Live";
              return (
                <div key={capability.label} className="rounded-lg border bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Icon className={live ? "h-4 w-4 text-green-600" : "h-4 w-4 text-muted-foreground"} />
                      {capability.label}
                    </div>
                    <Badge variant={live ? "secondary" : "outline"}>{capability.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{capability.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-bold">24/7</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Text Access</p>
              </div>
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-bold">AI</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Model-backed</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-bold">Saved</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Conversations</p>
              </div>
              <BookOpenCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg sm:text-2xl font-bold">Disabled</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Avatar Mode</p>
              </div>
              <VideoOff className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Featured AI Tutors</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {featuredTutors.map((tutor: any) => (
            <Card key={tutor.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tutor.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-xl">{tutor.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">Text Tutor</Badge>
                    </div>
                    <Badge variant="outline" className="mt-2">{tutor.specialty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{tutor.description}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Current mode: chat-based tutoring. This is not a video/avatar classroom session.
                </p>
                <Link to={`/ai-tutors/${tutor.specialty?.replace(/\s+/g, '-')}`}>
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Text Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Specialized AI Tutors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {specializedTutors.map((tutor: any) => (
            <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={tutor.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tutor.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px]">Text Tutor</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="mb-3">{tutor.specialty}</Badge>
                <p className="text-sm text-muted-foreground mb-4">{tutor.description}</p>
                <Link to={`/ai-tutors/${tutor.specialty?.replace(/\s+/g, '-')}`}>
                  <Button size="sm" className="w-full">
                    Start Text Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Implemented Tutor System</CardTitle>
          <CardDescription>
            The live production capability is AI-assisted text tutoring with Christ-centered academic guidance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Faculty-Aware Responses</h4>
              <p className="text-sm text-muted-foreground">
                Tutor prompts adapt to the selected faculty and tutoring personality.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Christ-Centered Guidance</h4>
              <p className="text-sm text-muted-foreground">
                Responses are framed to honor Christ while supporting academic learning.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Conversation Persistence</h4>
              <p className="text-sm text-muted-foreground">
                Student conversations can be stored for continuity and learning analytics.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Learning Pattern Tracking</h4>
              <p className="text-sm text-muted-foreground">
                Engagement and comprehension indicators are updated as students interact.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Credit-Aware AI Gateway</h4>
              <p className="text-sm text-muted-foreground">
                The system handles AI credit and rate-limit errors with user-facing messages.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Avatar Claims Protected</h4>
              <p className="text-sm text-muted-foreground">
                Avatar, voice, and classroom modes are not presented as active until those integrations exist.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}