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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(16,185,129,0.2),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.14),transparent_45%)]"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <div className="flex items-center justify-center gap-3 pb-3 text-xs text-slate-500">
          <FooterIdentity email={user?.email} className="text-xs text-slate-500" />
          <VersionFooter compact className="text-xs text-slate-500" />
        </div>
      </div>
    </div>
  );
}
