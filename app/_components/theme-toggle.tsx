"use client";

import { useCallback, useEffect, useState } from "react";

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

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return getStoredTheme() ?? "system";
  });

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

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }, []);

  const cycle = useCallback(() => {
    const order: Theme[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  const icons: Record<Theme, string> = {
    light: "☀",
    dark: "☾",
    system: "◐",
  };

  return (
    <button
      type="button"
      onClick={cycle}
      className="ml-auto text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      aria-label={`Theme: ${theme}. Click to cycle.`}
    >
      {icons[theme]}
    </button>
  );
}
