"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "success" | "danger" | "sun";
  size?: "sm" | "md" | "lg";
  className?: string;
  full?: boolean;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantClass: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-brand to-aqua text-white shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40 hover:-translate-y-0.5",
  secondary:
    "bg-white text-brand-dark border-2 border-brand-soft hover:border-brand/40 hover:-translate-y-0.5 shadow-sm",
  ghost: "bg-transparent text-ink/70 hover:bg-white/70 hover:text-brand-dark",
  success:
    "bg-gradient-to-r from-aqua to-emerald-500 text-white shadow-lg shadow-aqua/30 hover:-translate-y-0.5",
  danger: "bg-gradient-to-r from-coral to-rose-500 text-white shadow-lg shadow-coral/30 hover:-translate-y-0.5",
  sun: "bg-gradient-to-r from-sun to-amber-400 text-ink shadow-lg shadow-sun/40 hover:-translate-y-0.5",
};

const sizeClass = {
  sm: "px-3.5 py-2 text-sm rounded-xl gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-2xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-2xl gap-2.5",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  full,
  loading,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center font-display font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        variantClass[variant],
        sizeClass[size],
        full && "w-full",
        className,
      )}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  full,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  full?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex items-center justify-center font-display font-semibold transition-all duration-200 active:scale-[0.98]",
        variantClass[variant ?? "primary"],
        sizeClass[size ?? "md"],
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cx(
        "rounded-4xl bg-white/95 border border-white shadow-[0_16px_44px_-20px_rgba(22,34,74,0.45)] backdrop-blur",
        hover && "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_-22px_rgba(22,34,74,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const badgeTone: Record<string, string> = {
  brand: "bg-brand-soft text-brand-dark",
  aqua: "bg-aqua-soft text-teal-700",
  sun: "bg-sun-soft text-amber-700",
  coral: "bg-coral-soft text-rose-700",
  grape: "bg-grape-soft text-violet-700",
  slate: "bg-slate-100 text-slate-600",
};

export function Badge({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTone | string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-display",
        badgeTone[tone] ?? badgeTone.brand,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cx("h-3 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand via-sky to-aqua transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx("h-5 w-5 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Loader({ label = "Memuat data..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-ink/60">
      <Spinner className="h-8 w-8 text-brand" />
      <p className="font-display text-sm font-semibold">{label}</p>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cx("space-y-2", className)}>
      {eyebrow ? (
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-dark">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm text-ink/70 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/15";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-display text-sm font-bold text-ink">{label}</span>
      {children}
      {hint && !error ? <span className="block text-xs text-ink/55">{hint}</span> : null}
      {error ? <span className="block text-xs font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
}: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description ? <p className="max-w-md text-sm text-ink/60">{description}</p> : null}
    </div>
  );
}
