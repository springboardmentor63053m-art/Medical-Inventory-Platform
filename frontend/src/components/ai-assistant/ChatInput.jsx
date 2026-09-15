import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Sparkles, Mic } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ChatInput({ onSend, isLoading, variant = 'universal' }) {
  const { isDark } = useTheme()
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

  const isClinical = variant === 'clinical'

  return (
    <div className={`p-3.5 border-t select-none transition-colors ${
      isDark ? 'bg-[#071022] border-slate-800/90' : 'bg-white border-slate-200'
    }`}>
      <div className={`relative flex items-center gap-2 border rounded-2xl p-2 transition-all shadow-inner ${
        isDark
          ? 'bg-[#050b18] border-slate-800 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/30'
          : 'bg-slate-50 border-slate-300 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30'
      }`}>
        {/* Attachment icon (only shown in clinical mode) */}
        {isClinical && (
          <button
            type="button"
            onClick={() => alert('Document analysis attachment feature is ready.')}
            title="Attach report or document"
            className={`p-1.5 rounded-xl transition-colors flex-shrink-0 cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
                : 'text-slate-400 hover:text-cyan-600 hover:bg-slate-100'
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </button>
        )}

        {/* Textarea / Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isClinical ? "Ask me anything about your pharmacy..." : "Ask me anything..."}
          rows={1}
          disabled={isLoading}
          className={`flex-1 max-h-28 bg-transparent text-xs sm:text-[13px] leading-relaxed resize-none focus:outline-none scrollbar-thin px-2 py-1 ${
            isDark ? 'text-slate-100 placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
          }`}
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={
            isClinical
              ? "w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex-shrink-0 cursor-pointer"
              : "w-8 h-8 rounded-full bg-blue-600/50 hover:bg-blue-600 text-cyan-400 hover:text-white font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all flex-shrink-0 cursor-pointer"
          }
        >
          <Send className="w-3.5 h-3.5 fill-current translate-x-0.5" />
        </button>
      </div>

      {/* Sub-label */}
      <div className={`flex items-center justify-between mt-2 px-1 text-[10.5px] ${
        isDark ? 'text-slate-400' : 'text-slate-500'
      }`}>
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
          <span>
            {isClinical
              ? "MedStock Clinical AI • Telemetry Synced"
              : "Universal AI • MedStock Connected"}
          </span>
        </span>
        <span className="hidden sm:inline opacity-80">
          {isClinical
            ? "Enter ↵ to send • Shift + Enter for new line"
            : "Enter to send • Shift + Enter for new line"}
        </span>
      </div>
    </div>
  )
}
