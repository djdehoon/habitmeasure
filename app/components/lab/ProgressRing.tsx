type ProgressRingMode = "full" | "partial" | "done";

type ProgressRingProps = {
  radius?: number;
  color: string;
  progress: number;
  mode: ProgressRingMode;
  className?: string;
};

const SOFT_LAYER_OPACITY = 0.15;

function strokeWidthForRadius(radius: number): number {
  return Math.max(6, Math.round(radius / 22));
}

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(clean)) {
    return `rgba(255, 255, 255, ${opacity})`;
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
  const innerFillRadius = Math.max(0, radius - strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);
  const doneColor = "#22c55e";
  const trackColor = "rgb(30 41 59)";
  const stroke = mode === "done" ? doneColor : color;
  const softColorLayer = hexToRgba(color, SOFT_LAYER_OPACITY);

  return (
    <div className={`relative ${className}`}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${viewSize} ${viewSize}`} aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={innerFillRadius}
          fill={softColorLayer}
          stroke="none"
        />
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
