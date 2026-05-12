import Link from "next/link";
import { redirect } from "next/navigation";
import { BetaRedeemButton } from "@/app/components/BetaRedeemButton";
import { BetaSignupForm } from "@/app/components/BetaSignupForm";
import { checkInviteCodeValid, getBetaInviteServiceClient, normalizeInviteCode } from "@/lib/beta/verifyInvite";
import { getServerUser } from "@/lib/supabase/server";
import { checkUserBetaStatus } from "@/lib/beta/betaPageActions";

export default async function BetaPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; code?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const { notice } = params;
  const rawInvite = typeof params.invite === "string" ? params.invite : undefined;
  const rawLegacyCode = typeof params.code === "string" ? params.code : undefined;

  // Supabase Auth PKCE/OAuth also uses `code` in the URL; redirect legacy invite links away from `code`.
  if (rawLegacyCode !== undefined && rawInvite === undefined) {
    const normalizedLegacy = normalizeInviteCode(rawLegacyCode);
    const q = new URLSearchParams();
    if (normalizedLegacy) q.set("invite", normalizedLegacy);
    if (typeof notice === "string") q.set("notice", notice);
    redirect(`/beta?${q.toString()}`);
  }

  const code = normalizeInviteCode(rawInvite ?? rawLegacyCode);

  const { user } = await getServerUser();

  // ✅ Use Server Action instead of direct getSupabaseServerClient()
  if (user) {
    const isBetaTester = await checkUserBetaStatus(user.id);
    if (isBetaTester) {
      redirect("/lab");
    }
  }

  const service = getBetaInviteServiceClient();
  if (!service) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <BetaHeader />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="max-w-md text-center text-slate-600">
            Beta invites are temporarily unavailable (server configuration). Please try again later.
          </p>
        </div>
      </main>
    );
  }

  if (!code) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <BetaHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
          <h1 className="heading-font text-2xl font-bold text-slate-800">Beta access is invite-only</h1>
          {notice === "invite_required" ? (
            <p className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              The lab is restricted to beta testers. Use your invite link with an <span className="font-mono">invite</span>{" "}
              query parameter, or ask the team for access.
            </p>
          ) : null}
          <p className="max-w-md text-slate-600">
            Use the invite link you received (it looks like{" "}
            <span className="font-mono text-sm text-slate-800">/beta?invite=…</span>). If you do not have one, you can
            still browse the{" "}
            <Link href="/" className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
              marketing site
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const inviteValid = await checkInviteCodeValid(code);

  if (user && !inviteValid) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <BetaHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
          <h1 className="heading-font text-2xl font-bold text-slate-800">This account is not in the beta</h1>
          <p className="max-w-md text-slate-600">
            You are signed in, but this invite link is invalid or expired. Ask the team for a new link, or go home.
          </p>
          <Link href="/" className="text-sm font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
            Home
          </Link>
        </div>
      </main>
    );
  }

  if (user && inviteValid) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <BetaHeader />
        <div className="flex flex-1 items-center justify-center p-4 py-10 sm:py-12">
          <div className="w-full max-w-md rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_8px_24px_rgba(100,116,139,0.08)] sm:p-8">
            <h1 className="heading-font text-2xl font-bold text-slate-800">Activate beta</h1>
            <p className="mt-2 text-sm text-slate-600">
              You are logged in as <span className="font-medium text-slate-800">{user.email}</span>. Redeem this invite
              to unlock the lab for this account.
            </p>
            <BetaRedeemButton inviteCode={code} />
            <p className="mt-6 text-center text-xs text-slate-500">
              Wrong account?{" "}
              <Link href="/auth/login" className="font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
                Switch user
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!inviteValid) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <BetaHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
          <h1 className="heading-font text-2xl font-bold text-slate-800">Invalid or expired invite</h1>
          <p className="max-w-md text-slate-600">Check the link or ask the team for a new beta invite.</p>
          <Link href="/" className="text-sm font-semibold text-[#5a7d72] underline-offset-2 hover:underline">
            Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <BetaHeader />
      <div className="flex flex-1 items-center justify-center p-4 py-10 sm:py-12">
        <BetaSignupForm inviteCode={code} />
      </div>
    </main>
  );
}

function BetaHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="container-shell flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-2 heading-font text-sm font-bold text-slate-800 sm:text-base">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#8BA2B5]" aria-hidden />
          HabitMeasure
        </Link>
        <Link href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
          Home
        </Link>
      </div>
    </header>
  );
}
