"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const labActive = pathname === "/lab" || pathname.startsWith("/lab/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = isHome
    ? scrolled
      ? "border-white/10 bg-slate-950/85 backdrop-blur-md"
      : "border-transparent bg-transparent"
    : scrolled
      ? "border-slate-200/80 bg-white/92 backdrop-blur-md"
      : "border-transparent bg-transparent";

  const logoClass = isHome ? "text-white" : "text-slate-800";
  const dotClass = isHome ? "bg-emerald-400/90" : "bg-[#8BA2B5]";
  const linkClass = isHome
    ? "text-slate-300 hover:text-white"
    : "text-slate-500 hover:text-slate-800";
  const labActiveClass = isHome
    ? "bg-white/10 text-white"
    : "bg-slate-100 text-slate-800";
  const ctaClass = isHome
    ? "shrink-0 rounded-xl bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300"
    : "btn-primary shrink-0 px-5 py-2 text-sm";

  const labLinkClass = `flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
    labActive ? labActiveClass : linkClass
  }`;

  const labLink = (
    <Link href="/lab" className={labLinkClass}>
      <span aria-hidden>🧪</span>
      <span>Lab</span>
    </Link>
  );

  return (
    <header className={`sticky top-0 z-50 border-b ${headerClass}`}>
      <nav className="container-shell flex h-16 items-center justify-between gap-3">
        <Link href="/" className={`flex items-center gap-2 heading-font font-bold ${logoClass}`}>
          <span className={`h-2 w-2 rounded-full ${dotClass}`} />
          HabitMeasure
        </Link>
        <div className="hidden items-center gap-6 text-sm md:flex">
          <a href="#features" className={linkClass}>
            Features
          </a>
          <a href="#how" className={linkClass}>
            How it works
          </a>
          <a href="#prijzen" className={linkClass}>
            Pricing
          </a>
          {labLink}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="md:hidden">{labLink}</div>
          <a href="#waitlist" className={ctaClass}>
            Waitlist →
          </a>
        </div>
      </nav>
    </header>
  );
}
