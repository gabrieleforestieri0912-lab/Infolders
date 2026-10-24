-- Libreria prompt sincronizzata: colonna aggiunta a user_data (stesso modello di folders/bookmarks).
-- Idempotente: esegui una volta nel Supabase SQL Editor (o via psql) se non usi le migrations.

ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS prompts jsonb NOT NULL DEFAULT '[]'::jsonb;
