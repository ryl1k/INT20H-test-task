import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { MapContainer } from "@/components/map/MapContainer";
import { LocationPicker } from "@/components/map/LocationPicker";
import { CreateOrderForm } from "./CreateOrderForm";

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

export function CreateOrderModal({ open, onClose, onOrderCreated }: CreateOrderModalProps) {
  const { t } = useTranslation();
  const [position, setPosition] = useState<[number, number] | null>(null);

  const handleClose = useCallback(() => {
    setPosition(null);
    onClose();
  }, [onClose]);

  const handleSuccess = useCallback(() => {
    setPosition(null);
    onOrderCreated();
  }, [onOrderCreated]);

  const handlePositionChange = (lat: number, lon: number) => {
    setPosition([lat, lon]);
  };

  return (
    <Modal open={open} onClose={handleClose} title={t("createOrder.title")} className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
      <p className="mb-3 text-sm text-[var(--text-muted)]">{t("createOrder.pickLocation")}</p>
      <div className="overflow-hidden rounded-xl border border-[var(--border-color)] mb-4">
        <MapContainer center={[40.75, -73.95]} zoom={10} className="h-[350px] sm:h-[450px] w-full">
          <LocationPicker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>
      <CreateOrderForm
        latitude={position?.[0] ?? null}
        longitude={position?.[1] ?? null}
        onSuccess={handleSuccess}
      />
    </Modal>
  );
}
