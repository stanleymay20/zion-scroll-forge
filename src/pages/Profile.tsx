import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';

console.info('✝️ Profile loaded—Christ is Lord over identity');

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate title="My Profile" description="Your ScrollUniversity identity">
      <Card>
        <CardHeader>
          <CardTitle>{profile?.email ?? '—'}</CardTitle>
          <CardDescription>ScrollUniversity Student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="capitalize">{profile?.role ?? 'Student'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">ScrollCoins Balance</p>
            <p className="text-2xl font-bold text-[hsl(var(--scroll-gold))]">
              {profile?.scrollcoins ?? 0} SC
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p>{new Date(profile?.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
