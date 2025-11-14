import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  enableEnrollmentApproval: z.boolean(),
  enablePayments: z.boolean(),
  enableAITutors: z.boolean(),
  enableXRClassrooms: z.boolean(),
  enableScrollCoin: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onComplete: (data: any) => void;
  onBack: () => void;
  institutionId: string;
}

export const AdminConfiguration = ({ onComplete, onBack, institutionId }: Props) => {
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      enableEnrollmentApproval: false,
      enablePayments: false,
      enableAITutors: true,
      enableXRClassrooms: true,
      enableScrollCoin: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { error } = await (supabase as any)
        .from('institutions')
        .update({
          settings: {
            enrollment_approval: data.enableEnrollmentApproval,
            payments_enabled: data.enablePayments,
            ai_tutors_enabled: data.enableAITutors,
            xr_classrooms_enabled: data.enableXRClassrooms,
            scrollcoin_enabled: data.enableScrollCoin,
          },
        })
        .eq('id', institutionId);

      if (error) throw error;

      toast.success('Institution setup complete!');
      onComplete(data);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="enableEnrollmentApproval"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enrollment Approval</FormLabel>
                  <FormDescription>
                    Require admin approval for course enrollments
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enablePayments"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Payments</FormLabel>
                  <FormDescription>
                    Enable paid courses and payment processing
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableAITutors"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">AI Tutors</FormLabel>
                  <FormDescription>
                    Enable AI-powered tutoring and assistance
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableXRClassrooms"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">XR Classrooms</FormLabel>
                  <FormDescription>
                    Enable virtual and augmented reality learning spaces
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enableScrollCoin"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">ScrollCoin Economy</FormLabel>
                  <FormDescription>
                    Enable the gamification and rewards system
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        </div>
      </form>
    </Form>
  );
};
