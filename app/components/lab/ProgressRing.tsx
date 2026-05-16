type ProgressRingMode = "full" | "partial" | "done";

type ProgressRingProps = {
  radius?: number;
  color: string;
  progress: number;
  mode: ProgressRingMode;
  className?: string;
};

function strokeWidthForRadius(radius: number): number {
  return Math.max(6, Math.round(radius / 22));
}

export function ProgressRing({
  radius = 140,
  color,
  progress,
  mode,
  className = "h-full w-full",
}: ProgressRingProps) {
  const strokeWidth = strokeWidthForRadius(radius);
  const pad = strokeWidth / 2 + 4;
  const viewSize = 2 * (radius + pad);
  const center = viewSize / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);
  const doneColor = "#22c55e";
  const trackColor = "rgb(30 41 59)";
  const stroke = mode === "done" ? doneColor : color;

  return (
    <div className={`relative ${className}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${viewSize} ${viewSize}`} aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        {mode === "full" ? (
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
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
            strokeWidth={strokeWidth}
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
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
          />
        )}
      </svg>
    </div>
  );
}
