import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Package, Clock, AlertTriangle, BarChart2,
  Receipt, Truck, AlertCircle, Zap, Sparkles, TrendingUp,
  Copy, Check, ChevronRight
} from 'lucide-react'

// Icon map for dynamic action buttons
const ACTION_ICONS = {
  ShoppingCart,
  Package,
  Clock,
  AlertTriangle,
  BarChart2,
  Receipt,
  Truck,
  AlertCircle,
  Zap,
  Sparkles,
  TrendingUp,
}

export default function AIMessage({ message, onActionClick }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!message.text) return
    navigator.clipboard.writeText(message.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAction = (action) => {
    if (onActionClick) {
      onActionClick(action)
    }
    if (action.route) {
      navigate(action.route)
    }
  }

  // Basic markdown parser for clean enterprise formatting
  const renderFormattedText = (raw) => {
    if (!raw) return null

    const lines = raw.split('\n')
    const elements = []
    let inCodeBlock = false
    let codeLanguage = ''
    let codeBuffer = []

    lines.forEach((line, index) => {
      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true
          codeLanguage = line.trim().slice(3).trim()
          codeBuffer = []
        } else {
          inCodeBlock = false
          elements.push(
            <div key={`code-${index}`} className="my-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 overflow-x-auto text-[11.5px] font-mono text-cyan-300">
              {codeLanguage && (
                <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 pb-1 border-b border-slate-800/80">
                  {codeLanguage}
                </div>
              )}
              <pre className="m-0 whitespace-pre-wrap">{codeBuffer.join('\n')}</pre>
            </div>
          )
        }
        return
      }

      if (inCodeBlock) {
        codeBuffer.push(line)
        return
      }

      // Heading 2
      if (line.startsWith('## ')) {
        elements.push(
          <h4 key={index} className="text-xs font-bold uppercase tracking-wider text-cyan-400 mt-3.5 mb-1.5 flex items-center gap-1.5">
            <span className="w-1 h-3 rounded-full bg-cyan-400" />
            {line.replace('## ', '')}
          </h4>
        )
        return
      }

      // Heading 3
      if (line.startsWith('### ')) {
        elements.push(
          <h5 key={index} className="text-[12.5px] font-semibold text-slate-200 mt-2.5 mb-1">
            {line.replace('### ', '')}
          </h5>
        )
        return
      }

      // Horizontal Rule
      if (line.trim() === '---') {
        elements.push(<hr key={index} className="my-2.5 border-slate-800/80" />)
        return
      }

      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2)
        elements.push(
          <li key={index} className="ml-4 list-disc text-slate-300 text-[12.5px] leading-relaxed my-0.5 marker:text-cyan-400">
            {formatInlineStyles(bulletText)}
          </li>
        )
        return
      }

      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        const numText = line.trim().replace(/^\d+\.\s/, '')
        elements.push(
          <div key={index} className="flex items-start gap-2 my-1 text-[12.5px] text-slate-300 leading-relaxed">
            <span className="text-[11px] font-bold text-cyan-400/80 mt-0.5">{line.trim().match(/^\d+\./)[0]}</span>
            <span>{formatInlineStyles(numText)}</span>
          </div>
        )
        return
      }

      // Regular paragraph or empty line
      if (line.trim() === '') {
        elements.push(<div key={index} className="h-1.5" />)
      } else {
        elements.push(
          <p key={index} className="text-slate-300 text-[12.5px] leading-relaxed my-1">
            {formatInlineStyles(line)}
          </p>
        )
      }
    })

    return elements
  }

  // Format bold (**text**), inline code (`code`), and status badges (🔴, 🟡, 🟢)
  const formatInlineStyles = (text) => {
    if (!text) return ''

    // Split by inline code
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] font-mono mx-0.5">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return (
          <strong key={i} className="font-semibold text-slate-100">
            {boldText}
          </strong>
        )
      }
      return part
    })
  }

  const timeStr = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-start gap-2.5 mb-4 animate-fade-in group">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-teal-400 flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)] mt-0.5">
        <img
          src="/ai-robot.png"
          alt="AI Bot"
          className="w-full h-full object-cover rounded-full bg-slate-950"
        />
      </div>

      {/* Message Content Bubble */}
      <div className="max-w-[88%] min-w-0">
        <div className="relative px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900/90 border border-slate-800 shadow-lg shadow-black/20 text-slate-200">
          {/* Top meta: Mode indicator + copy action */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              message.mode === 'MEDSTOCK'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            }`}>
              {message.mode === 'MEDSTOCK' ? '🏥 MedStock Context' : '🌐 General AI'}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy response"
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Formatted Text Body */}
          <div className="prose prose-invert max-w-none text-slate-300 select-text">
            {renderFormattedText(message.text)}
          </div>

          {/* Optional Action Buttons */}
          {Array.isArray(message.actions) && message.actions.length > 0 && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2">
              {message.actions.map((act, i) => {
                const IconComponent = ACTION_ICONS[act.icon] || ChevronRight
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAction(act)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30
                               hover:from-blue-600/50 hover:to-cyan-600/50 border border-cyan-500/40 hover:border-cyan-400
                               text-cyan-200 hover:text-white text-[11.5px] font-semibold transition-all duration-200
                               shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{act.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 mt-1 ml-1 block">
          {timeStr}
        </span>
      </div>
    </div>
  )
}
