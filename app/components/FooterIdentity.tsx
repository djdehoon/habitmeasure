type FooterIdentityProps = {
  email?: string | null;
  className?: string;
};

export function FooterIdentity({ email, className }: FooterIdentityProps) {
  return (
    <div className={className ?? "text-center text-xs text-[#9CA3AF]"}>
      <span>{email ?? "Not logged in"}</span>
    </div>
  );
}
