import { Sparkles, ChevronRight, X } from 'lucide-react'

const PROMPTS = [
  { icon: '💊', label: 'Which medicines need reordering?', query: 'Which medicines need reordering?' },
  { icon: '📉', label: 'Show current stock risks', query: 'Show current stock risks' },
  { icon: '📅', label: 'Which medicines expire soon?', query: 'Which medicines expire soon?' },
  { icon: '📊', label: "Show today's sales summary", query: "Show today's sales summary" },
  { icon: '🚨', label: 'Explain active alerts', query: 'Explain active alerts' },
  { icon: '🚚', label: 'Show supplier lead times', query: 'Show supplier lead times' },
  { icon: '❓', label: 'What can you help me with?', query: 'What can you help me with?' },
]

export default function SuggestedPrompts({ onSelectPrompt, onClose, variant = 'grid' }) {
  if (variant === 'pills') {
    return (
      <div className="p-3 bg-slate-50/90 dark:bg-[#070e20] border-b border-slate-200 dark:border-slate-800/80 select-none animate-fade-in">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Suggested Questions
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PROMPTS.map((item, idx) => {
            const icon = idx === 6 ? '🤖' : item.icon
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPrompt(item.query)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-[#09152b] hover:bg-cyan-50 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-white text-xs font-medium transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="text-sm">{icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  return (
    <div className="p-3 bg-slate-100/90 dark:bg-[#081226]/90 border-b border-slate-200 dark:border-slate-800/90 select-none animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            Suggested Questions
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 p-0.5 rounded transition-colors"
            title="Hide Suggestions"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.query)}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#0d1c3a]/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/40
                       border border-slate-200 dark:border-slate-800/80 hover:border-cyan-400 dark:hover:border-cyan-500/50 shadow-xs transition-all duration-200 group text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-white truncate">
                {item.label}
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </div>
  )
}
