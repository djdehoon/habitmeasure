import packageJson from "@/package.json";

type VersionFooterProps = {
  compact?: boolean;
  className?: string;
};

export function VersionFooter({ compact = false, className }: VersionFooterProps) {
  const version = packageJson.version;
  const defaultClassName = compact ? "text-center text-xs text-[#9CA3AF]" : "py-3 text-center text-xs text-[#9CA3AF]";

  return (
    <div className={className ?? defaultClassName}>
      <span>v{version}</span>
    </div>
  );
}
