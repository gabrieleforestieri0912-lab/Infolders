-- Tabella condivisa tra sito web ed estensione.
-- L'estensione legge/scrive queste righe con chiave user_id = id utente Supabase Auth.
-- L'auth via form (email/password) crea utenti nella stessa auth.users,
-- quindi sito ed estensione condividono automaticamente gli stessi dati.
-- Esegui una volta nel Supabase SQL Editor (o via psql). Idempotente.

CREATE TABLE IF NOT EXISTS public.user_data (
  user_id text PRIMARY KEY,
  folders jsonb NOT NULL DEFAULT '[]'::jsonb,
  bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  folder_id_counter integer NOT NULL DEFAULT 0,
  premium_data jsonb,
  tombstones jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Ogni utente autenticato puo' leggere/scrivere solo le proprie righe.
DROP POLICY IF EXISTS "user_data_select_own" ON public.user_data;
CREATE POLICY "user_data_select_own" ON public.user_data
  FOR SELECT TO authenticated
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "user_data_insert_own" ON public.user_data;
CREATE POLICY "user_data_insert_own" ON public.user_data
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "user_data_update_own" ON public.user_data;
CREATE POLICY "user_data_update_own" ON public.user_data
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "user_data_delete_own" ON public.user_data;
CREATE POLICY "user_data_delete_own" ON public.user_data
  FOR DELETE TO authenticated
  USING (auth.uid()::text = user_id::text);
