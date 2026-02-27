import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrders } from "@/hooks/useOrders";
import { useOrderStore } from "@/store/useOrderStore";
import { useUiStore } from "@/store/useUiStore";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Seo } from "@/components/seo/Seo";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Button } from "@/components/ui/Button";
import { CreateOrderModal } from "@/components/orders/CreateOrderModal";
import { getAllOrders } from "@/api/ordersApi";
import type { Order } from "@/types/order";

function exportCsv(orders: Order[], addToast: (t: { type: "success" | "warning"; message: string }) => void, t: (key: string, opts?: Record<string, unknown>) => string) {
  if (orders.length === 0) {
    addToast({ type: "warning", message: t("toast.exportEmpty") });
    return;
  }
  const headers = "id,latitude,longitude,tax_rate,tax_amount,total,jurisdictions,status,reporting_code,created_at\n";
  const rows = orders.map((o) =>
    [o.id, o.latitude, o.longitude, o.composite_tax_rate, o.tax_amount, o.total_amount, o.jurisdictions.join(";"), o.status, o.reporting_code, o.created_at].join(",")
  ).join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders-export.csv";
  a.click();
  URL.revokeObjectURL(url);
  addToast({ type: "success", message: t("toast.exportSuccess", { count: orders.length }) });
}

export function OrdersPage() {
  const { t } = useTranslation();
  const { orders, meta, loading, error, fetchOrders } = useOrders();
  const setFilters = useOrderStore((s) => s.setFilters);
  const addToast = useUiStore((s) => s.addToast);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportingAll, setExportingAll] = useState(false);

  const handleSort = (col: string, dir: "asc" | "desc") => {
    setFilters({ sortBy: col, sortDir: dir });
  };

  const handlePageChange = (page: number) => {
    void fetchOrders(page);
  };

  const handlePerPageChange = (perPage: number) => {
    useOrderStore.setState((s) => ({ meta: { ...s.meta, perPage } }));
    void fetchOrders(1);
  };

  const handleExportCurrentPage = () => {
    setExportModalOpen(false);
    exportCsv(orders, addToast, t);
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const all = await getAllOrders();
      setExportModalOpen(false);
      exportCsv(all, addToast, t);
    } catch {
      addToast({ type: "warning", message: t("toast.ordersError") });
    } finally {
      setExportingAll(false);
    }
  };

  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      addToast({ type: "error", message: t("toast.ordersError") });
    } else if (!error) {
      prevErrorRef.current = null;
    }
  }, [error, addToast, t]);

  const paginationBlock = meta.totalPages > 1 ? (
    <Pagination
      page={meta.page}
      totalPages={meta.totalPages}
      perPage={meta.perPage}
      total={meta.total}
      onPageChange={handlePageChange}
      onPerPageChange={handlePerPageChange}
    />
  ) : null;

  return (
    <div className="space-y-4">
      <Seo title={t("seo.ordersTitle")} description={t("seo.ordersDesc")} />
      <div className="flex flex-wrap items-end gap-3">
        <OrderFilters />
        <div className="ml-auto flex items-end gap-2">
          <Button size="md" onClick={() => setCreateModalOpen(true)}>
            {t("createOrder.title")}
          </Button>
          <Button variant="secondary" size="md" onClick={() => setExportModalOpen(true)}>
            {t("orders.export")}
          </Button>
        </div>
      </div>

      {paginationBlock}

      <Card padding={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState title={t("orders.noOrders")} description={t("orders.noOrdersDesc")} />
        ) : (
          <OrdersTable orders={orders} onSort={handleSort} />
        )}
      </Card>

      {paginationBlock}

      <Modal open={exportModalOpen} onClose={() => setExportModalOpen(false)} title={t("exportModal.title")}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExportCurrentPage}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-left transition-colors hover:border-coral hover:bg-[var(--bg-tertiary)] cursor-pointer"
          >
            <p className="font-semibold text-[var(--text-primary)]">{t("exportModal.currentPage")}</p>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {t("exportModal.currentPageDesc", { count: orders.length })}
            </p>
          </button>

          <button
            type="button"
            onClick={() => void handleExportAll()}
            disabled={exportingAll}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-left transition-colors hover:border-coral hover:bg-[var(--bg-tertiary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-semibold text-[var(--text-primary)]">{t("exportModal.allPages")}</p>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {exportingAll
                ? t("exportModal.loadingAll")
                : t("exportModal.allPagesDesc", { total: meta.total })}
            </p>
          </button>

          <Button variant="ghost" size="md" className="w-full" onClick={() => setExportModalOpen(false)}>
            {t("common.cancel")}
          </Button>
        </div>
      </Modal>

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onOrderCreated={() => {
          setCreateModalOpen(false);
          void fetchOrders(1);
        }}
      />
    </div>
  );
}
