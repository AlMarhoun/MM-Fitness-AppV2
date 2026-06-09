import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://hqnkmddktxxawkdnnqwu.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CaX37ju9bM8yTDoOy7-NYQ_bV63B-VC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

