/**
 * ScrollUniversity OAuth Callback Handler
 * "The Lord will fulfill his purpose for me" - Psalm 138:8
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      const code = searchParams.get('code');
      const redirect = searchParams.get('redirect') || '/dashboard';
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth errors
      if (errorParam) {
        throw new Error(errorDescription || errorParam);
      }

      if (!code) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate(redirect);
          return;
        }

        throw new Error('No authorization code received');
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      navigate(redirect);
    } catch (err: any) {
      console.error('OAuth callback error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
      setProcessing(false);
    }
  };

  if (processing && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Completing sign in...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we set up your account
                </p>
              </div>
              <div className="w-full rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-center font-serif text-sm italic text-primary">
                  "Wait for the Lord; be strong, and let your heart take courage" - Psalm 27:14
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-2xl font-serif text-primary">
              Authentication Failed
            </h3>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Back to Sign In
            </Button>
            <Button
              onClick={() => navigate('/help')}
              variant="outline"
              className="w-full"
            >
              Contact Support
            </Button>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-center font-serif text-sm italic text-primary">
              "The Lord is near to all who call on him" - Psalm 145:18
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
