import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-coral text-white hover:bg-coral-dark active:bg-coral-dark",
  secondary: "bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
  danger: "bg-error text-white hover:bg-red-700"
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base"
};

export function Button({ variant = "primary", size = "md", className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-coral/50 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
