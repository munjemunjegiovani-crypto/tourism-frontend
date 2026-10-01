"use client";

type Labels = { toDark: string; toLight: string };

/**
 * Switches between light and dark and remembers the choice.
 * Both icons are rendered; CSS shows the right one, so the button never flickers.
 */
export function ThemeToggle({ labels }: { labels: Labels }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private browsing: the choice just won't be remembered
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex size-9 items-center justify-center rounded-full border border-band-ink/40 text-band-ink hover:bg-band-ink/10"
    >
      <span className="sr-only dark:hidden">{labels.toDark}</span>
      <span className="sr-only hidden dark:inline">{labels.toLight}</span>
      {/* moon: shown in light mode */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" strokeLinejoin="round" />
      </svg>
      {/* sun: shown in dark mode */}
      <svg aria-hidden viewBox="0 0 24 24" className="hidden size-5 dark:block" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/** Runs before the page paints: applies the saved theme, or the system's, to avoid a flash. */
export const themeInitScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;
