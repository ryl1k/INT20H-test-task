import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/store/useUiStore";

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const addToast = useUiStore((s) => s.addToast);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    addToast({
      type: "info",
      message: t("toast.themeChanged", { theme: next ? t("theme.dark") : t("theme.light") })
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={collapsed ? (dark ? t("theme.light") : t("theme.dark")) : undefined}
      className={`flex items-center rounded-lg text-base font-medium
        bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]
        transition-colors cursor-pointer ${collapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2.5"}`}
      aria-label={dark ? t("theme.light") : t("theme.dark")}
    >
      {dark ? (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      {!collapsed && <span>{dark ? t("theme.light") : t("theme.dark")}</span>}
    </button>
  );
}
