import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createClient("https://placeholder.supabase.co", "placeholder") as SupabaseClient;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
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