export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="container-shell relative flex flex-col gap-4 pb-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="heading-font text-base font-bold text-slate-800">HabitMeasure</div>
          <p>Small habits. Big change. You measure it.</p>
        </div>
        <div>
          <p>📱 Works like an app on your phone</p>
          <p>Built with ❤️ in the Netherlands · 2026</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-800">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-800">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
