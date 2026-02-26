import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/router/routes";

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Seo title={t("seo.notFoundTitle")} description={t("seo.notFoundDesc")} />
      <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-coral">404</h1>
      <p className="mt-2 font-heading text-xl font-bold text-[var(--text-primary)]">
        {t("common.notFound")}
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{t("common.notFoundDesc")}</p>
      <Link to={ROUTES.DASHBOARD} className="mt-6">
        <Button>{t("common.goHome")}</Button>
      </Link>
    </div>
  );
}
