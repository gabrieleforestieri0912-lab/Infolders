import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Stesso progetto Supabase dell'estensione (vedi extension/static/background.js).
// Le env hanno priorità; il fallback garantisce il collegamento al database
// dell'estensione anche senza configurazione aggiuntiva su Vercel.
// La ANON key è pubblica per disegno (è già distribuita nell'estensione).
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wpxcspnugzmkllwedwgz.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndweGNzcG51Z3pta2xsd2Vkd2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzUzNDcsImV4cCI6MjA5NjY1MTM0N30.RpT_-biT3zogGKJWE5b__QKRfJpnf-6qGbXLiTNnqkU';

let browserClient: SupabaseClient | null = null;

/** Singleton client Supabase per il browser (sessione in localStorage). */
export function getSupabase(): SupabaseClient {
  if (browserClient) return browserClient;
  browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

export { SUPABASE_URL };
