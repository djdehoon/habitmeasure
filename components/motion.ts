export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

export const float = {
  animate: {
    y: [-3, 0, -3],
    transition: { duration: 6, repeat: Infinity },
  },
};

export const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 0 rgba(139,162,181,0)",
      "0 0 14px rgba(139,162,181,0.2)",
      "0 0 0 rgba(139,162,181,0)",
    ],
    transition: { duration: 3.2, repeat: Infinity },
  },
};

export const viewportIn = { once: true, amount: 0.2 } as const;


