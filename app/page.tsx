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

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
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
    </div>
  );
}
