export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10 text-slate-400">
      <div className="container-shell relative flex flex-col gap-4 pb-6 text-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="heading-font text-base font-bold text-white">HabitMeasure</div>
          <p>Small habits. Big change. You measure it.</p>
        </div>
        <div>
          <p>📱 Works like an app on your phone</p>
          <p>Built with ❤️ in the Netherlands · 2026</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="transition hover:text-emerald-400">
            Privacy
          </a>
          <a href="#" className="transition hover:text-emerald-400">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
