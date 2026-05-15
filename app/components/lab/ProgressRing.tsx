type ProgressRingMode = "full" | "partial" | "done";

type ProgressRingProps = {
  radius?: number;
  color: string;
  progress: number;
  mode: ProgressRingMode;
  className?: string;
};

export function ProgressRing({
  radius = 80,
  color,
  progress,
  mode,
  className = "h-64 w-64 md:h-72 md:w-72",
}: ProgressRingProps) {
  const viewSize = 200;
  const center = viewSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);
  const doneColor = "#22c55e";
  const trackColor = "rgb(30 41 59)";
  const stroke = mode === "done" ? doneColor : color;

  return (
    <div className={`relative ${className}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${viewSize} ${viewSize}`} aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth="6" />
        {mode === "full" ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
        ) : mode === "partial" ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        ) : (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={doneColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
        )}
      </svg>
    </div>
  );
}
