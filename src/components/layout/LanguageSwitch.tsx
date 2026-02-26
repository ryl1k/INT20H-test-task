import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/store/useUiStore";

const languages = [
  { code: "en", label: "English" },
  { code: "uk", label: "Українська" },
  { code: "pl", label: "Polski" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" }
];

export function LanguageSwitch({ collapsed = false }: { collapsed?: boolean }) {
  const { i18n, t } = useTranslation();
  const addToast = useUiStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0]!;

  const handleSelect = useCallback(
    (code: string) => {
      void i18n.changeLanguage(code);
      localStorage.setItem("language", code);
      const langLabel = languages.find((l) => l.code === code)?.label ?? code;
      addToast({ type: "info", message: t("toast.languageChanged", { lang: langLabel }) });
      setOpen(false);
      setFocusedIndex(-1);
    },
    [i18n, addToast, t]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          setOpen(false);
          setFocusedIndex(-1);
          break;
        case "ArrowUp": {
          e.preventDefault();
          const prev = focusedIndex <= 0 ? languages.length - 1 : focusedIndex - 1;
          setFocusedIndex(prev);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          const next = focusedIndex >= languages.length - 1 ? 0 : focusedIndex + 1;
          setFocusedIndex(next);
          break;
        }
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0) {
            handleSelect(languages[focusedIndex]!.code);
          }
          break;
      }
    },
    [open, focusedIndex, handleSelect]
  );

  useEffect(() => {
    if (open && focusedIndex >= 0 && listRef.current) {
      const buttons = listRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]');
      buttons[focusedIndex]?.focus();
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref} onKeyDown={handleKeyDown}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (!open) {
            const currentIndex = languages.findIndex((l) => l.code === i18n.language);
            setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
          }
        }}
        aria-label={t("a11y.changeLanguage")}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center cursor-pointer rounded-lg bg-[var(--bg-tertiary)] text-base font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-coral/30 ${collapsed ? "justify-center p-2.5" : "w-full pl-8 pr-8 py-2.5"}`}
        title={collapsed ? current.label : undefined}
      >
        <svg className={`pointer-events-none h-4 w-4 shrink-0 text-[var(--text-muted)] ${collapsed ? "" : "absolute left-2 top-1/2 -translate-y-1/2"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {!collapsed && current.label}
        {!collapsed && (
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className={`absolute rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] py-1 shadow-lg z-50 ${collapsed ? "bottom-0 left-full ml-2 w-40" : "bottom-full left-0 mb-1 w-full"}`}
        >
          {languages.map((lang, index) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === i18n.language}
                onClick={() => handleSelect(lang.code)}
                tabIndex={focusedIndex === index ? 0 : -1}
                className={`w-full cursor-pointer px-3 py-1.5 text-left text-sm transition-colors ${
                  lang.code === i18n.language
                    ? "bg-coral/10 text-coral font-medium"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
