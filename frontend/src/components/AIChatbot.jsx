import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bot, ExternalLink, MessageCircle, Minus, RotateCcw,
  Send, Sparkles, X
} from 'lucide-react'
import { aiAPI } from '../api/services'

const initialMessage = {
  id: 1,
  role: 'assistant',
  content: 'Hi! I am your MediStock assistant. Ask me about stock risks, expiry dates, reorders, sales, or suppliers.'
}

const quickPrompts = [
  { label: 'Stock risk', query: 'Which medicines have stockout risk?' },
  { label: 'Expiring soon', query: 'Which batches are expiring soon?' },
  { label: 'Reorder advice', query: 'What should I reorder?' },
  { label: 'Today\'s sales', query: 'Show me today\'s sales summary' },
]

const routeSuggestions = {
  '/inventory': 'What is the current stockout risk?',
  '/medicines': 'Which medicines need to be reordered?',
  '/alerts': 'Summarize the most urgent alerts',
  '/sales': 'Give me a sales summary',
  '/suppliers': 'Which supplier has the fastest fulfilment?',
}

const pageTasks = [
  { path: '/dashboard', label: 'Dashboard', terms: ['dashboard', 'home', 'overview'] },
  { path: '/medicines', label: 'Medicines', terms: ['medicine', 'medicines', 'drug', 'drugs', 'catalogue', 'catalog'] },
  { path: '/inventory', label: 'Inventory', terms: ['inventory', 'stock', 'warehouse'] },
  { path: '/stock-tracking', label: 'Stock Tracking', terms: ['stock tracking', 'stock movement', 'fefo'] },
  { path: '/prescriptions', label: 'Prescriptions', terms: ['prescription', 'prescriptions', 'rx', 'dispensing'] },
  { path: '/patients', label: 'Patients', terms: ['patient', 'patients'] },
  { path: '/doctors', label: 'Doctors', terms: ['doctor', 'doctors', 'physician'] },
  { path: '/suppliers', label: 'Suppliers', terms: ['supplier', 'suppliers', 'vendor', 'vendors'] },
  { path: '/purchases', label: 'Purchases', terms: ['purchase', 'purchases', 'purchase order', 'procurement'] },
  { path: '/sales', label: 'Sales', terms: ['sale', 'sales', 'pos', 'billing', 'revenue'] },
  { path: '/alerts', label: 'Alerts', terms: ['alert', 'alerts', 'warning', 'warnings'] },
  { path: '/reports', label: 'Reports', terms: ['report', 'reports', 'analytics'] },
  { path: '/ai-insights', label: 'AI Insights', terms: ['ai insights', 'insights', 'forecast', 'recommendations'] },
  { path: '/settings', label: 'Settings', terms: ['setting', 'settings', 'preferences'] },
]

function findPageTask(question) {
  const normalized = question.toLowerCase()
  const hasNavigationIntent = /\b(open|show|go to|take me|navigate|view|visit|see|bring up|find)\b/.test(normalized)
  const hasCreationIntent = /\b(add|create|new|register|record|upload)\b/.test(normalized)
  if (!hasNavigationIntent && !hasCreationIntent) return null

  const page = pageTasks.find(item => item.terms.some(term => normalized.includes(term)))
  if (!page) return null
  return {
    path: page.path,
    label: page.label,
    content: hasCreationIntent
      ? `I opened ${page.label}. Complete the form there to create a new record.`
      : `Opening ${page.label} for you now.`
  }
}

function getAnswer(data) {
  return data?.answer || 'I could not find an answer for that yet. Try asking about stock, expiry, reorders, sales, or suppliers.'
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([initialMessage])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const suggestion = routeSuggestions[location.pathname] || quickPrompts[0].query

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const askQuestion = async (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) return

    setMessages(current => [...current, {
      id: Date.now(),
      role: 'user',
      content: trimmedQuestion
    }])
    setDraft('')
    setIsLoading(true)

    const pageTask = findPageTask(trimmedQuestion)
    if (pageTask) {
      navigate(pageTask.path)
      setMessages(current => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        content: pageTask.content,
        action: { label: `Open ${pageTask.label}`, path: pageTask.path }
      }])
      setIsLoading(false)
      return
    }

    try {
      const response = await aiAPI.askAssistant(trimmedQuestion)
      setMessages(current => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        content: getAnswer(response.data),
        type: response.data?.type
      }])
    } catch {
      setMessages(current => [...current, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I cannot reach the MediStock intelligence service right now. You can still use the quick links below while the service is restored.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    askQuestion(draft)
  }

  const clearChat = () => setMessages([initialMessage])

  return (
    <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40">
      {open && (
        <section
          className="absolute right-0 bottom-16 w-[calc(100vw-2rem)] sm:w-[390px] h-[min(620px,calc(100vh-7rem))] flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-[#263247] bg-white dark:bg-[#101622] shadow-2xl animate-slide-up"
          aria-label="MediStock AI assistant"
        >
          <header className="flex items-center justify-between px-4 py-3.5 bg-[#101622] dark:bg-[#101622] text-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white">
                <Bot className="h-5 w-5" />
                <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#101622] bg-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">MediStock Assistant</p>
                <p className="text-[11px] text-slate-400">Inventory intelligence, on demand</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" title="Start a new chat" aria-label="Start a new chat">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" title="Minimize assistant" aria-label="Minimize assistant">
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-[#0C111D]" aria-live="polite">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === 'user'
                  ? 'rounded-br-md bg-orange-500 text-white'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-[#263247] dark:bg-[#17202E] dark:text-slate-200'}`}>
                  {message.content}
                  {message.action && (
                    <button onClick={() => navigate(message.action.path)} className="mt-2 flex items-center gap-1.5 border-t border-current/10 pt-2 text-xs font-bold text-orange-500 hover:text-orange-600 dark:text-orange-400">
                      {message.action.label} <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  {message.type && message.type !== 'GENERAL_INFO' && (
                    <p className="mt-2 border-t border-current/10 pt-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {message.type.replaceAll('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-[#263247] dark:bg-[#17202E]">
                  <span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:240ms]" /></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-[#263247] dark:bg-[#101622]">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {quickPrompts.map(prompt => (
                <button key={prompt.label} onClick={() => askQuestion(prompt.query)} disabled={isLoading} className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:border-orange-300 hover:text-orange-600 disabled:opacity-50 dark:border-[#2B394E] dark:text-slate-300 dark:hover:border-orange-500 dark:hover:text-orange-400">
                  {prompt.label}
                </button>
              ))}
            </div>
            <button onClick={() => askQuestion(suggestion)} className="mb-2 flex w-full items-center gap-1.5 text-left text-[11px] text-slate-500 hover:text-orange-500 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-500" />
              <span className="truncate">Try: {suggestion}</span>
            </button>
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSubmit(event) } }} rows="1" placeholder="Ask about your pharmacy..." className="form-input max-h-24 min-h-[42px] resize-none py-2.5 text-sm" aria-label="Ask MediStock assistant" />
              <button type="submit" disabled={!draft.trim() || isLoading} className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-400">AI suggestions support decisions; verify critical dispensing actions.</p>
          </div>
        </section>
      )}

      <button onClick={() => setOpen(current => !current)} className="group flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-[#0C111D]" aria-label={open ? 'Close MediStock assistant' : 'Open MediStock assistant'}>
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] font-bold dark:border-[#0C111D]">AI</span>}
      </button>
    </div>
  )
}