export const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } },
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

export const viewportIn = { once: true, margin: "-80px" } as const;
