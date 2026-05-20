import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { redeemInviteCode } from "@/lib/beta/redeemInviteCode";

export async function getBrowserUser() {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}

type SignUpResult = {
  data?: {
    user: {
      id: string;
      identities?: unknown[];
    } | null;
  } | null;
  error?: string;
};

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  middleName?: string,
  inviteCode?: string,
): Promise<SignUpResult> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const hasNoUser = !data?.user;
  const hasEmptyIdentities = Array.isArray(data?.user?.identities) && data.user.identities.length === 0;

  if (error || hasNoUser || hasEmptyIdentities) {
    return { error: "Account already exists. Please login instead." };
  }

  if (!lastName.trim()) {
    return { error: "Last name is required." };
  }

  const { error: profileError } = await supabase.from("user_profiles").insert([
    {
      user_id: data.user.id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      middle_name: middleName?.trim() ? middleName.trim() : null,
      email: email.trim(),
      is_beta_tester: false,
    },
  ]);

  if (profileError) {
    return {
      error: `Failed to create profile: ${profileError.message}`,
    };
  }

  // If invite code provided, redeem it
  if (inviteCode) {
    const redeemResult = await redeemInviteCode(data.user.id, inviteCode);
    if (!redeemResult.ok) {
      return {
        error: `Account created but beta activation failed: ${redeemResult.error}`,
      };
    }
  }

  return { data };
}

const MIN_PASSWORD_LENGTH = 6;

export type PasswordActionResult = { ok: true } | { ok: false; error: string };

function buildPasswordRecoveryRedirectTo(siteUrl: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? siteUrl).replace(/\/$/, "");
  const next = encodeURIComponent("/auth/update-password");
  return `${base}/auth/callback?next=${next}`;
}

export async function requestPasswordReset(email: string, siteUrl: string): Promise<PasswordActionResult> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: buildPasswordRecoveryRedirectTo(siteUrl),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function updatePasswordAfterRecovery(newPassword: string): Promise<PasswordActionResult> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
