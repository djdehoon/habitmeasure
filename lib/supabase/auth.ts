import { getSupabaseBrowserClient } from "@/lib/supabase/client";

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
    },
  ]);

  if (profileError) {
    return {
      error: `Failed to create profile: ${profileError.message}`,
    };
  }

  return { data };
}
