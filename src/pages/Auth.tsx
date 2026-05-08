import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from "@/components/brand/Logo";


// Whitelist internal redirects only — prevents open-redirect via ?redirect=https://evil.com
const safeRedirect = (raw: string | null): string => {
  if (!raw) return '/dashboard';
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return '/dashboard';
};

export default function Auth() {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const resetDone = searchParams.get('reset') === 'true';
  const initialTab = (verified || searchParams.get('tab') !== 'signup' ? 'signin' : 'signup') as 'signin' | 'signup';
  const redirect = safeRedirect(searchParams.get('redirect'));

  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If already signed in, send the user where they wanted to go
  useEffect(() => {
    if (!authLoading && user) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, user, redirect, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirect);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast({
        title: 'Reset email sent',
        description: 'Check your email for the password reset link',
      });
      setShowReset(false);
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/auth/callback`,
      });
      if (result.error) {
        toast({
          title: 'Google sign-in failed',
          description: result.error.message || 'Please try again.',
          variant: 'destructive',
        });
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return; // browser redirects to Google
      // Tokens received — auth state listener will navigate
    } catch (err: any) {
      toast({
        title: 'Google sign-in failed',
        description: err.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" to="/" />
        </div>

        <Card className="elevation-2">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-serif">
              {showReset ? 'Reset Password' : tab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {showReset 
                ? 'Enter your email to receive a reset link' 
                : 'Christ-Centered Education for Kingdom Leaders'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verified && (
              <Alert className="mb-4 border-success/30 bg-success/10 text-success-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-foreground">
                  Your email has been verified. You can sign in now.
                </AlertDescription>
              </Alert>
            )}

            {resetDone && (
              <Alert className="mb-4 border-success/30 bg-success/10 text-success-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-foreground">
                  Password updated. Sign in with your new password.
                </AlertDescription>
              </Alert>
            )}

            {showReset ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowReset(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs value={tab} onValueChange={(v) => setTab(v as 'signin' | 'signup')} className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or with email</span>
                  </div>
                </div>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="link" 
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Scripture */}
        <div className="text-center px-6">
          <p className="text-xs italic text-muted-foreground font-serif leading-relaxed">
            "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding." — Proverbs 9:10
          </p>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
