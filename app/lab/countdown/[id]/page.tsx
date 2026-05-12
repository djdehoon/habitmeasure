import { permanentRedirect } from "next/navigation";

type LegacyCountdownPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyCountdownTimerPage({ params }: LegacyCountdownPageProps) {
  const { id } = await params;
  permanentRedirect(`/lab/${id}`);
}
