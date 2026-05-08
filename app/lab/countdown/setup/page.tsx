import { SetupPageClient } from "@/app/lab/countdown/setup/SetupPageClient";

type SetupPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function CountdownSetupPage({ searchParams }: SetupPageProps) {
  const resolvedSearchParams = await searchParams;
  const templateId = resolvedSearchParams.id ?? null;

  return <SetupPageClient templateId={templateId} />;
}
