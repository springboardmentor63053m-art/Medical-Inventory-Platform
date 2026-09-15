import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle color theme"
      className={`relative w-9 h-9 rounded-lg flex items-center justify-center border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors ${className}`}
    >
      <Sun size={16} className={`absolute transition-all duration-300 ${isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"}`} />
      <Moon size={16} className={`absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`} />
    </button>
  );
}
