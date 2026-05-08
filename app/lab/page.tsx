import { LabHeader } from "@/app/components/lab/LabHeader";
import TimerGrid from "@/app/components/lab/TimerGrid";

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#1A1A2E]">
      <LabHeader />

      <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
        <TimerGrid />
      </div>
    </main>
  );
}
