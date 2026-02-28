import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order } from "@/types/order";
import { formatPercent } from "@/utils/formatPercent";
import { Badge } from "@/components/ui/Badge";

interface TaxBreakdownProps {
  order: Order;
}

interface Segment {
  key: string;
  label: string;
  value: number;
  color: string;
}

const TAX_RATE_CONFIG: { key: string; labelKey: string; field: keyof Order["breakdown"]; color: string }[] = [
  { key: "state",   labelKey: "taxBreakdown.stateRate",    field: "state_rate",   color: "#E8573D" },
  { key: "county",  labelKey: "taxBreakdown.countyRate",   field: "county_rate",  color: "#F4877A" },
  { key: "city",    labelKey: "taxBreakdown.cityRate",     field: "city_rate",    color: "#D97706" },
  { key: "special", labelKey: "taxBreakdown.specialRates", field: "special_rate", color: "#2D9C6F" },
];

interface DonutChartProps {
  breakdown: Order["breakdown"];
  hovered: Segment | null;
  onHover: (seg: Segment | null) => void;
}

function DonutChart({ breakdown, hovered, onHover }: DonutChartProps) {
  const { t } = useTranslation();

  const segments: Segment[] = TAX_RATE_CONFIG
    .map((cfg) => ({ key: cfg.key, label: t(cfg.labelKey), value: breakdown[cfg.field], color: cfg.color }))
    .filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const cx = 60;
  const cy = 60;
  const r = 46;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / total) * circumference;
    const gap = circumference - dash;
    const arc = { seg, dash, gap, offset };
    offset += dash;
    return arc;
  });

  return (
    <svg
      viewBox="0 0 120 120"
      className="h-44 w-44 shrink-0"
      role="img"
      aria-label={t("a11y.taxChart")}
      onMouseLeave={() => onHover(null)}
    >
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth="12" />

      {arcs.map(({ seg, dash, gap, offset: arcOffset }) => {
        const isActive = hovered?.key === seg.key;
        return (
          <circle
            key={seg.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={isActive ? 17 : 12}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-arcOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={hovered && !isActive ? 0.3 : 1}
            style={{ transition: "stroke-width 0.15s, opacity 0.15s", cursor: "pointer" }}
            onMouseEnter={() => onHover(seg)}
          />
        );
      })}

      {/* Center label */}
      {hovered ? (
        <>
          <text
            x={cx} y={cy - 12}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: "8px", fontWeight: 600, fill: hovered.color }}
          >
            {hovered.label}
          </text>
          <text
            x={cx} y={cy + 11}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: "16px", fontWeight: 700, fill: "var(--text-primary)" }}
          >
            {formatPercent(hovered.value)}
          </text>
        </>
      ) : (
        <>
          <text
            x={cx} y={cy - 11}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: "8px", fill: "var(--text-muted)" }}
          >
            {t("taxBreakdown.compositeRate")}
          </text>
          <text
            x={cx} y={cy + 11}
            textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: "16px", fontWeight: 700, fill: "var(--text-primary)" }}
          >
            {formatPercent(total)}
          </text>
        </>
      )}
    </svg>
  );
}


export function TaxBreakdown({ order }: TaxBreakdownProps) {
  const { t } = useTranslation();
  const { breakdown, jurisdictions } = order;
  const [hovered, setHovered] = useState<Segment | null>(null);

  if (order.status === "out_of_scope") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg bg-[var(--bg-tertiary)] p-4 sm:flex-row sm:gap-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center sm:items-start sm:text-left">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-bold text-[var(--text-primary)]">{t("taxBreakdown.title")}</h4>
            {order.reporting_code && (
              <span className="text-xs font-mono text-[var(--text-muted)]">{order.reporting_code}</span>
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)]">{t("taxBreakdown.outOfScope")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-[var(--bg-tertiary)] p-3 sm:flex-row sm:items-stretch sm:gap-6">
      {/* Left column — chart */}
      <div className="flex items-center">
        <DonutChart breakdown={breakdown} hovered={hovered} onHover={setHovered} />
      </div>

      {/* Right column — title, rates, badges */}
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-2">
            <h4 className="text-base font-bold text-[var(--text-primary)]">{t("taxBreakdown.title")}</h4>
            {order.reporting_code && (
              <span className="text-xs font-mono text-[var(--text-muted)]">{order.reporting_code}</span>
            )}
          </div>
          <div className="inline-grid grid-cols-1 sm:grid-cols-2 gap-x-14 gap-y-2 text-base">
            {TAX_RATE_CONFIG.map((row) => {
              const isActive = hovered?.key === row.key;
              return (
                <div
                  key={row.key}
                  className="flex justify-between gap-6 rounded-md px-2 py-0.5 transition-colors cursor-pointer"
                  style={isActive ? { backgroundColor: "var(--bg-primary)" } : undefined}
                  onMouseEnter={() => setHovered({ key: row.key, label: t(row.labelKey), value: breakdown[row.field], color: row.color })}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="transition-colors"
                    style={{ color: isActive ? row.color : "var(--text-muted)" }}
                  >
                    {t(row.labelKey)}
                  </span>
                  <span
                    className="font-mono transition-colors"
                    style={{ color: "var(--text-primary)", fontWeight: isActive ? 700 : 400 }}
                  >
                    {formatPercent(breakdown[row.field])}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {jurisdictions.map((j) => (
            <Badge key={j} variant="info" className="text-sm px-3 py-1">{j}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
