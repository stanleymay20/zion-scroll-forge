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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/supabase/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Email verification failed');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login?verified=true');
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/supabase/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-scroll-primary" />
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-serif text-scroll-primary">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-base">
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Success!</strong>
                <br />
                Your account is now active. Redirecting you to sign in...
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20">
              <p className="text-sm text-center italic text-scroll-primary font-serif">
                "I have no greater joy than to hear that my children are walking in the truth." - 3 John 1:4
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => navigate('/auth/login?verified=true')}
              className="w-full bg-scroll-primary hover:bg-scroll-primary/90"
            >
              Continue to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-scroll-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="h-8 w-8 text-scroll-primary" />
          </div>
          <CardTitle className="text-3xl font-serif text-scroll-primary">
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
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Verification email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What to do next:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
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

            <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20">
              <p className="text-sm text-center italic text-scroll-primary font-serif">
                "But let all who take refuge in you rejoice; let them ever sing for joy." - Psalm 5:11
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Link
            to="/auth/login"
            className="text-sm text-center text-scroll-primary hover:underline font-medium"
          >
            Back to Sign In
          </Link>
          <div className="text-sm text-center text-muted-foreground">
            Need help?{' '}
            <Link
              to="/help"
              className="text-scroll-primary hover:underline font-medium"
            >
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
