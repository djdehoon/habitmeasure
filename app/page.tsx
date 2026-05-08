import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { PhoneMockups } from "@/components/PhoneMockups";
import { Pricing } from "@/components/Pricing";
import { PreviewShowcase } from "@/components/PreviewShowcase";
import { Problem } from "@/components/Problem";
import { Stats } from "@/components/Stats";
import { TimerPreviewCards } from "@/components/TimerPreviewCards";
import { Waitlist } from "@/components/Waitlist";
import { FooterIdentity } from "@/app/components/FooterIdentity";
import { VersionFooter } from "@/app/components/VersionFooter";
import { getServerUser } from "@/lib/supabase/server";

export default async function Home() {
  const { user } = await getServerUser();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <PreviewShowcase />
        <Features />
        <TimerPreviewCards />
        <PhoneMockups />
        <Stats />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
      <div className="-mt-5 flex items-center justify-center gap-3 pb-3 text-xs text-[#9CA3AF]">
        <FooterIdentity email={user?.email} className="text-xs text-[#9CA3AF]" />
        <VersionFooter compact className="text-xs text-[#9CA3AF]" />
      </div>
    </div>
  );
}
