import { useEffect, useRef, useState } from "react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, format, icon }: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = 0;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (value - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const formatted = format ? format(displayed) : Math.round(displayed).toLocaleString();

  return (
    <Card className="flex items-center gap-4 overflow-hidden">
      {icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral/10 text-coral" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-[var(--text-muted)]">{label}</p>
        <p className="truncate font-mono text-2xl font-bold text-[var(--text-primary)]">{formatted}</p>
      </div>
    </Card>
  );
}
