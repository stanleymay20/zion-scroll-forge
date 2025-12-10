/**
 * Innovation Lab Component
 * Weekly innovation challenges implementing Revelation + Data + Prototype model
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Users, Code, FileText, Trophy, Calendar } from 'lucide-react';

interface InnovationLabProps {
  userId: string;
}

export default function InnovationLab({ userId }: InnovationLabProps) {
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [myTeam, setMyTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentChallenge();
    fetchMyTeam();
  }, [userId]);

  const fetchCurrentChallenge = async () => {
    try {
      const response = await fetch('/api/innovation/current-challenge');
      const data = await response.json();
      setCurrentChallenge(data);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeam = async () => {
    try {
      const response = await fetch(`/api/innovation/my-team/${userId}`);
      const data = await response.json();
      setMyTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          ScrollLabs Innovation Challenge
        </h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Calendar className="h-4 w-4 mr-2" />
          Week {getCurrentWeek()}
        </Badge>
      </div>

      {currentChallenge && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>This Week's Challenge</CardTitle>
            <CardDescription>{currentChallenge.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{currentChallenge.scrollPrompt}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <Trophy className="h-3 w-3 mr-1" />
                {currentChallenge.scrollGoldReward} ScrollGold
              </Badge>
              <span className="text-sm text-muted-foreground">
                Deadline: {new Date(currentChallenge.deadline).toLocaleDateString()}
              </span>
            </div>
            {!myTeam && (
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Join a Team
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {myTeam && (
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="problem">Problem Analysis</TabsTrigger>
            <TabsTrigger value="prototype">Prototype</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <TeamView team={myTeam} />
          </TabsContent>

          <TabsContent value="problem">
            <ProblemAnalysisView teamId={myTeam.id} />
          </TabsContent>

          <TabsContent value="prototype">
            <PrototypeView teamId={myTeam.id} />
          </TabsContent>

          <TabsContent value="publish">
            <PublishView teamId={myTeam.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function TeamView({ team }: { team: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Team</CardTitle>
        <CardDescription>Global collaboration across cultures</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.members.map((member: any) => (
            <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.location} • {member.role}</div>
              </div>
              <Badge variant="outline">{member.timezone}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProblemAnalysisView({ teamId }: { teamId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problem Analysis</CardTitle>
        <CardDescription>Define the problem and identify gaps</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Start Problem Analysis
        </Button>
      </CardContent>
    </Card>
  );
}

function PrototypeView({ teamId }: { teamId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prototype Development</CardTitle>
        <CardDescription>Build your solution</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">
          <Code className="h-4 w-4 mr-2" />
          Start Building
        </Button>
      </CardContent>
    </Card>
  );
}

function PublishView({ teamId }: { teamId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish Solution</CardTitle>
        <CardDescription>Share your work with the ScrollCommunity</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Publish to ScrollJournal</Button>
      </CardContent>
    </Card>
  );
}

function getCurrentWeek(): number {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const diff = Date.now() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}
