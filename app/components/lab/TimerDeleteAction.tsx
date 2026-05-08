"use client";

import { useRouter } from "next/navigation";
import { TimerDeleteButton } from "@/app/components/lab/TimerDeleteButton";

type TimerDeleteActionProps = {
  templateId: string;
};

export function TimerDeleteAction({ templateId }: TimerDeleteActionProps) {
  const router = useRouter();

  return <TimerDeleteButton templateId={templateId} onDeleted={() => router.refresh()} />;
}
