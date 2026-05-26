"use client";

import { useCallback, useEffect } from "react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {}
  return null;
}

function applyTheme(theme: Theme): void {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

function subscribeToThemeChanges(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("theme-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-change", callback);
  };
}

function getThemeSnapshot(): Theme {
  return getStoredTheme() ?? "system";
}

function getThemeServerSnapshot(): Theme {
  return "system";
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToThemeChanges, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    applyTheme(theme);

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((getStoredTheme() ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const cycle = useCallback(() => {
    const order: Theme[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    try { localStorage.setItem("theme", next); } catch {}
    window.dispatchEvent(new CustomEvent("theme-change"));
  }, [theme]);

  const icons: Record<Theme, string> = {
    light: "☀",
    dark: "☾",
    system: "◐",
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="ml-auto text-sm font-medium text-zinc-600 transition-colors hover:text-accent dark:text-zinc-400 dark:hover:text-accent"
      aria-label={`Theme: ${theme}. Click to cycle.`}
    >
      {icons[theme]}
    </button>
  );
}
