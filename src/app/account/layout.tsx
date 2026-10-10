import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Il tuo account | InFolders',
  description: 'Gestisci il tuo account InFolders: piano, cartelle e sincronizzazione con l’estensione.',
  alternates: {
    canonical: 'https://infolders.vercel.app/account',
  },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
