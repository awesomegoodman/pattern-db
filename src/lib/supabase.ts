import { createClient } from '@supabase/supabase-js';

// Browser-safe client (anon key only).
// Use this for auth and real-time. All data queries go through db.ts (Drizzle).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
