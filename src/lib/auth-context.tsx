'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Messaggi di errore Supabase tradotti in italiano. */
export function translateAuthError(message: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Esiste già un account con questa email. Accedi invece di registrarti.';
  }
  if (m.includes('invalid login credentials')) {
    return 'Email o password non corretti.';
  }
  if (m.includes('email not confirmed')) {
    return 'Devi prima confermare la tua email: controlla la posta in arrivo.';
  }
  if (m.includes('password should be at least')) {
    return 'La password deve avere almeno 6 caratteri.';
  }
  if (m.includes('unable to validate email') || m.includes('invalid email')) {
    return 'Indirizzo email non valido.';
  }
  if (m.includes('signup is disabled') || m.includes('signups not allowed')) {
    return 'Le registrazioni sono momentaneamente disabilitate.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Troppi tentativi. Aspetta qualche minuto e riprova.';
  }
  return message || 'Si è verificato un errore. Riprova.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextValue['signUp'] = async (email, password) => {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
    // Se la conferma email è attiva, non c'è ancora una sessione.
    return { needsConfirmation: !data.session };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));
  };

  const signOut: AuthContextValue['signOut'] = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve essere usato dentro <AuthProvider>');
  return ctx;
}
