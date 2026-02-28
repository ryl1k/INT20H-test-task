import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MapContainer as LeafletMap, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { createOrder } from "@/api/ordersApi";
import { useUiStore } from "@/store/useUiStore";
import { useOrderStore } from "@/store/useOrderStore";
import { ROUTES } from "@/router/routes";
import { NYC_CENTER } from "@/constants/geo";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import type { Order } from "@/types/order";

type Step = "form" | "submitting" | "result";

interface FormErrors {
  latitude?: string;
  longitude?: string;
  subtotal?: string;
}

function formatNum(value: number, decimals = 4) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

const pinIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:14px;height:14px;background:#E8573D;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapPickerModal({
  open,
  onClose,
  onPick
}: {
  open: boolean;
  onClose: () => void;
  onPick: (lat: number, lng: number) => void;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState<[number, number] | null>(null);

  const handlePick = (lat: number, lng: number) => {
    setPin([lat, lng]);
  };

  const handleConfirm = () => {
    if (pin) {
      onPick(pin[0], pin[1]);
      setPin(null);
      onClose();
    }
  };

  const handleClose = () => {
    setPin(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("createOrder.title")} className="max-w-xl w-full">
      <p className="mb-3 text-sm text-[var(--text-muted)]">{t("createOrder.pickLocation")}</p>
      <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
        <LeafletMap
          center={NYC_CENTER}
          zoom={10}
          className="h-[380px] w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPick={handlePick} />
          {pin && <Marker position={pin} icon={pinIcon} />}
        </LeafletMap>
      </div>
      {pin && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            {pin[0].toFixed(6)}, {pin[1].toFixed(6)}
          </p>
          <Button size="sm" onClick={handleConfirm}>
            {t("createOrder.confirmLocation")}
          </Button>
        </div>
      )}
      {!pin && (
        <p className="mt-3 text-xs text-[var(--text-muted)] text-center">{t("createOrder.dropPin")}</p>
      )}
    </Modal>
  );
}

export function CreateOrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);
  const addOrders = useOrderStore((s) => s.addOrders);

  const [step, setStep] = useState<Step>("form");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [mapOpen, setMapOpen] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const sub = parseFloat(subtotal);

    if (!latitude || isNaN(lat) || lat < -90 || lat > 90) {
      next.latitude = "Latitude must be between -90 and 90";
    }
    if (!longitude || isNaN(lng) || lng < -180 || lng > 180) {
      next.longitude = "Longitude must be between -180 and 180";
    }
    if (!subtotal || isNaN(sub) || sub <= 0) {
      next.subtotal = "Subtotal must be a positive number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStep("submitting");
    try {
      const ts = timestamp ? new Date(timestamp).toISOString() : undefined;
      const order = await createOrder({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        subtotal: parseFloat(subtotal),
        timestamp: ts
      });
      addOrders([order]);
      setCreatedOrder(order);
      setStep("result");
      addToast({ type: "success", message: t("createOrder.success") });
    } catch {
      addToast({ type: "error", message: t("createOrder.error") });
      setStep("form");
    }
  };

  const handleReset = () => {
    setLatitude("");
    setLongitude("");
    setSubtotal("");
    setTimestamp("");
    setErrors({});
    setCreatedOrder(null);
    setStep("form");
  };

  return (
    <div className="mx-auto max-w-3xl pt-12 sm:pt-20 space-y-6">
      <Seo title={t("seo.createTitle")} description={t("seo.createDesc")} />

      {/* Step indicator */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-base text-[var(--text-muted)]">
        <Badge variant={step === "form" || step === "submitting" ? "info" : "default"} className="px-4 py-1.5 text-sm">
          1. {t("import.upload").replace("CSV", "").trim() || "Fill Details"}
        </Badge>
        <span>&rarr;</span>
        <Badge variant={step === "result" ? "info" : "default"} className="px-4 py-1.5 text-sm">
          2. {t("import.results")}
        </Badge>
      </div>

      {(step === "form" || step === "submitting") && (
        <Card>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("createOrder.title")}</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t("createOrder.subtitle")}</p>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label={t("createOrder.latitude")}
                  type="number"
                  step="any"
                  placeholder={t("createOrder.latPlaceholder")}
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    if (errors.latitude) setErrors((p) => ({ ...p, latitude: undefined }));
                  }}
                  error={errors.latitude}
                  disabled={step === "submitting"}
                />
              </div>
              <div className="flex-1">
                <Input
                  label={t("createOrder.longitude")}
                  type="number"
                  step="any"
                  placeholder={t("createOrder.lngPlaceholder")}
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    if (errors.longitude) setErrors((p) => ({ ...p, longitude: undefined }));
                  }}
                  error={errors.longitude}
                  disabled={step === "submitting"}
                />
              </div>
              <div className="shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setMapOpen(true)}
                  disabled={step === "submitting"}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {t("createOrder.pickOnMap")}
                </Button>
              </div>
            </div>
            <MapPickerModal
              open={mapOpen}
              onClose={() => setMapOpen(false)}
              onPick={(lat, lng) => {
                setLatitude(lat.toFixed(6));
                setLongitude(lng.toFixed(6));
                setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
              }}
            />

            <Input
              label={t("createOrder.subtotal")}
              type="number"
              step="0.01"
              min="0"
              placeholder={t("createOrder.subtotalPlaceholder")}
              value={subtotal}
              onChange={(e) => {
                setSubtotal(e.target.value);
                if (errors.subtotal) setErrors((p) => ({ ...p, subtotal: undefined }));
              }}
              error={errors.subtotal}
              disabled={step === "submitting"}
            />

            <Input
              label={t("createOrder.dateOptional")}
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              disabled={step === "submitting"}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={step === "submitting"} className="min-w-[200px]">
                {step === "submitting" ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("createOrder.submit")
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {step === "result" && createdOrder && (
        <Card>
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t("createOrder.result")}</h2>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">#{createdOrder.id}</p>
              </div>
              <Badge variant={createdOrder.status === "completed" ? "success" : "warning"} className="w-fit px-3 py-1 capitalize">
                {createdOrder.status === "out_of_scope" ? t("orders.outOfScope") : createdOrder.status}
              </Badge>
            </div>

            {/* Main figures */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{t("orders.subtotal")}</p>
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{formatCurrency(createdOrder.total_amount)}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{t("orders.taxAmount")}</p>
                <p className="mt-1 text-lg font-bold text-[var(--text-primary)]">{formatCurrency(createdOrder.tax_amount)}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                <p className="text-xs text-[var(--text-muted)]">{t("orders.total")}</p>
                <p className="mt-1 text-lg font-bold text-coral">{formatCurrency(createdOrder.total_amount + createdOrder.tax_amount)}</p>
              </div>
            </div>

            {/* Location & rate */}
            <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 flex flex-wrap justify-center gap-x-16 gap-y-3 text-center">
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("createOrder.latitude")}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{formatNum(createdOrder.latitude)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("createOrder.longitude")}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{formatNum(createdOrder.longitude)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{t("orders.taxRate")}</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{(createdOrder.composite_tax_rate * 100).toFixed(4)}%</p>
              </div>
              {createdOrder.reporting_code && (
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{t("orders.reportingCode")}</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{createdOrder.reporting_code}</p>
                </div>
              )}
            </div>

            {/* Tax breakdown */}
            {createdOrder.status === "completed" && createdOrder.breakdown && (
              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 space-y-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{t("taxBreakdown.title")}</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <span className="text-[var(--text-muted)]">{t("taxBreakdown.stateRate")}</span>
                  <span className="text-right text-[var(--text-primary)]">{(createdOrder.breakdown.state_rate * 100).toFixed(4)}%</span>
                  <span className="text-[var(--text-muted)]">{t("taxBreakdown.countyRate")}</span>
                  <span className="text-right text-[var(--text-primary)]">{(createdOrder.breakdown.county_rate * 100).toFixed(4)}%</span>
                  <span className="text-[var(--text-muted)]">{t("taxBreakdown.cityRate")}</span>
                  <span className="text-right text-[var(--text-primary)]">{(createdOrder.breakdown.city_rate * 100).toFixed(4)}%</span>
                  <span className="text-[var(--text-muted)]">{t("taxBreakdown.specialRates")}</span>
                  <span className="text-right text-[var(--text-primary)]">{(createdOrder.breakdown.special_rate * 100).toFixed(4)}%</span>
                </div>
              </div>
            )}

            {/* Jurisdictions */}
            {createdOrder.jurisdictions && createdOrder.jurisdictions.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1.5">{t("taxBreakdown.jurisdiction")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {createdOrder.jurisdictions.map((j) => (
                    <Badge key={j} variant="default" className="text-xs px-2 py-0.5">{j}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t("import.back")}
              </Button>
              <Button size="sm" onClick={() => { void navigate(ROUTES.ORDERS); }}>
                {t("orders.title")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { void navigate(ROUTES.DASHBOARD); }}>
                {t("import.goToDashboard")}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
