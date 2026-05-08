import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/supabase/server";

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getServerUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <div className="min-h-screen bg-white text-[#1A1A2E]">{children}</div>;
}
