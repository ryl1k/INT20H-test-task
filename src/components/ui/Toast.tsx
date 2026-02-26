import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/store/useUiStore";
import { cn } from "@/utils/cn";

const typeStyles: Record<string, string> = {
  success: "bg-success text-white",
  error: "bg-error text-white",
  warning: "bg-warning text-white",
  info: "bg-info text-white"
};

export function Toast() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} type={toast.type} message={toast.message} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({
  id,
  type,
  message,
  onDismiss
}: {
  id: string;
  type: string;
  message: string;
  onDismiss: (id: string) => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg animate-[slideIn_0.3s_ease]",
        typeStyles[type] ?? typeStyles.info
      )}
    >
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label={t("a11y.dismissNotification")}
        className="ml-2 opacity-70 hover:opacity-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
