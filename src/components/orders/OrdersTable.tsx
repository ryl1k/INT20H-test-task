import { Fragment, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { Order } from "@/types/order";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { formatPercent } from "@/utils/formatPercent";
import { TaxBreakdown } from "./TaxBreakdown";
import { cn } from "@/utils/cn";

const columnHelper = createColumnHelper<Order>();

export function OrdersTable({ orders, onSort }: { orders: Order[]; onSort?: (col: string, dir: "asc" | "desc") => void }) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortState, setSortState] = useState<{ col: string; dir: "asc" | "desc" }>({ col: "created_at", dir: "desc" });

  const handleSort = (col: string) => {
    const dir = sortState.col === col && sortState.dir === "desc" ? "asc" : "desc";
    setSortState({ col, dir });
    onSort?.(col, dir);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const sortableColumns = ["created_at", "total_amount"];

  const columns = [
    columnHelper.accessor("id", {
      header: () => t("orders.id"),
      cell: (info) => <span className="font-mono text-xs">#{info.getValue()}</span>
    }),
    columnHelper.accessor("created_at", {
      header: () => (
        <SortHeader label={t("orders.timestamp")} col="created_at" sortState={sortState} onSort={handleSort} t={t} />
      ),
      cell: (info) => <span className="text-xs">{formatDate(info.getValue())}</span>
    }),
    columnHelper.accessor("jurisdictions", {
      header: () => t("orders.county"),
      cell: (info) => {
        const j = info.getValue();
        const order = info.row.original;
        if (order.status === "out_of_scope") {
          return <span className="text-xs italic text-[var(--text-muted)]">{t("orders.outOfScope")}</span>;
        }
        return (
          <span className="text-xs">
            {j.join(" / ")}
          </span>
        );
      }
    }),
    columnHelper.accessor("composite_tax_rate", {
      header: () => t("orders.taxRate"),
      cell: (info) => <span className="font-mono text-xs">{formatPercent(info.getValue())}</span>
    }),
    columnHelper.accessor("tax_amount", {
      header: () => t("orders.taxAmount"),
      cell: (info) => <span className="font-mono text-xs text-coral">{formatCurrency(info.getValue())}</span>
    }),
    columnHelper.accessor("total_amount", {
      header: () => (
        <SortHeader label={t("orders.subtotal")} col="total_amount" sortState={sortState} onSort={handleSort} t={t} />
      ),
      cell: (info) => <span className="font-mono text-xs">{formatCurrency(info.getValue())}</span>
    }),
    columnHelper.display({
      id: "computed_total",
      header: () => t("orders.total"),
      cell: (info) => {
        const row = info.row.original;
        return <span className="font-mono text-xs font-bold">{formatCurrency(row.total_amount + row.tax_amount)}</span>;
      }
    })
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const getAriaSort = (colId: string): "ascending" | "descending" | "none" => {
    if (!sortableColumns.includes(colId)) return "none";
    if (sortState.col !== colId) return "none";
    return sortState.dir === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-[var(--border-color)]">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  scope="col"
                  aria-sort={sortableColumns.includes(h.column.id) ? getAriaSort(h.column.id) : undefined}
                  className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                role="button"
                tabIndex={0}
                aria-expanded={expandedId === row.original.id}
                aria-label={expandedId === row.original.id ? t("a11y.collapseRow") : t("a11y.expandRow")}
                onClick={() => toggleExpand(row.original.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpand(row.original.id);
                  }
                }}
                className={cn(
                  "cursor-pointer border-b border-[var(--border-light)] transition-colors hover:bg-[var(--bg-tertiary)]",
                  expandedId === row.original.id && "bg-[var(--bg-tertiary)]"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expandedId === row.original.id && (
                <tr key={`${row.id}-detail`}>
                  <td colSpan={columns.length} className="px-3 py-3">
                    <TaxBreakdown order={row.original} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  col,
  sortState,
  onSort,
  t
}: {
  label: string;
  col: string;
  sortState: { col: string; dir: string };
  onSort: (col: string) => void;
  t: (key: string) => string;
}) {
  const isActive = sortState.col === col;
  const sortLabel = isActive
    ? `${label}, ${sortState.dir === "asc" ? t("a11y.sortAscending") : t("a11y.sortDescending")}`
    : label;

  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      aria-label={sortLabel}
      className="flex items-center gap-1 cursor-pointer hover:text-coral"
    >
      {label}
      {isActive && (
        <span className="text-coral" aria-hidden="true">{sortState.dir === "asc" ? "\u2191" : "\u2193"}</span>
      )}
    </button>
  );
}
