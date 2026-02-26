import { useEffect, useRef, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    document.addEventListener("keydown", handleKeyDown);

    // Focus the panel on open
    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus on close
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6 shadow-xl focus:outline-none",
          className
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="font-heading text-lg font-bold text-[var(--text-primary)]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("a11y.closeModal")}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
