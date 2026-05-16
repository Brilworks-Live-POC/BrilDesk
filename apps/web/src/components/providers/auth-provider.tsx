'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@brildesk/shared';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  teamId: string | null;
  name: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function loadUser(sbUser: User) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single();

      if (profile) {
        setUser({
          id: sbUser.id,
          email: sbUser.email!,
          role: profile.role as UserRole,
          teamId: profile.team_id,
          name: profile.name,
        });
      }
      setSupabaseUser(sbUser);
      setLoading(false);
    }

    supabase.auth.getUser().then(({ data: { user: sbUser } }) => {
      if (sbUser) {
        loadUser(sbUser);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser(session.user);
      } else {
        setUser(null);
        setSupabaseUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
