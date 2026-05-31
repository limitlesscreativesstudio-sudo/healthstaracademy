import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'instructor' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  canEdit: boolean;        // can edit modules, assignments, dashboard
  canManageUsers: boolean; // can add/remove students and staff
  canViewOnly: boolean;    // student read-only mode
}

export interface UpdateProfileResult { error?: string; }

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, chosenRole?: UserRole) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (name: string) => Promise<UpdateProfileResult>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<UpdateProfileResult>;
}

export interface LoginResult {
  error?: string;
  needsRoleSelect?: boolean;   // true when one email has both admin + instructor
  availableRoles?: UserRole[];
}

// ─── Permission rules ─────────────────────────────────────────────────────────
// Only these emails can edit modules and the dashboard
const EDITOR_EMAILS = [
  'healthstaracademy01@gmail.com',
  'limitlesscreativesstudio@gmail.com',
];
const ADMIN_EMAILS = [
  'limitlesscreativesstudio@gmail.com',
];

// Emails that have BOTH admin and instructor roles (two passwords, role selector shown)
const DUAL_ROLE_EMAILS = [
  'limitlesscreativesstudio@gmail.com',
];

// ─── Mock account store ───────────────────────────────────────────────────────
// SWAP: remove this entire block and replace login() with supabase.auth.signInWithPassword
// SWAP: fetch role + permissions from your `profiles` table
interface MockAccount {
  email: string;
  passwordHash: string; // plain text for mock — swap with bcrypt/supabase
  role: UserRole;
  name: string;
}

const MOCK_ACCOUNTS: MockAccount[] = [
  // limitlesscreativesstudio@gmail.com has TWO entries — one per role
  // Each role gets its own password
  {
    email: 'limitlesscreativesstudio@gmail.com',
    passwordHash: 'HSAadmin2026!',   // ← admin password (change this)
    role: 'admin',
    name: 'HSA Administrator',
  },
  {
    email: 'limitlesscreativesstudio@gmail.com',
    passwordHash: 'HSAteach2026!',   // ← instructor password (change this)
    role: 'instructor',
    name: 'HSA Instructor',
  },
  {
    email: 'healthstaracademy01@gmail.com',
    passwordHash: 'HSAteach2026!',   // ← instructor 1 password (change this)
    role: 'instructor',
    name: 'HSA Instructor 1',
  },
  {
    email: 'healthstaracademy01@gmail.com',
    passwordHash: 'HSAteach2026b!',  // ← instructor 2 password (change this)
    role: 'instructor',
    name: 'HSA Instructor 2',
  },
];

// ─── Build AuthUser from account ─────────────────────────────────────────────
const buildUser = (account: MockAccount): AuthUser => {
  const initials = account.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const isEditor = EDITOR_EMAILS.includes(account.email);
  const isAdmin  = ADMIN_EMAILS.includes(account.email) && account.role === 'admin';
  return {
    id:              `${account.email}-${account.role}`,
    name:            account.name,
    email:           account.email,
    role:            account.role,
    avatarInitials:  initials,
    canEdit:         isEditor || isAdmin,
    canManageUsers:  isAdmin,
    canViewOnly:     account.role === 'student',
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY     = 'hsa_teach_auth';
const PWD_STORAGE_KEY = 'hsa_pwd_overrides'; // { [email_role]: newPassword }

// ── Password override helpers (for mock — removed when Supabase is live) ──────
const getPwdOverride = (email: string, role: string): string | null => {
  try {
    const map = JSON.parse(localStorage.getItem(PWD_STORAGE_KEY) ?? '{}');
    return map[`${email}_${role}`] ?? null;
  } catch { return null; }
};
const setPwdOverride = (email: string, role: string, newPwd: string) => {
  try {
    const map = JSON.parse(localStorage.getItem(PWD_STORAGE_KEY) ?? '{}');
    map[`${email}_${role}`] = newPwd;
    localStorage.setItem(PWD_STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  // SWAP: supabase.auth.getSession() + onAuthStateChange
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (
    email: string,
    password: string,
    chosenRole?: UserRole,
  ): Promise<LoginResult> => {
    const trimEmail = email.trim().toLowerCase();
    const trimPass  = password.trim();

    if (!trimEmail) return { error: 'Please enter your email address.' };
    if (!trimPass)  return { error: 'Please enter your password.' };

    // SWAP: const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // SWAP: if (error) return { error: 'Incorrect email or password. Please try again.' };
    // SWAP: const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    // SWAP: if (!profile) return { error: 'Account not found. Contact your administrator.' };
    // SWAP: if (profile.role === 'student') return { error: 'Students access the portal via the student login page.' };
    // SWAP: const authUser = buildUser({ email, passwordHash: '', role: profile.role, name: profile.full_name });
    // SWAP: localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); setUser(authUser); return {};

    // ── Mock login ──────────────────────────────────────────────────────
    // Find all accounts matching this email + password
    // Check localStorage password overrides first (set when user changes their password)
    const matches = MOCK_ACCOUNTS.filter(a => {
      if (a.email !== trimEmail) return false;
      const override = getPwdOverride(a.email, a.role);
      return (override ?? a.passwordHash) === trimPass;
    });

    if (matches.length === 0) {
      // Check if email exists at all (to give a better error)
      const emailExists = MOCK_ACCOUNTS.some(a => a.email === trimEmail);
      return {
        error: emailExists
          ? 'Incorrect password. Please try again.'
          : 'No account found for that email. Check your email or contact your administrator.',
      };
    }

    // Dual-role email with multiple password matches — ask which role
    if (matches.length > 1 && !chosenRole) {
      return {
        needsRoleSelect: true,
        availableRoles: matches.map(m => m.role),
      };
    }

    // Single match OR role already chosen
    const account = chosenRole
      ? matches.find(m => m.role === chosenRole) ?? matches[0]
      : matches[0];

    const authUser = buildUser(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return {};
    // ── End mock ────────────────────────────────────────────────────────
  };

  const updateProfile = async (name: string): Promise<UpdateProfileResult> => {
    if (!user) return { error: 'Not logged in.' };
    if (!name.trim()) return { error: 'Name cannot be empty.' };
    // SWAP: await supabase.from('profiles').update({ full_name: name }).eq('id', user.id);
    const updated: AuthUser = {
      ...user,
      name: name.trim(),
      avatarInitials: name.trim().split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
    return {};
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<UpdateProfileResult> => {
    if (!user) return { error: 'Not logged in.' };
    if (!currentPassword) return { error: 'Please enter your current password.' };
    if (newPassword.length < 8) return { error: 'New password must be at least 8 characters.' };
    // SWAP: const { error } = await supabase.auth.updateUser({ password: newPassword });
    // SWAP: if (error) return { error: error.message };
    // SWAP: return {};

    // ── Mock: verify current password ──────────────────────────────────────
    const override = getPwdOverride(user.email, user.role);
    const account  = MOCK_ACCOUNTS.find(a => a.email === user.email && a.role === user.role);
    const activePassword = override ?? account?.passwordHash ?? '';
    if (currentPassword !== activePassword) {
      return { error: 'Current password is incorrect. Please try again.' };
    }
    setPwdOverride(user.email, user.role, newPassword);
    return {};
    // ── End mock ────────────────────────────────────────────────────────────
  };

  const logout = () => {
    // SWAP: await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, updateProfile, updatePassword }}>
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
