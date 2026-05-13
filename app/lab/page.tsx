import TimerGrid from "@/app/components/lab/TimerGrid";
import { TimerGridWrapper } from "@/app/components/lab/TimerGridWrapper";

export default function LabPage() {
  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <TimerGridWrapper>
        <TimerGrid />
      </TimerGridWrapper>
    </main>
  );
}
