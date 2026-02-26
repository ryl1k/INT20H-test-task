import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full cursor-pointer appearance-none rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] pl-3 pr-8 py-2 text-sm text-[var(--text-primary)] focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
