"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, viewportIn } from "./motion";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const totalFrames = 45;
    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);

  return value;
}

export function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setActive(true),
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const waitlist = useCountUp(312, active);
  const days = useCountUp(21, active);
  const euros = useCountUp(200, active);
  const formattedEuros = (euros / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <motion.section
      ref={ref}
      className="container-shell section-wrap flex flex-col items-center text-center"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportIn}
    >
      <div className="mt-2 grid w-full max-w-3xl gap-5 md:grid-cols-3">
        <div className="card-shell p-6">
          <div className="heading-font text-4xl font-black text-[#6D8294]">{waitlist}+</div>
          <p className="mt-2 text-sm text-slate-500">Mensen op de wachtlijst</p>
        </div>
        <div className="card-shell p-6">
          <div className="heading-font text-4xl font-black text-[#6D8294]">{days} dagen</div>
          <p className="mt-2 text-sm text-slate-500">Gemiddeld voor een nieuwe gewoonte</p>
        </div>
        <div className="card-shell p-6">
          <div className="heading-font text-4xl font-black text-[#6D8294]">
            €{formattedEuros}
          </div>
          <p className="mt-2 text-sm text-slate-500">Per maand voor Pro</p>
        </div>
      </div>
    </motion.section>
  );
}
