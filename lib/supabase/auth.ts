import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getBrowserUser() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}
