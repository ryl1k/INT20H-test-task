import type { Order } from "@/types/order";

export function exportCsv(
  orders: Order[],
  addToast: (t: { type: "success" | "warning"; message: string }) => void,
  t: (key: string, opts?: Record<string, unknown>) => string
) {
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
