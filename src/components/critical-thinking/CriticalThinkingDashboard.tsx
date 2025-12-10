/**
 * ScrollCritical Thinking Dashboard
 * Main hub for critical thinking activities, challenges, and innovation projects
 * Implements: "Come, let us reason together" (Isaiah 1:18)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Lightbulb,
  Users,
  Trophy,
  TrendingUp,
  BookOpen,
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react';

interface CriticalThinkingDashboardProps {
  userId: string;
}

interface ThinkingProfile {
  reasoningLevel: string;
  discernmentScore: number;
  innovationCapacity: number;
  collaborationSkills: number;
  propheticMaturity: number;
  scrollXP: number;
  activeChallenges: number;
  completedProjects: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default function CriticalThinkingDashboard({ userId }: CriticalThinkingDashboardProps) {
  const [profile, setProfile] = useState<ThinkingProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Get API base URL from environment or default to relative path
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      
      // Get authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`${apiBaseUrl}/critical-thinking/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this profile.');
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const result: APIResponse<ThinkingProfile> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch critical thinking profile');
      }

      if (!result.data) {
        throw new Error('No profile data received from server');
      }

      setProfile(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching critical thinking profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading your critical thinking profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              Error Loading Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchProfile} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Unable to load critical thinking profile. This may be because your profile hasn't been initialized yet.
            </p>
            <Button onClick={fetchProfile} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            ScrollCritical Thinking Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            "Come, let us reason together" - Isaiah 1:18
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Trophy className="h-4 w-4 mr-2" />
          {profile.scrollXP} ScrollXP
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Reasoning Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{profile.reasoningLevel}</div>
            <Progress value={profile.discernmentScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Innovation Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(profile.innovationCapacity * 100)}%</div>
            <Progress value={profile.innovationCapacity * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaboration Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(profile.collaborationSkills * 100)}%</div>
            <Progress value={profile.collaborationSkills * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Prophetic Maturity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(profile.propheticMaturity * 100)}%</div>
            <Progress value={profile.propheticMaturity * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">
            <Target className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="innovation">
            <Lightbulb className="h-4 w-4 mr-2" />
            Innovation Labs
          </TabsTrigger>
          <TabsTrigger value="debates">
            <Users className="h-4 w-4 mr-2" />
            Global Debates
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-4">
          <ChallengesTab userId={userId} />
        </TabsContent>

        <TabsContent value="innovation" className="space-y-4">
          <InnovationTab userId={userId} />
        </TabsContent>

        <TabsContent value="debates" className="space-y-4">
          <DebatesTab userId={userId} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <ProgressTab userId={userId} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Challenges Tab Component
function ChallengesTab({ userId }: { userId: string }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Challenges</CardTitle>
          <CardDescription>
            Develop prophetic reasoning combined with data discernment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ChallengeCard
              title="Theological Analysis: AI Ethics"
              level="Advanced"
              xpReward={35}
              timeRemaining="2 days"
              progress={60}
            />
            <ChallengeCard
              title="Evidence Evaluation: Climate Solutions"
              level="Intermediate"
              xpReward={20}
              timeRemaining="5 days"
              progress={30}
            />
          </div>
          <Button className="w-full mt-4">
            <Target className="h-4 w-4 mr-2" />
            Browse All Challenges
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Innovation Tab Component
function InnovationTab({ userId }: { userId: string }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Innovation Challenge</CardTitle>
          <CardDescription>
            ScrollLabs: Build solutions that transform communities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-primary/5">
              <h3 className="font-semibold mb-2">This Week's Challenge</h3>
              <p className="text-sm text-muted-foreground mb-4">
                "Design an AI system to interpret dreams ethically while maintaining biblical alignment"
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">50 ScrollGold Reward</Badge>
                <Button size="sm">Join Team</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Debates Tab Component
function DebatesTab({ userId }: { userId: string }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Global Debate Rooms</CardTitle>
          <CardDescription>
            Practice logic, argument, and ethics with peers worldwide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DebateRoomCard
              topic="AI in Healthcare: Ethical Boundaries"
              participants={12}
              language="English"
              status="Active"
            />
            <DebateRoomCard
              topic="Climate Action: Faith-Based Solutions"
              participants={8}
              language="Spanish"
              status="Starting Soon"
            />
          </div>
          <Button className="w-full mt-4">
            <Users className="h-4 w-4 mr-2" />
            Create Debate Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Progress Tab Component
function ProgressTab({ userId, profile }: { userId: string; profile: ThinkingProfile }) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Skill Development</CardTitle>
          <CardDescription>Track your growth in critical thinking competencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkillProgress label="Logical Reasoning" value={profile.discernmentScore * 100} />
          <SkillProgress label="Evidence Evaluation" value={75} />
          <SkillProgress label="Spiritual Discernment" value={profile.propheticMaturity * 100} />
          <SkillProgress label="Ethical Analysis" value={68} />
          <SkillProgress label="Innovative Thinking" value={profile.innovationCapacity * 100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AchievementBadge
              title="Prophetic Reasoner"
              description="Completed 10 advanced challenges"
              icon={<Sparkles className="h-4 w-4" />}
            />
            <AchievementBadge
              title="Innovation Pioneer"
              description="Published 3 solutions in ScrollJournal"
              icon={<Lightbulb className="h-4 w-4" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function ChallengeCard({
  title,
  level,
  xpReward,
  timeRemaining,
  progress
}: {
  title: string;
  level: string;
  xpReward: number;
  timeRemaining: string;
  progress: number;
}) {
  return (
    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline">{level}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>+{xpReward} XP</span>
        <span>{timeRemaining} remaining</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function DebateRoomCard({
  topic,
  participants,
  language,
  status
}: {
  topic: string;
  participants: number;
  language: string;
  status: string;
}) {
  return (
    <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">{topic}</h3>
        <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {participants} participants
        </span>
        <span>{language}</span>
      </div>
    </div>
  );
}

function SkillProgress({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function AchievementBadge({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-primary/5">
      <div className="p-2 rounded-full bg-primary/10">{icon}</div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
