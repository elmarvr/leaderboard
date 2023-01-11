import { useOutletContext } from "@remix-run/react";
import type { SupabaseClient } from "@supabase/auth-helpers-remix";
import type { Database } from "supabase.types";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-shared";

export function useSupabase() {
  const { supabase } = useOutletContext<{ supabase: SupabaseClient<Database> }>();

  return supabase;
}

export function createBrowserClient(supabaseUrl: string, supabaseKey: string) {
  return createBrowserSupabaseClient<Database>({
    supabaseUrl,
    supabaseKey,
    options: {
      realtime: {
        params: {
          requestsPerSecond: 10,
        },
      },
    },
  });
}
