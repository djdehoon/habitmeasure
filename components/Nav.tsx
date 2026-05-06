"use client";

import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        scrolled
          ? "border-slate-200/80 bg-white/92 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="container-shell flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 heading-font font-bold text-slate-800">
          <span className="h-2 w-2 rounded-full bg-[#8BA2B5]" />
          HabitMeasure
        </a>
        <div className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
          <a href="#features" className="hover:text-slate-800">
            Features
          </a>
          <a href="#how" className="hover:text-slate-800">
            How it works
          </a>
          <a href="#prijzen" className="hover:text-slate-800">
            Pricing
          </a>
        </div>
        <a href="#waitlist" className="btn-primary shrink-0 px-5 py-2 text-sm">
          Join the waitlist →
        </a>
      </nav>
    </header>
  );
}
