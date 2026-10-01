"use client";

import { MoonIcon, SunIcon } from "./icons";

/** Switches light/dark and remembers the choice. CSS decides which icon shows, so it never flickers. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const root = document.documentElement;
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {
          // private mode: choice lasts for this visit only
        }
      }}
      className={`inline-flex size-10 items-center justify-center rounded-full text-heading transition-colors hover:bg-sand ${className}`}
    >
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </button>
  );
}

/** Runs before the page paints: applies the saved theme, or the system's, so there's no flash. */
export const themeInitScript = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;
