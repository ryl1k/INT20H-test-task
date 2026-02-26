import { useTranslation } from "react-i18next";
import type { ValidatedRow } from "@/hooks/useFileUpload";
import { Badge } from "@/components/ui/Badge";

interface ImportPreviewProps {
  rows: ValidatedRow[];
}

export function ImportPreview({ rows }: ImportPreviewProps) {
  const { t } = useTranslation();
  const valid = rows.filter((r) => r.valid).length;
  const invalid = rows.length - valid;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Badge variant="success">{t("import.validRows")}: {valid}</Badge>
        <Badge variant="error">{t("import.invalidRows")}: {invalid}</Badge>
        <Badge>{t("import.totalRows")}: {rows.length}</Badge>
      </div>
      <div className="max-h-96 overflow-auto rounded-lg border border-[var(--border-color)]">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-[var(--bg-secondary)]">
            <tr className="border-b border-[var(--border-color)]">
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Status</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">ID</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Lat</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Lon</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Subtotal</th>
              <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">Errors</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 200).map((row, idx) => (
              <tr key={idx} className="border-b border-[var(--border-light)]">
                <td className="px-3 py-1.5">
                  {row.valid ? (
                    <span className="text-success" role="img" aria-label="Valid">&#10003;</span>
                  ) : (
                    <span className="text-error" role="img" aria-label="Invalid">&#10007;</span>
                  )}
                </td>
                <td className="px-3 py-1.5 font-mono text-xs">{row.data.id}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{row.data.latitude.toFixed(4)}</td>
                <td className="px-3 py-1.5 font-mono text-xs">{row.data.longitude.toFixed(4)}</td>
                <td className="px-3 py-1.5 font-mono text-xs">${row.data.subtotal.toFixed(2)}</td>
                <td className="px-3 py-1.5 text-xs text-error">{row.errors.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
