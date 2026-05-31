import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase client ──────────────────────────────────────────────────────────
// Uses Lovable's env vars (VITE_SUPABASE_PUBLISHABLE_KEY = anon key)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export { supabase };

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'instructor' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  canEdit: boolean;
  canManageUsers: boolean;
  canViewOnly: boolean;
}

export interface UpdateProfileResult { error?: string; }

export interface LoginResult {
  error?: string;
  needsRoleSelect?: boolean;
  availableRoles?: UserRole[];
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, chosenRole?: UserRole) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (name: string) => Promise<UpdateProfileResult>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<UpdateProfileResult>;
}

// ─── Permission helpers ───────────────────────────────────────────────────────
const buildUser = (id: string, email: string, name: string, role: UserRole): AuthUser => {
  const initials = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    avatarInitials: initials,
    canEdit:        role === 'admin' || role === 'instructor',
    canManageUsers: role === 'admin',
    canViewOnly:    role === 'student',
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on page load ─────────────────────────────────────────
  useEffect(() => {
    // Get current session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await hydrateUser(session.user.id, session.user.email ?? '');
      }
      setLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await hydrateUser(session.user.id, session.user.email ?? '');
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile from DB and set user state
  const hydrateUser = async (id: string, email: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', id)
      .single();

    if (profile) {
      setUser(buildUser(id, email, profile.full_name, profile.role as UserRole));
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    _chosenRole?: UserRole,
  ): Promise<LoginResult> => {
    const trimEmail = email.trim().toLowerCase();
    const trimPass  = password.trim();

    if (!trimEmail) return { error: 'Please enter your email address.' };
    if (!trimPass)  return { error: 'Please enter your password.' };

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    trimEmail,
      password: trimPass,
    });

    if (error) {
      // Friendly messages
      if (error.message.includes('Invalid login')) {
        return { error: 'Incorrect email or password. Please try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Please check your email and confirm your account before signing in.' };
      }
      return { error: error.message };
    }

    if (!data.user) return { error: 'Login failed. Please try again.' };

    // Check profile exists and role is not student (students use separate portal)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return { error: 'Account not found. Contact your administrator.' };
    }

    if (profile.role === 'student') {
      await supabase.auth.signOut();
      return { error: 'Students access the portal via the student login page.' };
    }

    // hydrateUser will be called automatically via onAuthStateChange
    return {};
  };

  // ── Update profile name ───────────────────────────────────────────────────
  const updateProfile = async (name: string): Promise<UpdateProfileResult> => {
    if (!user) return { error: 'Not logged in.' };
    if (!name.trim()) return { error: 'Name cannot be empty.' };

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim() })
      .eq('id', user.id);

    if (error) return { error: error.message };

    setUser(prev => prev ? {
      ...prev,
      name: name.trim(),
      avatarInitials: name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    } : null);

    return {};
  };

  // ── Update password ───────────────────────────────────────────────────────
  const updatePassword = async (
    _currentPassword: string,
    newPassword: string,
  ): Promise<UpdateProfileResult> => {
    if (!user) return { error: 'Not logged in.' };
    if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      updateProfile,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
