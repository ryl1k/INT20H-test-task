import { useEffect, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAllOrders } from "@/api/ordersApi";
import { useOrderStore } from "@/store/useOrderStore";
import { useUiStore } from "@/store/useUiStore";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Seo } from "@/components/seo/Seo";
import { MapContainer } from "@/components/map/MapContainer";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { formatPercent } from "@/utils/formatPercent";
import { Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

const droneIcon = new L.DivIcon({
  className: "drone-marker",
  html: `<div style="width:10px;height:10px;background:#E8573D;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const count: number = cluster.getChildCount();
  let size = "small";
  let dim = 36;
  if (count > 100) { size = "large"; dim = 52; }
  else if (count > 30) { size = "medium"; dim = 44; }
  return L.divIcon({
    html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
    className: "custom-cluster",
    iconSize: L.point(dim, dim)
  });
}

const MAP_PAGE_SIZES = [300, 500, 1000, 5000, null] as const; // null = show all

export function DashboardPage() {
  const { t } = useTranslation();
  const { allOrders, loading, setAllOrders, setLoading, setError } = useOrderStore();
  const addToast = useUiStore((s) => s.addToast);
  const [mapReady, setMapReady] = useState(false);
  const [mapPageSize, setMapPageSize] = useState<number | null>(300);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(); // always fetch all for accurate stats
      setAllOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      addToast({ type: "error", message: t("toast.dashboardError") });
    } finally {
      setLoading(false);
    }
  }, [setAllOrders, setLoading, setError, addToast, t]);

  useEffect(() => {
    if (allOrders.length === 0) {
      void fetchAll();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Single-pass stats computation
  const { totalRevenue, totalTax, avgRate } = useMemo(() => {
    let revenue = 0;
    let tax = 0;
    let rateSum = 0;
    for (const o of allOrders) {
      revenue += o.total_amount;
      tax += o.tax_amount;
      rateSum += o.composite_tax_rate;
    }
    return {
      totalRevenue: revenue,
      totalTax: tax,
      avgRate: allOrders.length > 0 ? rateSum / allOrders.length : 0,
    };
  }, [allOrders]);

  const recent = useMemo(() => allOrders.slice(0, 8), [allOrders]);

  const mapOrders = useMemo(
    () => mapPageSize === null ? allOrders : allOrders.slice(0, mapPageSize),
    [allOrders, mapPageSize],
  );

  // Hide map while the new slice is being applied
  useEffect(() => {
    setMapReady(false);
  }, [mapPageSize]);

  // Defer map mount so stats paint first, and re-show after page-size change
  useEffect(() => {
    if (mapOrders.length === 0) return;
    const id = requestAnimationFrame(() => setMapReady(true));
    return () => cancelAnimationFrame(id);
  }, [mapOrders]);

  const markers = useMemo(
    () =>
      mapOrders.map((order) => (
        <Marker key={order.id} position={[order.latitude, order.longitude]} icon={droneIcon}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">Order #{order.id}</p>
              <p>{order.jurisdictions.join(", ")}</p>
              <p>Tax: {formatPercent(order.composite_tax_rate)}</p>
              <p>Total: {formatCurrency(order.total_amount)}</p>
            </div>
          </Popup>
        </Marker>
      )),
    [mapOrders],
  );

  return (
    <div className="space-y-6">
      <Seo title={t("seo.dashboardTitle")} description={t("seo.dashboardDesc")} />
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("dashboard.totalOrders")}
          value={allOrders.length}
          loading={loading}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label={t("dashboard.totalRevenue")}
          value={totalRevenue}
          format={(n) => formatCurrency(n)}
          loading={loading}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={t("dashboard.totalTax")}
          value={totalTax}
          format={(n) => formatCurrency(n)}
          loading={loading}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label={t("dashboard.avgTaxRate")}
          value={avgRate}
          format={(n) => formatPercent(n)}
          loading={loading}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
      </div>

      {/* Map */}
      <Card padding={false}>
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="font-heading text-base font-bold text-[var(--text-primary)]">{t("dashboard.deliveryMap")}</h2>
          <select
            value={mapPageSize ?? "all"}
            onChange={(e) => setMapPageSize(e.target.value === "all" ? null : Number(e.target.value))}
            className="rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 text-sm text-[var(--text-primary)]"
            aria-label={t("dashboard.mapOrderCount", "Orders to display")}
          >
            {MAP_PAGE_SIZES.map((size) => (
              <option key={size ?? "all"} value={size ?? "all"}>
                {size === null ? t("dashboard.mapOrdersAll") : t("dashboard.mapOrders", { count: size })}
              </option>
            ))}
          </select>
        </div>
        <div className="p-4">
          <div className="relative overflow-hidden rounded-xl border border-[var(--border-color)]">
            <MapContainer center={[40.75, -73.95]} zoom={10} className="h-[280px] sm:h-[350px] md:h-[400px] w-full" ariaLabel={t("a11y.deliveryMap")}>
              {mapReady && (
                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={60}
                  spiderfyOnMaxZoom
                  showCoverageOnHover={false}
                  iconCreateFunction={createClusterIcon}
                >
                  {markers}
                </MarkerClusterGroup>
              )}
            </MapContainer>
            {!mapReady && (loading || allOrders.length > 0) && (
              <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--bg-primary)]/60 backdrop-blur-sm">
                <Spinner size="lg" />
                <p className="mt-2 text-sm text-[var(--text-muted)]">{t("dashboard.mapLoading")}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <h2 className="mb-3 font-heading text-base font-bold text-[var(--text-primary)]">{t("dashboard.recentOrders")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">ID</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">{t("dashboard.colDate")}</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">{t("dashboard.colJurisdictions")}</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">{t("dashboard.colTax")}</th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">{t("dashboard.colTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border-light)]">
                  <td className="px-3 py-2 font-mono text-xs">#{o.id}</td>
                  <td className="px-3 py-2 text-xs">{formatDate(o.created_at)}</td>
                  <td className="px-3 py-2 text-xs">{o.jurisdictions.join(", ")}</td>
                  <td className="px-3 py-2 font-mono text-xs text-coral">{formatCurrency(o.tax_amount)}</td>
                  <td className="px-3 py-2 font-mono text-xs font-bold">{formatCurrency(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
