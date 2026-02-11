import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { username: string; id: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = useCallback(async (supaUser: User | null) => {
    if (!supaUser) {
      setUser(null);
      return;
    }
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', supaUser.id)
      .maybeSingle();

    setUser({
      id: supaUser.id,
      username: profile?.username || supaUser.email?.split('@')[0] || 'Usuário',
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await mapUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await mapUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mapUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, []);

  const signup = useCallback(async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username },
      },
    });
    if (error) return { error: error.message };
    return {};
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
