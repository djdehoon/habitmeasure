/** Shared dark chrome for auth screens (login / signup / password). */

export const authPage =
  "flex min-h-screen flex-col bg-slate-950 text-slate-100";

export const authHeader =
  "border-b border-white/10 bg-slate-950/95 backdrop-blur-md";

export const authHeaderInner =
  "container-shell flex h-14 items-center justify-between sm:h-16";

export const authBrandLink =
  "flex items-center gap-2 heading-font text-sm font-bold text-white sm:text-base";

export const authNavLink =
  "text-sm text-slate-400 transition hover:text-white";

export const authLabLink =
  "flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white";

export const authCard =
  "w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl shadow-black/40 sm:p-8";

export const authTitle = "heading-font text-2xl font-bold tracking-tight text-white";

export const authSubtitle = "mt-1 text-sm text-slate-400";

export const authLabel = "mb-1.5 block text-sm font-medium text-slate-300";

export const authInput =
  "w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-slate-100 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20";

export const authPasswordInput = `${authInput} pr-14`;

export const authLink =
  "font-semibold text-[#00E5C0] underline-offset-2 hover:underline";

export const authMuted = "text-center text-sm text-slate-400";

export const authPrimaryButton =
  "w-full rounded-xl bg-[#00E5C0] py-3 text-sm font-semibold text-[#0C3D3A] transition hover:bg-[#00d4b2] disabled:pointer-events-none disabled:opacity-60";

export const authError =
  "rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200";

export const authSuccess =
  "rounded-xl border border-teal-400/30 bg-teal-500/10 p-4 text-sm text-teal-100";
