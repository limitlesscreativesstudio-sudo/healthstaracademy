import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Re-export shared client so existing imports keep working
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
  role?: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, chosenRole?: UserRole) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (fields: { name: string; jobTitle?: string; phone?: string; bio?: string }) => Promise<UpdateProfileResult>;
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

const pickPrimaryRole = (roles: UserRole[]): UserRole | null => {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('instructor')) return 'instructor';
  if (roles.includes('student')) return 'student';
  return null;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe FIRST to avoid missing the SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Defer DB calls so we don't block the auth callback
        setTimeout(() => hydrateUser(session.user.id, session.user.email ?? ''), 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await hydrateUser(session.user.id, session.user.email ?? '');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hydrateUser = async (id: string, email: string): Promise<UserRole | null> => {
    const [{ data: profile }, { data: roleRows, error: rolesError }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('user_id', id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', id),
    ]);

    if (rolesError) {
      setUser(null);
      return null;
    }

    const role = pickPrimaryRole((roleRows ?? []).map(r => r.role as UserRole));
    if (!role) { setUser(null); return null; }

    setUser(buildUser(id, email, profile?.full_name || email, role));
    return role;
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
  ): Promise<LoginResult> => {
    const trimEmail = email.trim().toLowerCase();
    const loginPassword  = password;

    if (!trimEmail) return { error: 'Please enter your email address.' };
    if (!loginPassword)  return { error: 'Please enter your password.' };

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimEmail,
      password: loginPassword,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid')) {
        return { error: 'Incorrect email or password. Please try again.' };
      }
      if (error.message.toLowerCase().includes('not confirmed')) {
        return { error: 'Please check your email and confirm your account before signing in.' };
      }
      return { error: error.message };
    }
    if (!data.user) return { error: 'Login failed. Please try again.' };

    const role = await hydrateUser(data.user.id, data.user.email ?? trimEmail);

    if (!role) {
      await supabase.auth.signOut();
      return { error: 'Your account exists, but portal access has not been assigned yet. Contact your Health Star Academy administrator.' };
    }

    import('@/lib/authFeedback').then(({ logAuthEvent }) =>
      logAuthEvent({
        eventType: 'login_success',
        userId: data.user!.id,
        email: data.user!.email ?? trimEmail,
        userRole: role,
      })
    ).catch(() => {});

    return { role };
  };

  const updateProfile = async (
    fields: { name: string; jobTitle?: string; phone?: string; bio?: string }
  ): Promise<UpdateProfileResult> => {
    if (!user) return { error: 'Not logged in.' };
    const name = fields.name.trim();
    if (!name) return { error: 'Name cannot be empty.' };

    const patch: Record<string, unknown> = {
      full_name: name,
      job_title: fields.jobTitle ?? null,
      phone: fields.phone ?? null,
      bio: fields.bio ?? null,
      updated_at: new Date().toISOString(),
    };

    // Upsert to handle the case where a profile row doesn't yet exist.
    const { error } = await supabase
      .from('profiles')
      .upsert({ user_id: user.id, ...patch }, { onConflict: 'user_id' });
    if (error) return { error: error.message };

    setUser(prev => prev ? {
      ...prev,
      name,
      avatarInitials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    } : null);
    return {};
  };

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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAuthenticated: !!user,
      updateProfile, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
