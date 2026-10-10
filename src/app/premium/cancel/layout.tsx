import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pagamento annullato | InFolders',
  robots: { index: false, follow: false },
};

export default function PremiumCancelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
