/**
 * ScrollUniversity Reset Password Page
 * "Create in me a pure heart, O God" - Psalm 51:10
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [token, setToken] = useState('');

  useEffect(() => {
    // Extract token from URL
    const accessToken = searchParams.get('access_token') || searchParams.get('token');
    if (!accessToken) {
      setError('Invalid or expired reset link. Please request a new one.');
    } else {
      setToken(accessToken);
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough].filter(Boolean).length;

    if (strengthScore <= 2) return 'weak';
    if (strengthScore <= 4) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(validatePassword(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength === 'weak') {
      setError('Please choose a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/supabase/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login?reset=success');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again or request a new reset link.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-scroll-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-scroll-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-8 w-8 text-scroll-primary" />
          </div>
          <CardTitle className="text-3xl font-serif text-scroll-primary">
            Create New Password
          </CardTitle>
          <CardDescription className="text-base">
            Choose a strong password for your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Password reset successful!</strong>
                <br />
                Redirecting you to sign in...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${getPasswordStrengthColor()} ${getPasswordStrengthWidth()}`} />
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">{passwordStrength}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use 8+ characters with uppercase, lowercase, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-scroll-primary hover:bg-scroll-primary/90"
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20">
            <p className="text-sm text-center italic text-scroll-primary font-serif">
              "He restores my soul. He leads me in paths of righteousness for his name's sake." - Psalm 23:3
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Link
            to="/auth/login"
            className="text-sm text-center text-scroll-primary hover:underline font-medium"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
