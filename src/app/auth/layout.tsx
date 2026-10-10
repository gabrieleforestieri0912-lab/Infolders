import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accedi o registrati | InFolders',
  description:
    'Accedi al tuo account InFolders o creane uno nuovo con email e password per gestire il tuo piano e i tuoi dati.',
  alternates: {
    canonical: 'https://infolders.vercel.app/auth',
  },
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
