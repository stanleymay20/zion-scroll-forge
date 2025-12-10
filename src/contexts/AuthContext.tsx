import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh interval (45 minutes - tokens typically expire in 1 hour)
const REFRESH_INTERVAL = 45 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatic token refresh
  const setupTokenRefresh = useCallback((session: Session | null) => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (session) {
      // Calculate time until token expires
      const expiresAt = session.expires_at ? session.expires_at * 1000 : Date.now() + 3600000;
      const timeUntilExpiry = expiresAt - Date.now();
      
      // Refresh 5 minutes before expiry or use default interval
      const refreshTime = Math.min(timeUntilExpiry - 5 * 60 * 1000, REFRESH_INTERVAL);
      
      if (refreshTime > 0) {
        refreshTimerRef.current = setTimeout(async () => {
          try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            
            if (data.session) {
              setSession(data.session);
              setUser(data.session.user);
              setupTokenRefresh(data.session);
            }
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Don't show toast for silent refresh failures
          }
        }, refreshTime);
      }
    }
  }, []);

  // Manual session refresh
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setupTokenRefresh(data.session);
      }
    } catch (error: any) {
      console.error('Session refresh failed:', error);
      toast({
        title: 'Session refresh failed',
        description: 'Please sign in again',
        variant: 'destructive',
      });
      throw error;
    }
  }, [setupTokenRefresh, toast]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('✝️ Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Set up automatic token refresh
        setupTokenRefresh(session);
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          // Clear any stored tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('✝️ Token refreshed successfully');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setupTokenRefresh(session);
    });

    return () => {
      subscription.unsubscribe();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [setupTokenRefresh]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created successfully',
        description: 'Welcome to ScrollUniversity! You can now sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Signed in successfully',
        description: 'Welcome back to ScrollUniversity!',
      });
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out successfully',
        description: 'Come back soon!',
      });
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      refreshSession,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
