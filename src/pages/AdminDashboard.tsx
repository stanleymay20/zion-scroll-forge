import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Award, Coins, ShieldCheck, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState('');
  const [awardAmount, setAwardAmount] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState('');

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'faculty']);
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!user,
  });

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_admin_overview')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all achievements
  const { data: achievements } = useQuery({
    queryKey: ['all-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Award ScrollCoins
  const awardScrollCoins = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !awardAmount) {
        throw new Error('Please select user and amount');
      }

      const { error } = await supabase.rpc('earn_scrollcoin', {
        p_user_id: selectedUser,
        p_amount: parseFloat(awardAmount),
        p_desc: 'Admin award',
      });

      if (error) throw error;

      // Log admin action
      await (supabase as any).from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'award_scrollcoins',
        target_user_id: selectedUser,
        details: { amount: parseFloat(awardAmount) },
      });
    },
    onSuccess: () => {
      toast.success('ScrollCoins awarded!');
      setSelectedUser('');
      setAwardAmount('');
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (error) => {
      toast.error('Failed to award ScrollCoins', { description: error.message });
    },
  });

  // Award Achievement
  const awardAchievement = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedAchievement) {
        throw new Error('Please select user and achievement');
      }

      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: selectedUser,
          achievement_id: selectedAchievement,
        });

      if (error) throw error;

      // Log admin action
      await (supabase as any).from('admin_actions').insert({
        admin_id: user?.id,
        action_type: 'award_achievement',
        target_user_id: selectedUser,
        details: { achievement_id: selectedAchievement },
      });
    },
    onSuccess: () => {
      toast.success('Achievement awarded!');
      setSelectedUser('');
      setSelectedAchievement('');
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (error) => {
      toast.error('Failed to award achievement', { description: error.message });
    },
  });

  if (checkingRole) {
    return (
      <PageTemplate title="Admin Dashboard" description="Loading...">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageTemplate>
    );
  }

  if (!isAdmin) {
    return (
      <PageTemplate title="Access Denied" description="Admin only">
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Access Denied</p>
            <p className="text-muted-foreground">
              You need admin or faculty privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Admin Dashboard"
      description="Manage ScrollUniversity"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{analytics?.total_users || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{analytics?.total_enrollments || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ScrollCoins Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{analytics?.total_scrollcoin_earned || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prayer Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{analytics?.total_prayers || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="awards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="awards">Award System</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="courses">Course Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="awards">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Award ScrollCoins</CardTitle>
                <CardDescription>Manually award ScrollCoins to students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={awardAmount}
                    onChange={(e) => setAwardAmount(e.target.value)}
                    placeholder="Enter amount..."
                  />
                </div>
                <Button
                  onClick={() => awardScrollCoins.mutate()}
                  disabled={!selectedUser || !awardAmount || awardScrollCoins.isPending}
                  className="w-full"
                >
                  {awardScrollCoins.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Coins className="h-4 w-4 mr-2" />
                  )}
                  Award ScrollCoins
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Award Achievement</CardTitle>
                <CardDescription>Manually award badges to students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Student</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Achievement</Label>
                  <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an achievement..." />
                    </SelectTrigger>
                    <SelectContent>
                      {achievements?.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => awardAchievement.mutate()}
                  disabled={!selectedUser || !selectedAchievement || awardAchievement.isPending}
                  className="w-full"
                >
                  {awardAchievement.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Award className="h-4 w-4 mr-2" />
                  )}
                  Award Achievement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage student accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users?.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <span>{u.email}</span>
                    <Badge variant="outline">Student</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Monitor course performance and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed course analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
