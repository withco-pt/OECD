import { createClient } from "@supabase/supabase-js";

// Cliente Supabase partilhado (leitura pública via RLS).
// A chave publishable é segura para o browser; a escrita fica reservada ao ETL/service role.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltam as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (ver .env.local)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
