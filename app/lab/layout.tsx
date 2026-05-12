import { redirect } from "next/navigation";
import { FooterIdentity } from "@/app/components/FooterIdentity";
import { getServerUser, getSupabaseServerClient } from "@/lib/supabase/server";
import { VersionFooter } from "@/app/components/VersionFooter";

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getServerUser();

  if (!user) {
    redirect("/auth/login");
  }

  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_beta_tester")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || profile.is_beta_tester !== true) {
    redirect("/beta?notice=invite_required");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1A1A2E]">
      <div className="flex-1">{children}</div>
      <div className="flex items-center justify-center gap-3 pb-3 text-xs text-[#9CA3AF]">
        <FooterIdentity email={user?.email} className="text-xs text-[#9CA3AF]" />
        <VersionFooter compact className="text-xs text-[#9CA3AF]" />
      </div>
    </div>
  );
}
