import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { useUiStore } from "@/store/useUiStore";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { path: ROUTES.DASHBOARD, labelKey: "nav.dashboard", icon: "dashboard" },
  { path: ROUTES.ORDERS, labelKey: "nav.orders", icon: "orders" },
  { path: ROUTES.IMPORT, labelKey: "nav.import", icon: "import" },
  // { path: ROUTES.CREATE, labelKey: "nav.create", icon: "create" }
] as const;

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "dashboard":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "orders":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "import":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case "create":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleCollapsed = useUiStore((s) => s.toggleSidebarCollapsed);
  const signOut = useAuthStore((s) => s.signOut);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[9000] bg-black/50 lg:hidden"
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-[9001] flex h-full flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] transition-all duration-300 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-16" : "w-80"
        )}
      >
        {/* Brand */}
        <div className={cn(
          "flex items-center border-b border-[var(--border-color)] py-4 mt-2",
          collapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          {collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 cursor-pointer"
              aria-label={t("a11y.toggleSidebar")}
              title={t("app.name")}
            >
              <svg className="h-5 w-5 rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <>
              <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
                <img src="/logo-no-bg.png" alt={t("app.name")} className="h-7 w-auto shrink-0" />
                <p className="font-heading text-base font-bold leading-snug text-[var(--text-primary)]">
                  <span>Instant</span>
                  <br />
                  <span>Wellness<span className="inline-block w-1.5" />Kits</span>
                </p>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-300 cursor-pointer"
                  aria-label={t("a11y.toggleSidebar")}
                >
                  <svg className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer lg:hidden"
                  aria-label={t("a11y.closeSidebar")}
                >
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")} aria-label={t("a11y.mainNavigation")}>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? t(item.labelKey) : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-lg py-3 text-base font-medium transition-colors cursor-pointer",
                      collapsed ? "justify-center px-0" : "gap-3 px-3",
                      isActive
                        ? "bg-coral/10 text-coral"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <NavIcon icon={item.icon} />
                      {!collapsed && <span aria-current={isActive ? "page" : undefined}>{t(item.labelKey)}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={cn(
          "flex flex-col border-t border-[var(--border-color)] pb-5 mb-2",
          collapsed ? "items-center gap-2 px-2 pt-3" : "gap-3 px-4 pt-4"
        )}>
          <LanguageSwitch collapsed={collapsed} />
          <ThemeToggle collapsed={collapsed} />
          <button
            type="button"
            onClick={() => setShowSignOutModal(true)}
            title={collapsed ? t("signIn.signOut") : undefined}
            className={cn(
              "flex items-center rounded-lg text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-error transition-colors cursor-pointer",
              collapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2.5"
            )}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && t("signIn.signOut")}
          </button>
        </div>
      </aside>

      <Modal open={showSignOutModal} onClose={() => setShowSignOutModal(false)} title={t("signIn.signOut")}>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">{t("signIn.signOutConfirm")}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowSignOutModal(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSignOutModal(false);
              signOut();
              void navigate(ROUTES.SIGN_IN);
            }}
            className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90 transition-colors cursor-pointer"
          >
            {t("signIn.signOut")}
          </button>
        </div>
      </Modal>
    </>
  );
}
