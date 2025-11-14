import React, { useState } from 'react';
import { Building2, Plus, Edit, Power, Users, BookOpen } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

console.info('✝️ Institutions Admin — Christ governs platform administration');

interface Institution {
  id: string;
  name: string;
  slug: string;
  short_name?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  plan?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

interface InstitutionStats {
  institution_id: string;
  member_count: number;
  course_count: number;
}

export const InstitutionsAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_name: '',
    description: '',
    plan: 'free',
    is_active: true,
  });

  // Fetch institutions
  const { data: institutions, isLoading } = useQuery({
    queryKey: ['institutions-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Institution[];
    },
  });

  // Fetch stats for each institution
  const { data: stats } = useQuery({
    queryKey: ['institution-stats'],
    queryFn: async () => {
      const { data: members } = await supabase
        .from('institution_members')
        .select('institution_id');
      
      const { data: courses } = await supabase
        .from('courses')
        .select('institution_id');

      const statsMap: Record<string, InstitutionStats> = {};
      
      members?.forEach(m => {
        if (!statsMap[m.institution_id]) {
          statsMap[m.institution_id] = { institution_id: m.institution_id, member_count: 0, course_count: 0 };
        }
        statsMap[m.institution_id].member_count++;
      });

      courses?.forEach(c => {
        if (!statsMap[c.institution_id]) {
          statsMap[c.institution_id] = { institution_id: c.institution_id, member_count: 0, course_count: 0 };
        }
        statsMap[c.institution_id].course_count++;
      });

      return statsMap;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingInstitution) {
        const { error } = await supabase
          .from('institutions')
          .update(data)
          .eq('id', editingInstitution.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('institutions')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions-admin'] });
      toast({ title: `Institution ${editingInstitution ? 'updated' : 'created'} successfully` });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to save institution', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('institutions')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions-admin'] });
      toast({ title: 'Institution status updated' });
    },
  });

  const handleOpenDialog = (institution?: Institution) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name,
        slug: institution.slug,
        short_name: institution.short_name || '',
        description: institution.description || '',
        plan: institution.plan || 'free',
        is_active: institution.is_active ?? true,
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        slug: '',
        short_name: '',
        description: '',
        plan: 'free',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstitution(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading institutions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            Institutions Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            ✝️ Manage all institutions on the ScrollUniversity platform — Christ governs all
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Institution
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {institutions?.map((institution) => {
          const institutionStats = stats?.[institution.id];
          return (
            <Card key={institution.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {institution.name}
                      {!institution.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {institution.slug === 'scrolluniversity' && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {institution.slug}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(institution)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {institution.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {institution.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{institutionStats?.member_count || 0} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{institutionStats?.course_count || 0} courses</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant="outline">{institution.plan || 'free'}</Badge>
                  {institution.slug !== 'scrolluniversity' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({
                        id: institution.id,
                        is_active: !institution.is_active
                      })}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInstitution ? 'Edit Institution' : 'Create New Institution'}
            </DialogTitle>
            <DialogDescription>
              Configure the institution details for the ScrollUniversity platform
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_name">Short Name</Label>
                  <Input
                    id="short_name"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    placeholder="SU"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  required
                  disabled={!!editingInstitution}
                  placeholder="my-institution"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    value={formData.plan}
                    onValueChange={(value) => setFormData({ ...formData, plan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="founders">Founders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Active Status</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Institution'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionsAdmin;
