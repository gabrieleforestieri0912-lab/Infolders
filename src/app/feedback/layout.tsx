import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback | InFolders',
  description:
    'Invia feedback su InFolders: segnala bug, proponi funzionalità o raccontaci la tua esperienza con l’estensione per organizzare le conversazioni AI.',
  alternates: {
    canonical: 'https://infolders.vercel.app/feedback',
  },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
