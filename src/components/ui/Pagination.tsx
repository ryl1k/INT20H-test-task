import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Select } from "./Select";

interface PaginationProps {
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function Pagination({ page, totalPages, perPage, total, onPageChange, onPerPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-[var(--text-muted)]">
        {t("common.showing")} {from} {t("common.to")} {to} {t("common.of")} {total} {t("common.items")}
      </p>
      <div className="flex items-center gap-2">
        <Select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          aria-label={t("a11y.selectPerPage")}
          className="w-20"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
        <span className="text-sm text-[var(--text-muted)]">{t("common.perPage")}</span>
        <div className="flex gap-1">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label={t("a11y.previousPage")}>
            &laquo;
          </Button>
          <span className="flex items-center px-3 text-sm text-[var(--text-secondary)]">
            {page} / {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label={t("a11y.nextPage")}>
            &raquo;
          </Button>
        </div>
      </div>
    </div>
  );
}
