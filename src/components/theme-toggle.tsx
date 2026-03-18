"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("barbersaas-theme") as Theme | null;
    const initial = stored ?? "light";
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("barbersaas-theme", next);
    }
    document.documentElement.dataset.theme = next;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border px-3 py-1 text-xs font-medium text-zinc-800 bg-white/70 hover:bg-zinc-100 data-[theme=dark]:bg-zinc-900 data-[theme=dark]:text-zinc-100"
    >
      {theme === "light" ? "Modo escuro" : "Modo claro"}
    </button>
  );
}

