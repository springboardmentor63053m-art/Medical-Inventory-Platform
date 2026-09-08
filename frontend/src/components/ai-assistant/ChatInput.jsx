import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [text])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!text.trim() || isLoading) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="p-3 bg-slate-900/95 border-t border-slate-800/90 select-none">
      <div className="relative flex items-end gap-2 bg-slate-950/80 border border-slate-800 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/30 rounded-2xl p-2 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-28 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none scrollbar-thin px-2 py-1"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-cyan-950/40
                     active:scale-95 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Footer Mode Pill */}
      <div className="flex items-center justify-between mt-2 px-1 text-[10.5px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Universal AI • MedStock Connected</span>
        </span>
        <span className="hidden sm:inline text-slate-500">
          Enter to send • Shift + Enter for new line
        </span>
      </div>
    </div>
  )
}
