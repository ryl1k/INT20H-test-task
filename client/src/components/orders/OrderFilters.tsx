import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useOrderStore } from "@/store/useOrderStore";
import { useUiStore } from "@/store/useUiStore";

export function OrderFilters() {
  const { t } = useTranslation();
  const { filters, setFilters, resetFilters } = useOrderStore();
  const addToast = useUiStore((s) => s.addToast);

  const hasActiveFilters = !!filters.dateFrom || !!filters.dateTo || filters.amountMin != null || filters.amountMax != null || !!filters.status || !!filters.reportingCode;

  const handleReset = () => {
    resetFilters();
    addToast({ type: "info", message: t("toast.filtersReset") });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full sm:w-40">
        <Input
          label={t("orders.dateFrom")}
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
        />
      </div>
      <div className="w-full sm:w-40">
        <Input
          label={t("orders.dateTo")}
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
        />
      </div>
      <div className="w-full sm:w-32">
        <Input
          label={t("orders.amountMin")}
          type="number"
          value={filters.amountMin ?? ""}
          onChange={(e) => setFilters({ amountMin: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      <div className="w-full sm:w-32">
        <Input
          label={t("orders.amountMax")}
          type="number"
          value={filters.amountMax ?? ""}
          onChange={(e) => setFilters({ amountMax: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          {t("orders.resetFilters")}
        </Button>
      )}
    </div>
  );
}
