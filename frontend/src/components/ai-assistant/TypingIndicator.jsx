export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 animate-fade-in my-2">
      {/* Small Bot Avatar */}
      <div className="w-7 h-7 rounded-full p-[1px] bg-gradient-to-tr from-cyan-400 to-blue-500 flex-shrink-0 shadow-sm">
        <img
          src="/ai-robot.png"
          alt="AI Bot"
          className="w-full h-full object-cover rounded-full bg-slate-950"
        />
      </div>

      {/* Bubble with bouncing dots */}
      <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-slate-700/60 shadow-md flex items-center gap-2">
        <span className="text-xs font-medium text-cyan-300">
          MedStock AI is thinking
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
        </div>
      </div>
    </div>
  )
}
