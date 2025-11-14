import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageSquare, Star, Clock, Brain, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInstitution } from '@/contexts/InstitutionContext';
import { PageTemplate } from '@/components/layout/PageTemplate';

interface AnalyticsData {
  total_interactions: number;
  unique_users: number;
  avg_response_time: number;
  avg_satisfaction: number;
}

interface CommonQuestion {
  question_text: string;
  question_count: number;
  last_asked: string;
}

interface InteractionTrend {
  date: string;
  chat_interactions: number;
  voice_interactions: number;
  video_interactions: number;
}

export default function AITutorAnalytics() {
  const { activeInstitution } = useInstitution();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([]);
  const [trends, setTrends] = useState<InteractionTrend[]>([]);
  const [interactionTypes, setInteractionTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeInstitution?.id) {
      fetchAnalytics();
      fetchCommonQuestions();
      fetchTrends();
    }
  }, [activeInstitution?.id]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    let query = supabase.from('ai_tutor_interactions' as any).select('*');
    
    if (activeInstitution?.id) {
      query = query.eq('institution_id', activeInstitution.id);
    }
    
    const { data, error } = await query;

    if (error || !data) {
      console.error('Analytics error:', error);
      setIsLoading(false);
      return;
    }

    const interactions = data as any[];
    const totalInteractions = interactions.length;
    const uniqueUsers = new Set(interactions.map(d => d.user_id)).size;
    const avgResponseTime = interactions.reduce((sum, d) => sum + (d.response_time || 0), 0) / totalInteractions;
    const satisfactionRatings = interactions.filter(d => d.satisfaction_rating);
    const avgSatisfaction = satisfactionRatings.reduce((sum, d) => sum + (d.satisfaction_rating || 0), 0) / satisfactionRatings.length;

    setAnalytics({
      total_interactions: totalInteractions,
      unique_users: uniqueUsers,
      avg_response_time: Math.round(avgResponseTime),
      avg_satisfaction: Number(avgSatisfaction.toFixed(1))
    });

    // Calculate interaction types
    const chatCount = interactions.filter(d => d.interaction_type === 'chat').length;
    const voiceCount = interactions.filter(d => d.interaction_type === 'voice').length;
    const videoCount = interactions.filter(d => d.interaction_type === 'video').length;

    setInteractionTypes([
      { name: 'Chat', value: chatCount, color: '#8b5cf6' },
      { name: 'Voice', value: voiceCount, color: '#10b981' },
      { name: 'Video', value: videoCount, color: '#f59e0b' }
    ]);
    
    setIsLoading(false);
  };

  const fetchCommonQuestions = async () => {
    const { data, error } = await supabase
      .from('ai_tutor_common_questions' as any)
      .select('*')
      .order('question_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Common questions error:', error);
      return;
    }

    setCommonQuestions((data || []) as any);
  };

  const fetchTrends = async () => {
    const { data, error } = await supabase
      .from('ai_tutor_interactions' as any)
      .select('created_at, interaction_type')
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Trends error:', error);
      return;
    }

    const interactions = data as any[];
    // Group by date
    const trendMap = new Map<string, InteractionTrend>();
    interactions.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString();
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          chat_interactions: 0,
          voice_interactions: 0,
          video_interactions: 0
        });
      }
      const trend = trendMap.get(date)!;
      if (item.interaction_type === 'chat') trend.chat_interactions++;
      if (item.interaction_type === 'voice') trend.voice_interactions++;
      if (item.interaction_type === 'video') trend.video_interactions++;
    });

    setTrends(Array.from(trendMap.values()).slice(-7)); // Last 7 days
  };

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b'];
  
  if (!activeInstitution) {
    return (
      <PageTemplate title="AI Tutor Analytics" description="">
        <Card>
          <CardContent className="pt-6">
            <p>Please select an institution to view analytics.</p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (isLoading) {
    return (
      <PageTemplate title="AI Tutor Analytics" description="Real-time insights into AI tutor performance">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate 
      title="AI Tutor Analytics" 
      description="Real-time insights into AI tutor performance and student engagement"
    >
      <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_interactions || 0}</div>
            <p className="text-xs text-muted-foreground">All time conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.unique_users || 0}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avg_response_time || 0}ms</div>
            <p className="text-xs text-muted-foreground">Lightning fast</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avg_satisfaction || 0}/5</div>
            <p className="text-xs text-muted-foreground">Student rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Interaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Interaction Trends (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily interaction volume by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="chat_interactions" stroke="#8b5cf6" name="Chat" />
                <Line type="monotone" dataKey="voice_interactions" stroke="#10b981" name="Voice" />
                <Line type="monotone" dataKey="video_interactions" stroke="#f59e0b" name="Video" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interaction Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Interaction Types
            </CardTitle>
            <CardDescription>Distribution of interaction methods</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interactionTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Common Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Most Common Questions
          </CardTitle>
          <CardDescription>
            Top questions asked by students - useful for improving course content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {commonQuestions.map((q, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium mb-1">{q.question_text}</p>
                    <p className="text-xs text-muted-foreground">
                      Last asked: {new Date(q.last_asked).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-4">
                    {q.question_count} times
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </PageTemplate>
  );
}