import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Sparkles, Mic } from 'lucide-react'

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
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
    <div className="p-3.5 bg-[#071022]/98 border-t border-slate-800/90 select-none">
      <div className="relative flex items-end gap-2 bg-[#050b18] border border-cyan-900/60 focus-within:border-cyan-400/80 focus-within:ring-1 focus-within:ring-cyan-500/30 rounded-2xl p-2.5 transition-all shadow-inner">
        {/* Attachment icon */}
        <button
          type="button"
          onClick={() => alert('Document analysis attachment feature is ready.')}
          title="Attach report or document"
          className="p-1.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors flex-shrink-0"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your pharmacy..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-32 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none scrollbar-thin px-2 py-1"
        />

        {/* Prominent Circular Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-bold flex items-center justify-center
                     disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all
                     shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0"
        >
          <Send className="w-4 h-4 text-white fill-current translate-x-0.5" />
        </button>
      </div>

      {/* Sub-label */}
      <div className="flex items-center justify-between mt-2 px-1 text-[10.5px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-400 font-medium">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>MedStock Clinical AI • Telemetry Synced</span>
        </span>
        <span className="hidden sm:inline text-slate-500">
          Enter ↵ to send • Shift + Enter for new line
        </span>
      </div>
    </div>
  )
}
