import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createOrderSchema } from "@/validation/orderSchema";
import { createOrder } from "@/api/ordersApi";
import { useUiStore } from "@/store/useUiStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TaxBreakdown } from "./TaxBreakdown";
import type { Order } from "@/types/order";

interface CreateOrderFormProps {
  latitude: number | null;
  longitude: number | null;
  onSuccess?: () => void;
}

export function CreateOrderForm({ latitude, longitude, onSuccess }: CreateOrderFormProps) {
  const { t } = useTranslation();
  const addToast = useUiStore((s) => s.addToast);
  const addOrders = useOrderStore((s) => s.addOrders);
  const [subtotal, setSubtotal] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setResult(null);

    const parsed = createOrderSchema.safeParse({
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      subtotal: subtotal ? Number(subtotal) : undefined
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key) fieldErrors[String(key)] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder(parsed.data);
      setResult(order);
      addOrders([order]);
      addToast({ type: "success", message: t("createOrder.success") });
      onSuccess?.();
    } catch {
      addToast({ type: "error", message: t("createOrder.error") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t("createOrder.latitude")}
            value={latitude?.toFixed(6) ?? ""}
            readOnly
            error={errors.latitude}
          />
          <Input
            label={t("createOrder.longitude")}
            value={longitude?.toFixed(6) ?? ""}
            readOnly
            error={errors.longitude}
          />
        </div>
        <Input
          label={t("createOrder.subtotal")}
          type="number"
          step="0.01"
          min="0.01"
          max="10000"
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
          error={errors.subtotal}
          placeholder="50.00"
        />
        <Button type="submit" disabled={submitting || !latitude || !longitude} className="w-full">
          {submitting ? t("common.loading") : t("createOrder.submit")}
        </Button>
      </form>

      {result && (
        <div className="mt-4 space-y-3">
          <h3 className="font-heading text-base font-bold text-[var(--text-primary)]">{t("createOrder.result")}</h3>
          <TaxBreakdown order={result} />
        </div>
      )}
    </Card>
  );
}
