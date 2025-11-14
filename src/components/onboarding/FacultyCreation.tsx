import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onComplete: (data: any) => void;
  onBack: () => void;
  institutionId: string;
}

export const FacultyCreation = ({ onComplete, onBack, institutionId }: Props) => {
  const [faculties, setFaculties] = useState<any[]>([]);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: faculty, error } = await (supabase as any)
        .from('faculties')
        .insert({
          institution_id: institutionId,
          name: data.name,
          description: data.description,
        })
        .select()
        .single();

      if (error) throw error;

      setFaculties([...faculties, faculty]);
      toast.success(`Faculty "${data.name}" added`);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create faculty');
    }
  };

  const removeFaculty = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('faculties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFaculties(faculties.filter(f => f.id !== id));
      toast.success('Faculty removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove faculty');
    }
  };

  const handleContinue = () => {
    if (faculties.length === 0) {
      toast.error('Please add at least one faculty');
      return;
    }
    onComplete({ faculties });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Added Faculties ({faculties.length})</h3>
        {faculties.map((faculty) => (
          <Card key={faculty.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{faculty.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaculty(faculty.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {faculty.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{faculty.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Theology, Biblical Studies, Ministry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief description of this faculty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="outline" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Faculty
          </Button>
        </form>
      </Form>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Continue to Course Import
        </Button>
      </div>
    </div>
  );
};
