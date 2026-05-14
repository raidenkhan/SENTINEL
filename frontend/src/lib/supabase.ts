import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance as SupabaseClient;
}

export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  from(table: string) {
    return getSupabaseClient().from(table);
  },
  storage: {
    getStorage() {
      return getSupabaseClient().storage;
    }
  }
} as any;
