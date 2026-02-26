import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuthStore, MOCK_EMAIL, MOCK_PASSWORD } from "@/store/useAuthStore";
import { ROUTES } from "@/router/routes";

const isDev = import.meta.env.DEV;

export function SignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);

    if (signIn(email, password)) {
      void navigate(ROUTES.DASHBOARD);
    } else {
      setError(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-4">
      <Seo title={t("seo.signInTitle")} description={t("seo.signInDesc")} />

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo-cropped.png" alt={t("app.name")} className="h-20 w-20 rounded-xl" />
          <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            {t("app.name")}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">{t("signIn.subtitle")}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("signIn.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wellness.com"
              required
              autoComplete="email"
            />
            <Input
              label={t("signIn.password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-xs text-error">{t("signIn.error")}</p>
            )}

            <Button type="submit" className="w-full">
              {t("signIn.submit")}
            </Button>
          </form>
        </Card>

        {isDev && (
          <div className="rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
            <p className="mb-1.5 text-xs font-medium text-[var(--text-muted)]">
              {t("signIn.devHint")}
            </p>
            <p className="font-mono text-xs text-[var(--text-secondary)]">
              {MOCK_EMAIL}<br />
              {MOCK_PASSWORD}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
