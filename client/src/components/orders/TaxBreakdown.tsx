import { useTranslation } from "react-i18next";
import type { Order } from "@/types/order";
import { formatPercent } from "@/utils/formatPercent";
import { Badge } from "@/components/ui/Badge";

interface TaxBreakdownProps {
  order: Order;
}

function DonutChart({ breakdown }: { breakdown: Order["breakdown"] }) {
  const { t } = useTranslation();
  const segments = [
    { label: "State", value: breakdown.state_rate, color: "#E8573D" },
    { label: "County", value: breakdown.county_rate, color: "#F4877A" },
    { label: "City", value: breakdown.city_rate, color: "#D97706" },
    { label: "Special", value: breakdown.special_rates, color: "#2D9C6F" }
  ].filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 100 100" className="h-20 w-20" role="img" aria-label={t("a11y.taxChart")}>
      {segments.map((seg) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const currentOffset = offset;
        offset += dash;
        return (
          <circle
            key={seg.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="fill-[var(--text-primary)] text-[8px] font-bold">
        {(total * 100).toFixed(2)}%
      </text>
    </svg>
  );
}

export function TaxBreakdown({ order }: TaxBreakdownProps) {
  const { t } = useTranslation();
  const { breakdown, jurisdictions } = order;

  return (
    <div className="flex flex-wrap items-start gap-6 rounded-lg bg-[var(--bg-tertiary)] p-4">
      <DonutChart breakdown={breakdown} />
      <div className="flex-1 space-y-2">
        <h4 className="text-sm font-bold text-[var(--text-primary)]">{t("taxBreakdown.title")}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">{t("taxBreakdown.stateRate")}</span>
            <span className="font-mono text-[var(--text-primary)]">{formatPercent(breakdown.state_rate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">{t("taxBreakdown.countyRate")}</span>
            <span className="font-mono text-[var(--text-primary)]">{formatPercent(breakdown.county_rate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">{t("taxBreakdown.cityRate")}</span>
            <span className="font-mono text-[var(--text-primary)]">{formatPercent(breakdown.city_rate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">{t("taxBreakdown.specialRates")}</span>
            <span className="font-mono text-[var(--text-primary)]">{formatPercent(breakdown.special_rates)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="info">{jurisdictions.state}</Badge>
          <Badge>{jurisdictions.county} County</Badge>
          {jurisdictions.city && <Badge variant="success">{jurisdictions.city}</Badge>}
          {jurisdictions.special_districts.map((d) => (
            <Badge key={d} variant="warning">{d}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
