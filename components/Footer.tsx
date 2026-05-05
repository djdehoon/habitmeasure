import { APP_VERSION } from "@/lib/version";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="container-shell relative flex flex-col gap-4 pb-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="heading-font text-base font-bold text-slate-800">HabitMeasure</div>
          <p>Kleine gewoontes. Grote verandering. Jij meet het.</p>
        </div>
        <div>
          <p>📱 Werkt als app op je telefoon</p>
          <p>Gebouwd met ❤️ in Nederland · 2026</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-800">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-800">
            Contact
          </a>
        </div>
        <span className="pointer-events-none absolute right-0 bottom-0 select-none text-xs text-black tabular-nums">
          v{APP_VERSION}
        </span>
      </div>
    </footer>
  );
}
