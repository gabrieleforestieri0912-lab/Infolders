import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'InFolders — Organizza le tue conversazioni AI',
    short_name: 'InFolders',
    description:
      'Estensione browser che organizza le conversazioni AI da ChatGPT, Gemini, Claude e Perplexity in cartelle, bookmark, prompt e profili istruzioni.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09000d',
    theme_color: '#09000d',
    lang: 'it-IT',
    icons: [
      {
        src: '/icon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/infolders.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
