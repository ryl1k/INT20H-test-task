import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sidebar } from "./Sidebar";
import { Toast } from "@/components/ui/Toast";
import { useUiStore } from "@/store/useUiStore";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-coral focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        {t("a11y.skipToContent")}
      </a>
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="relative flex items-center justify-center border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-4 lg:hidden">
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute left-3 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label={t("a11y.toggleSidebar")}
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo-no-bg.png" alt={t("app.name")} className="h-6 w-auto" />
            <span className="font-heading text-base font-bold text-[var(--text-primary)]">
              {t("app.name")}
            </span>
          </div>
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
