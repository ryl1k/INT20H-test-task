import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/seo/Seo";
import { MapContainer } from "@/components/map/MapContainer";
import { LocationPicker } from "@/components/map/LocationPicker";
import { CreateOrderForm } from "@/components/orders/CreateOrderForm";

export function CreateOrderPage() {
  const { t } = useTranslation();
  const [position, setPosition] = useState<[number, number] | null>(null);

  const handlePositionChange = (lat: number, lon: number) => {
    setPosition([lat, lon]);
  };

  return (
    <div className="space-y-4">
      <Seo title={t("seo.createTitle")} description={t("seo.createDesc")} />
      <p className="text-sm text-[var(--text-muted)]">{t("createOrder.pickLocation")}</p>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
          <MapContainer center={[40.75, -73.95]} zoom={10} className="h-[300px] sm:h-[400px] lg:h-[500px] w-full">
            <LocationPicker position={position} onPositionChange={handlePositionChange} />
          </MapContainer>
        </div>
        <CreateOrderForm latitude={position?.[0] ?? null} longitude={position?.[1] ?? null} />
      </div>
    </div>
  );
}
