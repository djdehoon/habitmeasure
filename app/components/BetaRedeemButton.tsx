"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { redeemInviteCode } from "@/lib/beta/redeemInviteCode";
import { getBrowserUser } from "@/lib/supabase/auth";

export function BetaRedeemButton({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setLoading(true);

    try {
      const { user } = await getBrowserUser();
      if (!user) {
        setError("You must be logged in to redeem an invite.");
        setLoading(false);
        return;
      }

      const result = await redeemInviteCode(user.id, inviteCode);
      if (!result.ok) {
        setError(result.error ?? "Could not redeem invite.");
        setLoading(false);
        return;
      }

      router.replace("/lab");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={loading}
        onClick={() => void onClick()}
        className="btn-primary w-full py-3 text-sm disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? "Activating…" : "Activate beta with this invite"}
      </button>
    </div>
  );
}
