import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
}

export function Card({ className, padding = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm",
        padding && "p-3 sm:p-4 md:p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
