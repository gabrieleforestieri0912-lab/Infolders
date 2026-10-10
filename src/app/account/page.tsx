'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../Header';
import Footer from '../Footer';
import { useAuth } from '@/lib/auth-context';
import { getSupabase } from '@/lib/supabase';

interface FolderNode {
  chats?: { url?: string }[];
  subfolders?: FolderNode[];
}

function countChats(folders: FolderNode[]): number {
  let total = 0;
  const walk = (list: FolderNode[]) => {
    for (const f of list || []) {
      total += f.chats?.length || 0;
      if (f.subfolders) walk(f.subfolders);
    }
  };
  walk(folders || []);
  return total;
}

function countFolders(folders: FolderNode[]): number {
  let total = 0;
  const walk = (list: FolderNode[]) => {
    for (const f of list || []) {
      total += 1;
      if (f.subfolders) walk(f.subfolders);
    }
  };
  walk(folders || []);
  return total;
}

interface UserData {
  folders: FolderNode[];
  bookmarks: unknown[];
  premiumData: { plan?: string; active?: boolean; premium?: boolean } | null;
}

export default function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [data, setData] = useState<UserData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Stessa tabella usata dall'estensione (user_data, chiave user_id).
  useEffect(() => {
    if (!user) {
      setData(null);
      return;
    }
    setDataLoading(true);
    getSupabase()
      .from('user_data')
      .select('folders, bookmarks, premium_data')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: row }) => {
        setData({
          folders: (row?.folders as FolderNode[]) || [],
          bookmarks: (row?.bookmarks as unknown[]) || [],
          premiumData: (row?.premium_data as UserData['premiumData']) || null,
        });
        setDataLoading(false);
      });
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  const premium = data?.premiumData;
  const plan = premium?.active || premium?.premium
    ? premium.plan === 'team' ? 'Team' : 'Pro'
    : 'Free';
  const chats = data ? countChats(data.folders) : 0;
  const folders = data ? countFolders(data.folders) : 0;
  const bookmarks = data ? data.bookmarks.length : 0;

  return (
    <div className="min-h-screen bg-[#09000d] font-sans text-white">
      <Header />

      <main className="mx-auto max-w-2xl px-6 pt-32 pb-20">
        {loading ? (
          <p className="py-16 text-center text-sm text-zinc-500">Caricamento...</p>
        ) : !user ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <h1 className="text-2xl font-bold">Non hai effettuato l’accesso</h1>
            <p className="mt-3 text-sm text-zinc-400">
              Accedi o crea un account per vedere il tuo piano e i dati sincronizzati con l’estensione.
            </p>
            <Link
              href="/auth"
              className="mt-8 inline-block rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-8 py-3 text-sm font-semibold transition-all hover:opacity-90"
            >
              Vai al login
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-xl font-bold">
                {(user.email || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight">{user.email}</h1>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Membro dal {new Date(user.created_at).toLocaleDateString('it-IT')}
                </p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                  plan !== 'Free'
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white'
                    : 'border border-white/10 bg-white/5 text-zinc-400'
                }`}
              >
                {plan}
              </span>
            </div>

            {/* Statistiche dal database dell'estensione */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Chat organizzate', value: dataLoading ? '…' : String(chats) },
                { label: 'Cartelle', value: dataLoading ? '…' : String(folders) },
                { label: 'Bookmark', value: dataLoading ? '…' : String(bookmarks) },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center">
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>

            {plan === 'Free' ? (
              <div className="mt-6 rounded-2xl border border-[#a855f7]/20 bg-[#a855f7]/[0.04] p-6 text-center">
                <p className="text-sm font-semibold">Passa a Pro per sbloccare tutto</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Chat illimitate, sync multi-dispositivo, libreria prompt e profili istruzioni.
                </p>
                <Link
                  href="/#pricing"
                  className="mt-4 inline-block rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-6 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                >
                  Vedi i piani
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center text-sm text-emerald-300">
                Il tuo piano {plan} è attivo. Grazie per il supporto!
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
              <p className="max-w-xs text-[11px] leading-relaxed text-zinc-600">
                I dati qui sopra sono letti in tempo reale dalla tabella condivisa con l’estensione.
              </p>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 disabled:opacity-40"
              >
                {signingOut ? 'Uscita...' : 'Esci'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
