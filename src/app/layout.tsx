import type { Metadata, Viewport } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const SITE_URL = 'https://infolders.vercel.app';
const SITE_NAME = 'InFolders';
const OG_IMAGE = `${SITE_URL}/infolders.png`;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09000d',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "InFolders — Organizza le tue conversazioni AI in cartelle",
    template: "%s | InFolders"
  },
  description: "InFolders è un'estensione browser che organizza le conversazioni AI da ChatGPT, Gemini, Claude e Perplexity in cartelle, bookmark, prompt e profili istruzioni. Multi-dispositivo, drag & drop, ricerca globale.",
  keywords: ["InFolders", "ChatGPT folders", "Gemini folders", "Claude folders", "Perplexity folders", "organize AI chats", "organizzare conversazioni AI", "estensione Chrome AI", "browser extension", "AI sidebar", "ChatGPT bookmarks", "prompt library", "cartelle ChatGPT", "organizzare ChatGPT"],
  authors: [{ name: "InFolders Team" }],
  creator: "InFolders",
  publisher: "InFolders",
  category: "technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'it-IT': SITE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: '/icon-128.png',
    shortcut: '/icon-48.png',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'InFolders — Organizza le tue conversazioni AI',
    description: "Cartelle, bookmark, prompt e profili istruzioni per ChatGPT, Gemini, Claude e Perplexity. Estensione gratuita per Chrome.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1024,
        height: 1024,
        alt: 'InFolders — Organizza le tue conversazioni AI in cartelle',
      }
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InFolders — Organizza le tue conversazioni AI',
    description: "Cartelle, bookmark, prompt e profili istruzioni per ChatGPT, Gemini, Claude e Perplexity. Gratis per Chrome.",
    images: [OG_IMAGE],
    creator: '@infolders',
  },
  verification: {
    // TODO: incolla qui il codice di Google Search Console dopo la verifica
    // google: 'INSERISCI-CODICE-VERIFICA-GOOGLE',
  },
};

function JsonLd() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "it-IT",
    description: "InFolders è un'estensione browser che organizza le conversazioni AI in cartelle, bookmark, prompt e profili istruzioni.",
  };
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: OG_IMAGE,
  };
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "InFolders",
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    url: SITE_URL,
    image: OG_IMAGE,
    description: "Estensione Chrome che organizza le conversazioni AI da ChatGPT, Gemini, Claude e Perplexity in cartelle, bookmark, prompt e profili istruzioni.",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "EUR", name: "Free" },
      { "@type": "Offer", price: "9.99", priceCurrency: "EUR", name: "Pro" },
      { "@type": "Offer", price: "29.99", priceCurrency: "EUR", name: "Team" },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className="h-full antialiased"
    >
      <head>
        <JsonLd />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
