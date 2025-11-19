/**
 * ScrollUniversity Login Page
 * "I am the way, the truth, and the life" - John 14:6
 */

import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle, Chrome } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const verificationSuccess = searchParams.get('verified') === 'true';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'microsoft') => {
    setError('');
    setLoading(true);

    try {
      // This will be implemented with Supabase social auth
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
      
      // Call backend to initiate OAuth flow
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/supabase/social/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectTo: redirectUrl })
      });

      const data = await response.json();
      
      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error('Failed to initiate social authentication');
      }
    } catch (err: any) {
      setError(err.message || 'Social authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-scroll-primary/10 rounded-full flex items-center justify-center mb-2">
            <span className="text-3xl">📜</span>
          </div>
          <CardTitle className="text-3xl font-serif text-scroll-primary">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to continue your kingdom education journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {verificationSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email verified successfully! You can now sign in.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-scroll-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  minLength={8}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              className="w-full"
            >
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSocialAuth('microsoft')}
              disabled={loading}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                <path d="M0 0h11v11H0z" fill="#f25022" />
                <path d="M12 0h11v11H12z" fill="#00a4ef" />
                <path d="M0 12h11v11H0z" fill="#7fba00" />
                <path d="M12 12h11v11H12z" fill="#ffb900" />
              </svg>
              Microsoft
            </Button>
          </div>

          <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20">
            <p className="text-sm text-center italic text-scroll-primary font-serif">
              "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
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
