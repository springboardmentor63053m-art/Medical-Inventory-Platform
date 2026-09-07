import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* ─────────────────────────────────────────────────────────
 * ThemeToggle — two-state animated pill toggle (Light / Dark)
 * ──────────────────────────────────────────────────────── */

const options = [
  { value: 'light', icon: Sun,  label: 'Light' },
  { value: 'dark',  icon: Moon, label: 'Dark' },
]

export default function ThemeToggle({ variant = 'icon' }) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme()

  /* ── Pill (2-option slider) ── */
  if (variant === 'pill') {
    const idx = options.findIndex(o => o.value === theme)
    const activeIdx = idx === -1 ? (isDark ? 1 : 0) : idx
    const sliderLeft = `${activeIdx * 50}%`

    return (
      <div
        className="relative inline-flex items-center p-0.5 rounded-full
                   bg-slate-200 dark:bg-[#131B2E]
                   border border-slate-300 dark:border-[#23324C]
                   shadow-inner"
        style={{ minWidth: 68 }}
        role="group"
        aria-label="Theme selection"
      >
        {/* Animated sliding background */}
        <span
          className="absolute top-0.5 bottom-0.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                     bg-white dark:bg-[#202B3C]
                     rounded-full shadow-sm"
          style={{ width: `calc(50% - 2px)`, left: `calc(${sliderLeft} + 1px)` }}
          aria-hidden
        />

        {options.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-label={`Switch to ${label} theme`}
            className={`relative z-10 flex items-center justify-center w-8 h-6 rounded-full
                        text-xs font-medium transition-colors duration-200
                        ${isDark === (value === 'dark')
                          ? (value === 'dark' ? 'text-cyan-400' : 'text-amber-500 font-bold')
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>
    )
  }

  /* ── Segmented (full labels) ── */
  if (variant === 'segmented') {
    return (
      <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-0.5">
        {options.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold
                        transition-all duration-200
                        ${theme === value
                          ? 'bg-white dark:bg-slate-700 text-[#FF5500] shadow-md border border-slate-200 dark:border-slate-600'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    )
  }

  /* ── Icon toggle (default) ── */
  return (
    <button
      onClick={toggleTheme}
      className="
        w-8 h-8 rounded-lg
        bg-slate-100 dark:bg-[#141A26]
        border border-slate-200 dark:border-[#202B3C]
        flex items-center justify-center
        text-slate-600 dark:text-slate-400
        hover:text-slate-900 dark:hover:text-white
        transition-all duration-200 active:scale-95
      "
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
    </button>
  )
}
