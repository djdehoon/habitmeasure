import TimerGrid from "@/app/components/lab/TimerGrid";
import { TimerGridWrapper } from "@/app/components/lab/TimerGridWrapper";

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1A1A2E]">
      <TimerGridWrapper>
        <TimerGrid />
      </TimerGridWrapper>
    </main>
  );
}
