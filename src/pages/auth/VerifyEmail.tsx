/**
 * ScrollUniversity Email Verification Page
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const email = location.state?.email || searchParams.get('email') || '';
  const token = searchParams.get('token') || searchParams.get('token_hash');
  const type = searchParams.get('type') || 'signup';

  useEffect(() => {
    // If token is present in URL, automatically verify
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;
    
    setVerifying(true);
    setError('');

    try {
      const verificationType = type === 'recovery' || type === 'email_change' ? type : 'signup';
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: verificationType,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth?verified=true');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email. The link may have expired.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address is required to resend verification');
      return;
    }

    setLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) throw error;

      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Verifying your email...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we confirm your email address
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-3xl font-serif text-primary">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-base">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-success/30 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>
                <strong>Success!</strong>
                <br />
                Your account is now active. Redirecting you to sign in...
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-center font-serif text-sm italic text-primary">
                "I have no greater joy than to hear that my children are walking in the truth." - 3 John 1:4
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => navigate('/auth?verified=true')}
              className="w-full"
            >
              Continue to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-serif text-primary">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-base">
            {email ? `We sent a verification link to ${email}` : 'Check your email for a verification link'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="border-success/30 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>
                Verification email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="rounded-lg border border-info/20 bg-info/10 p-4">
              <h4 className="mb-2 font-medium text-foreground">What to do next:</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-foreground/80">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>You'll be redirected back to sign in</li>
                <li>Start your kingdom education journey!</li>
              </ol>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Didn't receive the email?
              </p>
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-center font-serif text-sm italic text-primary">
                "But let all who take refuge in you rejoice; let them ever sing for joy." - Psalm 5:11
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Link
            to="/auth"
            className="text-center text-sm font-medium text-primary hover:underline"
          >
            Back to Sign In
          </Link>
          <div className="text-sm text-center text-muted-foreground">
            Need help?{' '}
            <Link
              to="/help"
              className="font-medium text-primary hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
