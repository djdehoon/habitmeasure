"use client";

type PasswordFieldRole = "new" | "confirm";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  fieldRole: PasswordFieldRole;
  name?: string;
  minLength?: number;
  required?: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 pr-14 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/25";

function fieldNameForRole(role: PasswordFieldRole, name?: string): string {
  if (name) return name;
  return role === "new" ? "password" : "password-confirm";
}

function autoCompleteForRole(role: PasswordFieldRole): string {
  return role === "new" ? "new-password" : "off";
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M2.1 3.51 1 4.62l3.17 3.17C2.69 9.12 1.57 10.75 1 12c1.73 3.8 5.53 6 11 6 2.19 0 4.12-.37 5.78-1.06L21.38 21l1.11-1.11L2.1 3.51ZM12 16c-2.88 0-5.13-1.28-6.43-4 .46-.94 1.25-1.98 2.47-2.83l1.55 1.55A3.99 3.99 0 0 0 12 16Zm0-8c2.88 0 5.13 1.28 6.43 4-.37.76-.96 1.6-1.82 2.33l1.43 1.43A11.77 11.77 0 0 0 23 12c-1.73-3.8-5.53-6-11-6-1.61 0-3.05.2-4.32.58l1.67 1.67C10.15 8.09 11.03 8 12 8Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M12 6C6.53 6 2.73 8.2 1 12c1.73 3.8 5.53 6 11 6s9.27-2.2 11-6c-1.73-3.8-5.53-6-11-6Zm0 10c-2.88 0-5.13-1.28-6.43-4C6.87 9.28 9.12 8 12 8s5.13 1.28 6.43 4c-1.3 2.72-3.55 4-6.43 4Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  fieldRole,
  name,
  minLength = 6,
  required = true,
}: PasswordFieldProps) {
  const inputName = fieldNameForRole(fieldRole, name);
  const hideLabel = `Hide ${label.toLowerCase()}`;
  const showLabel = `Show ${label.toLowerCase()}`;
  const isConfirm = fieldRole === "confirm";

  return (
    <label className="block" htmlFor={id}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          id={id}
          name={inputName}
          type={show ? "text" : "password"}
          required={required}
          autoComplete={autoCompleteForRole(fieldRole)}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
          data-lpignore={isConfirm ? "true" : "false"}
          data-1p-ignore={isConfirm ? "true" : "false"}
          {...(isConfirm ? {} : { "data-form-type": "password" })}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label={show ? hideLabel : showLabel}
          aria-pressed={show}
          data-lpignore="true"
          data-1p-ignore="true"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </label>
  );
}
