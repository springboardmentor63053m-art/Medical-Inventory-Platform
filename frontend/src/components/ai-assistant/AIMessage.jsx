import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Package, Clock, AlertTriangle, BarChart2,
  Receipt, Truck, AlertCircle, Zap, Sparkles, TrendingUp,
  Copy, Check, ChevronRight, HelpCircle
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
  HelpCircle
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
    if (action.prompt || action.query) {
      if (onActionClick) {
        onActionClick(action)
      }
      return
    }
    if (action.route) {
      if (onActionClick) {
        onActionClick(action)
      }
      navigate(action.route)
    }
  }

  // Format bold, inline code, and status badges
  const formatInlineStyles = (text) => {
    if (!text) return ''

    // Priority badge highlighting
    if (typeof text === 'string') {
      if (text.includes('🔴 Critical') || text.includes('🔴 CRITICAL')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-[11.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Critical
          </span>
        )
      }
      if (text.includes('🟠 Reorder now') || text.includes('🟠 HIGH RISK')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-[11.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Reorder now
          </span>
        )
      }
      if (text.includes('🟡 Low stock') || text.includes('🟡 WARNING') || text.includes('🟡 MONITOR')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Low stock
          </span>
        )
      }
      if (text.includes('🔵 Below threshold') || text.includes('🔵 INFO')) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-[11.5px]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Below threshold
          </span>
        )
      }
    }

    // Split by code, bold
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
          <strong key={i} className="font-semibold text-white">
            {boldText}
          </strong>
        )
      }
      return part
    })
  }

  // Markdown parser with Table, Code block, List & Heading support
  const renderFormattedText = (raw) => {
    if (!raw) return null

    const lines = raw.split('\n')
    const elements = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]

      // 1. Code block
      if (line.trim().startsWith('```')) {
        const lang = line.trim().slice(3).trim()
        const codeLines = []
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        i++ // consume closing ```
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-2xl bg-slate-950/95 border border-slate-800 p-3.5 overflow-x-auto text-[11.5px] font-mono text-cyan-300 shadow-inner">
            {lang && (
              <div className="text-[9.5px] uppercase tracking-wider text-slate-500 font-bold mb-2 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                <span>{lang}</span>
                <span className="text-slate-600">ReadOnly</span>
              </div>
            )}
            <pre className="m-0 whitespace-pre-wrap leading-relaxed">{codeLines.join('\n')}</pre>
          </div>
        )
        continue
      }

      // 2. Markdown Table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines = []
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }

        if (tableLines.length >= 2) {
          const parseRow = (r) => r.split('|').slice(1, -1).map(c => c.trim())
          const headerCells = parseRow(tableLines[0])
          const bodyRows = tableLines.slice(2).map(parseRow)

          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-2xl border border-slate-800 bg-[#071024] shadow-md">
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                <thead className="bg-[#0b1836] text-cyan-300 font-bold">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 text-[11.5px] tracking-wide font-semibold text-cyan-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-slate-900/30 hover:bg-slate-800/40' : 'hover:bg-slate-800/40'}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 text-slate-200 text-[12px] align-middle">
                          {formatInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
          continue
        }
      }

      // 3. Heading 2 (##)
      if (line.startsWith('## ')) {
        elements.push(
          <h4 key={`h2-${i}`} className="text-xs font-bold uppercase tracking-wider text-cyan-400 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-3.5 rounded-full bg-cyan-400" />
            <span>{line.replace('## ', '')}</span>
          </h4>
        )
        i++
        continue
      }

      // 4. Heading 3 (###)
      if (line.startsWith('### ')) {
        elements.push(
          <h5 key={`h3-${i}`} className="text-[13px] font-bold text-white mt-3 mb-1.5">
            {line.replace('### ', '')}
          </h5>
        )
        i++
        continue
      }

      // 5. Horizontal rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${i}`} className="my-3 border-slate-800" />)
        i++
        continue
      }

      // 6. Bullet lists
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2)
        elements.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-slate-200 text-[13px] leading-relaxed my-1 marker:text-cyan-400">
            {formatInlineStyles(bulletText)}
          </li>
        )
        i++
        continue
      }

      // 7. Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const numText = line.trim().replace(/^\d+\.\s/, '')
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2 my-1.5 text-[13px] text-slate-200 leading-relaxed">
            <span className="text-[11.5px] font-bold text-cyan-400 min-w-[18px]">{line.trim().match(/^\d+\./)[0]}</span>
            <div>{formatInlineStyles(numText)}</div>
          </div>
        )
        i++
        continue
      }

      // 8. Highlighted item lines (e.g. 🔴 Paracetamol 650mg — 45 units remaining — Critical)
      if (line.trim().startsWith('🔴') || line.trim().startsWith('🟠') || line.trim().startsWith('🟡') || line.trim().startsWith('🔵') || line.trim().startsWith('🟢')) {
        const dot = line.trim().slice(0, 2)
        const content = line.trim().slice(2).trim()
        const parts = content.split('—').map(p => p.trim())

        elements.push(
          <div key={`badge-item-${i}`} className="my-2 p-3 rounded-xl bg-[#09152b] border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{dot}</span>
              <span className="text-[13px] font-bold text-white">{parts[0]}</span>
              {parts[1] && <span className="text-xs text-slate-400">({parts[1]})</span>}
            </div>
            {parts[2] && (
              <div>
                {formatInlineStyles(`${dot} ${parts[2]}`)}
              </div>
            )}
          </div>
        )
        i++
        continue
      }

      // 9. Regular paragraph / empty line
      if (line.trim() === '') {
        elements.push(<div key={`sp-${i}`} className="h-1.5" />)
      } else {
        elements.push(
          <p key={`p-${i}`} className="text-slate-200 text-[13px] leading-relaxed my-1">
            {formatInlineStyles(line)}
          </p>
        )
      }

      i++
    }

    return elements
  }

  const timeStr = message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-start gap-3 mb-5 animate-fade-in group">
      {/* Bot Avatar */}
      <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-teal-400 flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)] mt-0.5">
        <img
          src="/ai-robot.png"
          alt="MedStock AI Bot"
          className="w-full h-full object-cover rounded-full bg-slate-950"
        />
      </div>

      {/* Message Content Bubble */}
      <div className="max-w-[92%] min-w-0 flex-1">
        <div className="relative px-4 py-3.5 rounded-2xl rounded-tl-sm bg-[#0a1428] border border-cyan-900/40 shadow-xl shadow-black/30 text-slate-200">
          {/* Top Metadata Header */}
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                MedStock AI
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                message.mode === 'MEDSTOCK'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              }`}>
                {message.mode === 'MEDSTOCK' ? '🏥 Pharmacy Copilot' : '🌐 Universal Engine'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy response"
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
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

          {/* Formatted Markdown Body */}
          <div className="prose prose-invert max-w-none text-slate-200 select-text">
            {renderFormattedText(message.text)}
          </div>

          {/* Action Buttons */}
          {Array.isArray(message.actions) && message.actions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              {message.actions.map((act, i) => {
                const IconComponent = ACTION_ICONS[act.icon] || ChevronRight
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAction(act)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30
                               hover:from-blue-600/50 hover:to-cyan-600/50 border border-cyan-500/40 hover:border-cyan-400
                               text-cyan-200 hover:text-white text-[12px] font-semibold transition-all duration-200
                               shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95 cursor-pointer"
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
        <span className="text-[10.5px] text-slate-500 mt-1 ml-1.5 block">
          {timeStr}
        </span>
      </div>
    </div>
  )
}
