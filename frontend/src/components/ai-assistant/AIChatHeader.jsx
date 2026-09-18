import { Minus, X, RotateCcw, Maximize2, Minimize2, Sparkles } from 'lucide-react'

export default function AIChatHeader({
  onMinimize,
  onClose,
  onClear,
  onToggleMaximize,
  onTogglePrompts,
  isMinimized,
  isMaximized,
  showPrompts
}) {
  return (
    <div className="relative px-4 py-3.5 bg-slate-50/95 dark:bg-gradient-to-r dark:from-[#071022] dark:via-[#09152e] dark:to-[#060c1d] border-b border-slate-200 dark:border-cyan-950/80 flex items-center justify-between select-none">
      {/* Top cyan gradient accent border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 dark:via-cyan-400 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]" />

      {/* Left: Avatar + Title + Status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-400 flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <img
            src="/ai-robot.png"
            alt="MedStock AI Bot"
            className="w-full h-full object-cover rounded-full bg-slate-950"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950" />
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
              MedStock AI Assistant
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {showPrompts
              ? 'Your Intelligent Pharmacy & Gen...'
              : 'Your Intelligent Pharmacy & General Assistant'}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        {/* Toggle Prompts */}
        {onTogglePrompts && !isMinimized && (
          <button
            type="button"
            onClick={onTogglePrompts}
            title={showPrompts ? "Switch to Universal View" : "Show Suggested Questions Grid"}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showPrompts
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prompts</span>
          </button>
        )}

        {/* Clear Chat */}
        {onClear && !isMinimized && (
          <button
            type="button"
            onClick={onClear}
            title="Reset Conversation"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Expand / Maximize Full View */}
        {onToggleMaximize && !isMinimized && (
          <button
            type="button"
            onClick={onToggleMaximize}
            title={isMaximized ? "Restore Window" : "Expand Full Clinical Hub"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* Minimize */}
        <button
          type="button"
          onClick={onMinimize}
          title={isMinimized ? "Expand Chat" : "Minimize to Dock"}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close Assistant"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
