/**
 * ScrollUniversity Forgot Password Page
 * "Cast all your anxiety on him because he cares for you" - 1 Peter 5:7
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/supabase/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-scroll-primary/10 rounded-full flex items-center justify-center mb-2">
            <Mail className="h-8 w-8 text-scroll-primary" />
          </div>
          <CardTitle className="text-3xl font-serif text-scroll-primary">
            Reset Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Check your email!</strong>
                <br />
                We've sent password reset instructions to <strong>{email}</strong>.
                The link will expire in 1 hour.
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-scroll-primary hover:bg-scroll-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the reset link in the email</li>
                <li>• Create a new secure password</li>
                <li>• Sign in with your new password</li>
              </ul>
            </div>

            <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20">
              <p className="text-sm text-center italic text-scroll-primary font-serif">
                "The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Link
            to="/auth/login"
            className="flex items-center justify-center text-sm text-scroll-primary hover:underline font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-scroll-primary hover:underline font-medium"
            >
              Create one now
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
