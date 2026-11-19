import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { sleep } from './utils';

// ============================================================================
// CREDISENSE MOCK AUTHENTICATION LAYER
// NOTE FOR BACKEND REPLACEMENT:
// To connect real Supabase Auth, replace the implementation of the functions
// below with calls to `@supabase/supabase-js`. The component layer interacts
// strictly with useAuth() and does not require changes.
// ============================================================================

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  monthlyIncome?: number;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthContextType {
  user: User | null;
  sessionChecked: boolean;
  isLoading: boolean;
  signUp: (data: SignUpData) => Promise<User>;
  signIn: (data: SignInData) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const STORAGE_KEY_SESSION = 'credisense_auth_session';
const STORAGE_KEY_USERS = 'credisense_registered_users';

// Pre-seeded mock personas for testing lending journeys
const INITIAL_MOCK_USERS: Array<User & { passwordHash: string }> = [
  {
    id: 'user_aman',
    name: 'Aman Sharma',
    email: 'aman@example.com',
    phone: '+91 98765 43210',
    avatar: 'A',
    monthlyIncome: 10000,
    createdAt: new Date().toISOString(),
    passwordHash: 'password123',
  },
  {
    id: 'user_priya',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 98234 56789',
    avatar: 'P',
    monthlyIncome: 40000,
    createdAt: new Date().toISOString(),
    passwordHash: 'password123',
  },
  {
    id: 'user_ravi',
    name: 'Ravi Verma',
    email: 'ravi@example.com',
    phone: '+91 98111 22334',
    avatar: 'R',
    monthlyIncome: 25000,
    createdAt: new Date().toISOString(),
    passwordHash: 'password123',
  },
  {
    id: 'user_demo',
    name: 'Ananya Rao',
    email: 'demo@credisense.ai',
    phone: '+91 99999 88888',
    avatar: 'A',
    monthlyIncome: 50000,
    createdAt: new Date().toISOString(),
    passwordHash: 'password123',
  },
];

function getStoredUsers(): Array<User & { passwordHash: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_MOCK_USERS));
      return INITIAL_MOCK_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_USERS;
  }
}

function saveStoredUsers(users: Array<User & { passwordHash: string }>) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getRandomDelay(min = 600, max = 1200): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// CORE AUTHENTICATION API
// ============================================================================

/**
 * Sign up a new customer.
 * 
 * --- SUPABASE INTEGRATION POINT ---
 * Replace with:
 * const { data, error } = await supabase.auth.signUp({
 *   email: data.email,
 *   password: data.password,
 *   options: {
 *     data: { full_name: data.name, phone: data.phone, monthly_income: data.monthlyIncome }
 *   }
 * });
 * if (error) throw new Error(error.message);
 * return mapSupabaseUserToUser(data.user);
 */
export async function signUp(data: SignUpData): Promise<User> {
  await sleep(getRandomDelay());

  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists. Please sign in.');
  }

  const newUser: User & { passwordHash: string } = {
    id: `user_${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    avatar: data.name.trim().charAt(0).toUpperCase() || 'U',
    monthlyIncome: data.monthlyIncome || 35000,
    createdAt: new Date().toISOString(),
    passwordHash: data.password,
  };

  users.push(newUser);
  saveStoredUsers(users);

  // Set active session
  const safeUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    avatar: newUser.avatar,
    monthlyIncome: newUser.monthlyIncome,
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(safeUser));
  return safeUser;
}

/**
 * Sign in an existing customer with email and password.
 * 
 * --- SUPABASE INTEGRATION POINT ---
 * Replace with:
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: data.email,
 *   password: data.password,
 * });
 * if (error) throw new Error(error.message);
 * return mapSupabaseUserToUser(data.user);
 */
export async function signIn(data: SignInData): Promise<User> {
  await sleep(getRandomDelay());

  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());

  if (!found) {
    throw new Error('No account found with this email. Please check your credentials or sign up.');
  }

  if (found.passwordHash !== data.password) {
    throw new Error('Incorrect password. Please verify and try again.');
  }

  const safeUser: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    phone: found.phone,
    avatar: found.avatar,
    monthlyIncome: found.monthlyIncome,
    createdAt: found.createdAt,
  };

  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(safeUser));
  return safeUser;
}

/**
 * Sign out current customer.
 * 
 * --- SUPABASE INTEGRATION POINT ---
 * Replace with:
 * await supabase.auth.signOut();
 */
export async function signOut(): Promise<void> {
  await sleep(400);
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

/**
 * Get currently authenticated customer session from storage.
 * 
 * --- SUPABASE INTEGRATION POINT ---
 * Replace with:
 * const { data: { session } } = await supabase.auth.getSession();
 * return session ? mapSupabaseUserToUser(session.user) : null;
 */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Send password reset instructions.
 * 
 * --- SUPABASE INTEGRATION POINT ---
 * Replace with:
 * await supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' });
 */
export async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
  await sleep(getRandomDelay());
  return {
    success: true,
    message: `Password reset instructions have been dispatched to ${email}.`,
  };
}

// ============================================================================
// REACT AUTH CONTEXT & HOOK
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check local session on boot
    const stored = getCurrentUser();
    setUser(stored);
    setSessionChecked(true);
  }, []);

  const handleSignUp = async (data: SignUpData): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await signUp(data);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInData): Promise<User> => {
    setIsLoading(true);
    try {
      const u = await signIn(data);
      setUser(u);
      return u;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    return await resetPassword(email);
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        sessionChecked,
        isLoading,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
      },
    },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
