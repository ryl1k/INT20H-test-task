import { useMemo } from "react";
import { Rectangle, Tooltip } from "react-leaflet";
import { useTranslation } from "react-i18next";
import { countyBounds, jurisdictions } from "@/mocks/taxRates";
import { formatPercent } from "@/utils/formatPercent";
import type { LatLngBoundsExpression } from "leaflet";

const MIN_RATE = 0.07;
const MAX_RATE = 0.08875;

function rateToColor(rate: number): string {
  const t = Math.min(1, Math.max(0, (rate - MIN_RATE) / (MAX_RATE - MIN_RATE)));
  // green (120,180,80) -> coral (232,87,61)
  const r = Math.round(120 + t * (232 - 120));
  const g = Math.round(180 + t * (87 - 180));
  const b = Math.round(80 + t * (61 - 80));
  return `rgb(${r},${g},${b})`;
}

export function TaxZones() {
  const { t } = useTranslation();

  const zones = useMemo(
    () =>
      countyBounds.map((bounds) => {
        const jurisdiction = jurisdictions.find((j) => j.county === bounds.county);
        const compositeRate = jurisdiction
          ? jurisdiction.state_rate + jurisdiction.county_rate + jurisdiction.city_rate + jurisdiction.special_rates
          : 0.08;
        const color = rateToColor(compositeRate);
        const rect: LatLngBoundsExpression = [
          [bounds.latMin, bounds.lonMin],
          [bounds.latMax, bounds.lonMax],
        ];
        return { ...bounds, compositeRate, color, rect };
      }),
    [],
  );

  return (
    <>
      {zones.map((zone) => (
        <Rectangle
          key={zone.county}
          bounds={zone.rect}
          pathOptions={{ color: zone.color, weight: 1, fillColor: zone.color, fillOpacity: 0.25 }}
          className="tax-zone"
          eventHandlers={{ click: (e) => e.target.getElement()?.blur() }}
        >
          <Tooltip>
            {t("dashboard.zoneTooltip", {
              county: zone.county,
              rate: formatPercent(zone.compositeRate),
            })}
          </Tooltip>
        </Rectangle>
      ))}
    </>
  );
}
