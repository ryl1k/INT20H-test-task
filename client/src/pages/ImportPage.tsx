import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useFileUpload } from "@/hooks/useFileUpload";
import { importCSV, clearAllOrders } from "@/api/ordersApi";
import { isMockMode } from "@/api/axiosInstance";
import { mockApi } from "@/mocks/mockApi";
import { useUiStore } from "@/store/useUiStore";
import { useOrderStore } from "@/store/useOrderStore";
import { ROUTES } from "@/router/routes";
import { Card } from "@/components/ui/Card";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { ImportPreview } from "@/components/orders/ImportPreview";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type Step = "upload" | "preview" | "importing" | "results";

export function ImportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { rows, fileName, parsing, processFile, reset, file } = useFileUpload();
  const addToast = useUiStore((s) => s.addToast);
  const addOrders = useOrderStore((s) => s.addOrders);
  const clearOrders = useOrderStore((s) => s.clearOrders);
  const [step, setStep] = useState<Step>("upload");
  const [importedCount, setImportedCount] = useState(0);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const validRows = rows.filter((r) => r.valid);

  const handleFile = (f: File) => {
    processFile(f);
    setStep("preview");
  };

  const handleImport = async () => {
    setStep("importing");
    try {
      if (isMockMode) {
        // Mock mode: parse rows client-side
        const payloads = validRows.map((r) => ({
          latitude: r.data.latitude,
          longitude: r.data.longitude,
          subtotal: r.data.subtotal,
          timestamp: r.data.timestamp
        }));
        const imported = await mockApi.importCSV(payloads);
        addOrders(imported);
        setImportedCount(imported.length);
        setStep("results");
        addToast({ type: "success", message: t("import.success", { count: imported.length }) });
      } else {
        // Real mode: send file to backend
        if (!file) throw new Error("No file selected");
        const result = await importCSV(file);
        setImportedCount(validRows.length);
        setStep("results");
        addToast({ type: "success", message: result.message || t("import.success", { count: validRows.length }) });
      }
    } catch {
      addToast({ type: "error", message: t("import.error") });
      setStep("preview");
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllOrders();
      clearOrders();
      addToast({ type: "success", message: t("import.clearOrdersSuccess") });
    } catch {
      addToast({ type: "error", message: t("common.error") });
    } finally {
      setClearing(false);
      setClearModalOpen(false);
    }
  };

  const handleReset = () => {
    reset();
    setStep("upload");
    setImportedCount(0);
  };

  return (
    <div className="mx-auto max-w-3xl pt-12 sm:pt-20 space-y-6">
      <Seo title={t("seo.importTitle")} description={t("seo.importDesc")} />
      {/* Step indicator */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-base text-[var(--text-muted)]">
        <Badge variant={step === "upload" ? "info" : "default"} className="px-4 py-1.5 text-sm">1. {t("import.upload")}</Badge>
        <span>&rarr;</span>
        <Badge variant={step === "preview" ? "info" : "default"} className="px-4 py-1.5 text-sm">2. {t("import.preview")}</Badge>
        <span>&rarr;</span>
        <Badge variant={step === "results" || step === "importing" ? "info" : "default"} className="px-4 py-1.5 text-sm">3. {t("import.results")}</Badge>
      </div>

      {step === "upload" && (
        <>
          <Card>
            <FileDropzone
              accept=".csv"
              onFile={handleFile}
              label={t("import.uploadDesc")}
              hint={t("import.uploadHint")}
            />
          </Card>
          <div className="flex justify-center">
            <Button variant="danger" size="sm" onClick={() => setClearModalOpen(true)}>
              {t("import.clearOrders")}
            </Button>
          </div>
        </>
      )}

      {step === "preview" && (
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              {fileName} &middot; {rows.length} rows
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                {t("import.back")}
              </Button>
              <Button size="sm" onClick={() => void handleImport()} disabled={validRows.length === 0}>
                {t("import.importAll")} ({validRows.length})
              </Button>
            </div>
          </div>
          {parsing ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <ImportPreview rows={rows} />
          )}
        </Card>
      )}

      {step === "importing" && (
        <Card>
          <div className="flex flex-col items-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-[var(--text-muted)]">{t("import.importing")}</p>
          </div>
        </Card>
      )}

      {step === "results" && (
        <Card>
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-heading text-lg font-bold text-[var(--text-primary)]">
              {t("import.success", { count: importedCount })}
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate(ROUTES.DASHBOARD)}>
              {t("import.goToDashboard")}
            </Button>
          </div>
        </Card>
      )}

      <Modal open={clearModalOpen} onClose={() => setClearModalOpen(false)} title={t("import.clearOrders")}>
        <p className="text-sm text-[var(--text-secondary)]">
          {t("import.clearOrdersConfirm")}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(false)} disabled={clearing}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => void handleClearAll()} disabled={clearing}>
            {clearing ? <Spinner size="sm" /> : t("common.confirm")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
