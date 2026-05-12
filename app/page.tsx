import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HeroAIFeatureCards } from "@/components/HeroAIFeatureCards";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { PhoneMockups } from "@/components/PhoneMockups";
import { PreviewShowcase } from "@/components/PreviewShowcase";
import { Pricing } from "@/components/Pricing";
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Nav />
      <main className="flex-1">
        <section
          aria-label="Intro"
          className="relative overflow-hidden bg-slate-950 text-slate-100"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(16,185,129,0.2),transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.14),transparent_45%)]"
            aria-hidden
          />
          <div className="relative">
            <Hero />
            <HeroAIFeatureCards />
          </div>
          <div
            className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            aria-hidden
          />
        </section>
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
      <div className="-mt-5 flex items-center justify-center gap-3 pb-4 text-xs text-slate-500">
        <FooterIdentity email={user?.email} className="text-xs text-slate-500" />
        <VersionFooter compact className="text-xs text-slate-500" />
      </div>
    </div>
  );
}
