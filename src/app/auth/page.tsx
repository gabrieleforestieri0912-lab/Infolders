'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../Header';
import Footer from '../Footer';
import { useAuth } from '@/lib/auth-context';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/account');
  }, [loading, user, router]);

  if (!loading && user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.trim() || !password) {
      setError('Inserisci email e password.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        router.replace('/account');
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setInfo('Account creato! Controlla la tua email e clicca il link di conferma prima di accedere.');
          setMode('login');
        } else {
          router.replace('/account');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'operazione.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">
      <Header />

      <main className="mx-auto max-w-md px-6 pt-32 pb-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image src="/icon-128.png" alt="InFolders" width={56} height={56} className="rounded-2xl shadow-xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === 'login' ? 'Bentornato' : 'Crea il tuo account'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login'
              ? 'Accedi con email e password. Lo stesso account vale per sito ed estensione.'
              : 'Registrati con email e password. I tuoi dati si sincronizzano con l\u2019estensione.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setInfo(''); }}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                mode === m ? 'bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Accedi' : 'Registrati'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div>
            <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@esempio.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-[#a855f7]/40 focus:bg-[#a855f7]/5"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Password {mode === 'signup' && <span className="font-normal text-zinc-500">(min. 6 caratteri)</span>}
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-[#a855f7]/40 focus:bg-[#a855f7]/5"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] py-3 text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_24px_rgba(168,85,247,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Attendi...' : mode === 'login' ? 'Accedi' : 'Crea account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-zinc-600">
          Usando InFolders accetti i nostri{' '}
          <Link href="/terms" className="text-zinc-400 hover:text-white hover:underline">
            Termini di Servizio
          </Link>{' '}
          e la{' '}
          <Link href="/privacy" className="text-zinc-400 hover:text-white hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
