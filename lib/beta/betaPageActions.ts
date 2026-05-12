"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function checkUserBetaStatus(userId: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_beta_tester")
    .eq("user_id", userId)
    .maybeSingle();

  return profile?.is_beta_tester === true;
}
