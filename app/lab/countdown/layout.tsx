/** Full-screen countdown routes: minimal chrome, parent lab layout still applies auth/beta gate. */
export default function CountdownLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh]">{children}</div>;
}
