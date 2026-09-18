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
        className="relative inline-flex items-center p-1 rounded-full
                   bg-slate-100 dark:bg-slate-800
                   border border-slate-200 dark:border-slate-700
                   shadow-inner"
        style={{ minWidth: 80 }}
        role="group"
        aria-label="Theme selection"
      >
        {/* Animated sliding background */}
        <span
          className="absolute top-1 bottom-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                     bg-white dark:bg-slate-600
                     rounded-full shadow-md border border-slate-200 dark:border-slate-500"
          style={{ width: `calc(50% - 2px)`, left: `calc(${sliderLeft} + 1px)` }}
          aria-hidden
        />

        {options.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-label={`Switch to ${label} theme`}
            className={`relative z-10 flex items-center justify-center w-9 h-7 rounded-full
                        text-xs font-medium transition-colors duration-200
                        ${isDark === (value === 'dark')
                          ? 'text-blue-600 dark:text-blue-300'
                          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
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
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-600'
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
      className="relative p-2.5 rounded-xl overflow-hidden
                 text-slate-500 dark:text-slate-400
                 hover:text-slate-700 dark:hover:text-slate-200
                 hover:bg-slate-100 dark:hover:bg-slate-800
                 transition-all duration-200 active:scale-90 group"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {/* Ripple bg on hover */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-amber-400/0
                       group-hover:from-amber-400/5 group-hover:to-orange-400/5
                       dark:group-hover:from-blue-400/5 dark:group-hover:to-indigo-400/5
                       transition-all duration-300" />

      <span className="relative block transition-transform duration-500"
            style={{ transform: isDark ? 'rotate(0deg)' : 'rotate(30deg)' }}>
        {isDark
          ? <Sun  className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
          : <Moon className="w-5 h-5 text-indigo-500 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
        }
      </span>
    </button>
  )
}
