import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  shortName: z.string().optional(),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onComplete: (data: any) => void;
  initialData?: any;
}

export const InstitutionSetup = ({ onComplete, initialData }: Props) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: '',
      slug: '',
      shortName: '',
      description: '',
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: institution, error } = await (supabase as any)
        .from('institutions')
        .insert({
          name: data.name,
          slug: data.slug,
          short_name: data.shortName,
          description: data.description,
          primary_color: data.primaryColor,
          accent_color: data.accentColor,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Institution created successfully');
      onComplete({ institutionId: institution.id, ...data });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create institution');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Biblical Seminary of Excellence" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., bse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., BSE" {...field} />
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
                  <Textarea placeholder="Brief description of your institution" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accentColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accent Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Faculty Creation
        </Button>
      </form>
    </Form>
  );
};
