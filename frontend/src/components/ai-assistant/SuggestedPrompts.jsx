import { Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  { icon: '💊', label: 'Which medicines need reordering?', query: 'Which medicines need reordering?' },
  { icon: '📉', label: 'Show current stock risks', query: 'Show current stock risks' },
  { icon: '📅', label: 'Which medicines expire soon?', query: 'Which medicines expire soon?' },
  { icon: '📊', label: "Show today's sales summary", query: "Show today's sales summary" },
  { icon: '🚨', label: 'Explain active alerts', query: 'Explain active alerts' },
  { icon: '🚚', label: 'Show supplier lead times', query: 'Show supplier lead times' },
  { icon: '🤖', label: 'What can you help me with?', query: 'What can you help me with?' },
]

export default function SuggestedPrompts({ onSelectPrompt }) {
  return (
    <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Questions
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.query)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-cyan-950/40
                       border border-slate-700/60 hover:border-cyan-500/50 text-[12px] font-medium text-slate-300
                       hover:text-cyan-300 transition-all duration-200 active:scale-95 group text-left"
          >
            <span className="text-xs group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
