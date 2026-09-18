import { useState } from 'react'

export default function FloatingAIButton({ onClick, isOpen, isMinimized }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Sleek Tooltip when not open */}
      {!isOpen && (
        <div
          className={`transition-all duration-300 pointer-events-none ${
            isHovered
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-2'
          }`}
        >
          <div className="bg-slate-900/95 border border-cyan-500/30 text-white text-xs px-3.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-200">MedStock AI Copilot</span>
          </div>
        </div>
      )}

      {/* Floating Circular Button */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open MedStock AI Assistant"
        className={`group relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-teal-400/30
                   border-2 border-cyan-400/60 transition-all duration-300 ease-out cursor-pointer
                   shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:shadow-[0_0_36px_rgba(6,182,212,0.75)]
                   hover:border-cyan-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyan-500/30
                   ${isOpen && !isMinimized ? 'ring-2 ring-cyan-400 scale-95' : ''}`}
      >
        {/* Subtle Ambient Glowing Backdrop */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md -z-10 group-hover:bg-cyan-400/30 transition-colors" />

        {/* Circular Robot Avatar Image */}
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center">
          <img
            src="/ai-robot.png"
            alt="MedStock AI Bot"
            className="w-full h-full object-cover rounded-full select-none"
            onError={(e) => {
              // Graceful fallback if image path needs asset resolver
              e.target.onerror = null
              e.target.src = '/ai-robot.png'
            }}
          />
        </div>

        {/* Green Online Indicator with Pulse Animation */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900 shadow-sm" />
        </span>
      </button>
    </div>
  )
}
