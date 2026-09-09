import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Warning: Supabase environment variables are missing in .env.local");
}

export const supabase = createClient(
  supabaseUrl || "https://xeqtggywsdyrqsmxkatb.supabase.co",
  supabaseKey || "placeholder-anon-key"
);

