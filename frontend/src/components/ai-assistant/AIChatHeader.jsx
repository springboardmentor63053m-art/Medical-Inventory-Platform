import { Minus, X, RotateCcw, Maximize2 } from 'lucide-react'

export default function AIChatHeader({
  onMinimize,
  onClose,
  onClear,
  isMinimized
}) {
  return (
    <div className="relative px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-cyan-950/60 flex items-center justify-between select-none">
      {/* Subtle top cyan border glow */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Left: Avatar + Title & Subtitle + Online badge */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
          <img
            src="/ai-robot.png"
            alt="AI Avatar"
            className="w-full h-full object-cover rounded-full bg-slate-950"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 tracking-tight truncate font-sans">
              MedStock AI Assistant
            </h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Your Intelligent Pharmacy & General Assistant
          </p>
        </div>
      </div>

      {/* Right: Actions (Clear, Minimize, Close) */}
      <div className="flex items-center gap-1">
        {onClear && !isMinimized && (
          <button
            type="button"
            onClick={onClear}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={onMinimize}
          title={isMinimized ? "Restore Chat" : "Minimize Chat"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
        >
          {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close Chat"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
