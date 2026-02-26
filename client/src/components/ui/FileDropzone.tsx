import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

interface FileDropzoneProps {
  accept?: string;
  onFile: (file: File) => void;
  label: string;
  hint?: string;
}

export function FileDropzone({ accept, onFile, label, hint }: FileDropzoneProps) {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      role="region"
      aria-label={label}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 sm:p-8 md:p-10 text-center transition-colors",
        dragging
          ? "border-coral bg-coral/5"
          : "border-[var(--border-color)] hover:border-coral/50 hover:bg-[var(--bg-tertiary)]"
      )}
    >
      <svg className="mb-3 h-10 w-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      {hint && <p className="mt-1 text-xs text-[var(--text-muted)]">{hint}</p>}
      <label className="mt-3 cursor-pointer rounded-lg bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark transition-colors">
        {t("a11y.browseFiles")}
        <input type="file" accept={accept} onChange={handleChange} className="hidden" aria-label={label} />
      </label>
    </div>
  );
}
