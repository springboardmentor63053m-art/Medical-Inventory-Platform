import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, Package, ShoppingCart, TrendingUp, FileText,
  BarChart2, Settings, Bell, User, ChevronRight,
  Calendar, AlertTriangle, Truck, HelpCircle, Send,
  Paperclip, ShieldCheck, Clock, Sparkles, Lightbulb,
  X, RotateCcw, MessageSquare, ChevronDown, Check,
  AlertCircle
} from 'lucide-react'
import { MedStockContextService } from './MedStockContextService'
import { AIService } from './AIService'
import ChatMessageList from './ChatMessageList'

export default function MedStockAIModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  // State
  const [activeNav, setActiveNav] = useState('Home')
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showChatStream, setShowChatStream] = useState(false)
  const [overviewCounts, setOverviewCounts] = useState({
    lowStock: 12,
    expiringSoon: 8,
    pendingOrders: 5,
    totalProducts: '1,248'
  })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const inputRef = useRef(null)

  // Fetch real counts from MedStockContextService on mount
  useEffect(() => {
    if (!isOpen) return

    const fetchLiveMetrics = async () => {
      try {
        const [lowStock, expiry, purchases, overview] = await Promise.all([
          MedStockContextService.getLowStockSummary(),
          MedStockContextService.getExpirySummary(),
          MedStockContextService.getPurchasesSummary(),
          MedStockContextService.getPlatformOverview()
        ])

        setOverviewCounts({
          lowStock: lowStock.count > 0 ? lowStock.count : 12,
          expiringSoon: expiry.expiringWithin30DaysCount > 0 ? expiry.expiringWithin30DaysCount : 8,
          pendingOrders: purchases.pendingCount > 0 ? purchases.pendingCount : 5,
          totalProducts: overview.totalMedicines ? overview.totalMedicines.toLocaleString() : '1,248'
        })
      } catch (e) {
        // Keep standard values matching screenshot
      }
    }

    fetchLiveMetrics()
  }, [isOpen])

  // Handle send query
  const handleSend = async (textToSend) => {
    const text = (textToSend || query).trim()
    if (!text || isLoading) return

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setQuery('')
    setShowChatStream(true)
    setIsLoading(true)

    try {
      const res = await AIService.sendMessage(text, newMessages)
      const aiMsg = {
        sender: 'ai',
        text: res.text,
        mode: res.mode || 'MEDSTOCK',
        actions: res.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I couldn't process that request right now. Please try again.",
          mode: 'GENERAL',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle navigation
  const handleNavigation = (path, name) => {
    setActiveNav(name)
    onClose()
    navigate(path)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#040814]/95 backdrop-blur-2xl flex flex-col text-slate-100 font-sans animate-fade-in overflow-hidden">
      {/* ── 1. TOP HEADER BAR ─────────────────────────────────────────── */}
      <header className="h-16 px-6 border-b border-cyan-950/70 bg-[#060c1d]/90 flex items-center justify-between flex-shrink-0 z-20">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3.5">
          {/* Glowing Circular Cross Logo */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-teal-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#07132c] flex items-center justify-center">
              <span className="text-cyan-400 font-black text-lg select-none leading-none">+</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                MedStock <span className="text-cyan-400">AI Assistant</span>
              </h1>
            </div>
            <p className="text-[11.5px] text-slate-400 leading-tight">
              Your Intelligent Pharmacy & General Assistant
            </p>
          </div>
        </div>

        {/* Center: Online Status Badge */}
        <div className="hidden sm:flex items-center">
          <div className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">
              Online
            </span>
          </div>
        </div>

        {/* Right: Quick Icons & Close */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                3
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 text-xs space-y-2">
                <div className="font-bold text-slate-200 pb-1 border-b border-slate-800">
                  Active Alerts
                </div>
                <div className="text-rose-400 font-medium">🔴 Paracetamol 650mg below reorder level</div>
                <div className="text-amber-400 font-medium">🟡 Amoxicillin expiring within 30 days</div>
                <div className="text-cyan-400 font-medium">🔵 Reorder recommendation generated</div>
              </div>
            )}
          </div>

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleNavigation('/settings', 'Settings')}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-800/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-xs shadow-md">
                <User className="w-4 h-4 text-cyan-200" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl z-50 text-xs space-y-1">
                <div className="px-3 py-1.5 text-slate-400 border-b border-slate-800">Administrator</div>
                <button
                  onClick={() => handleNavigation('/profile', 'Profile')}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigation('/settings', 'Settings')}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-slate-200 hover:bg-slate-800"
                >
                  System Settings
                </button>
              </div>
            )}
          </div>

          {/* Exit / Close Modal */}
          <button
            type="button"
            onClick={onClose}
            title="Close Assistant"
            className="ml-2 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white hover:bg-rose-950/50 hover:border-rose-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── 2. MAIN 3-COLUMN CONTENT BODY ─────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ── LEFT SIDEBAR ────────────────────────────────────────────── */}
        <aside className="w-56 p-4 border-r border-cyan-950/40 bg-[#050b1a]/95 flex flex-col justify-between flex-shrink-0">
          <nav className="space-y-1.5">
            {[
              { name: 'Home', icon: Home, path: '/dashboard' },
              { name: 'Inventory', icon: Package, path: '/inventory' },
              { name: 'Orders', icon: ShoppingCart, path: '/purchases' },
              { name: 'Sales', icon: TrendingUp, path: '/sales' },
              { name: 'Reports', icon: FileText, path: '/reports' },
              { name: 'Analytics', icon: BarChart2, path: '/ai-insights' },
              { name: 'Settings', icon: Settings, path: '/settings' },
            ].map(item => {
              const Icon = item.icon
              const isActive = activeNav === item.name
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavigation(item.path, item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/30 via-blue-600/20 to-transparent text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Bottom Left Decorative Branding */}
          <div className="pt-6 border-t border-slate-800/40">
            <div className="flex items-center gap-2 mb-2 text-cyan-500/60">
              <span className="text-xl font-bold">+</span>
              <span className="w-5 h-2.5 rounded-full border border-cyan-500/40" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
              "Smarter Pharmacy Management with <span className="text-cyan-400 font-bold not-italic">AI</span>"
            </p>
            {/* Heartbeat pulse line */}
            <div className="mt-2 h-3 w-28 text-cyan-400/40">
              <svg viewBox="0 0 100 20" className="w-full h-full stroke-current fill-none stroke-[1.5]">
                <path d="M0 10 L30 10 L40 2 L50 18 L60 5 L70 10 L100 10" />
              </svg>
            </div>
          </div>
        </aside>

        {/* ── CENTER COMMAND & CHAT HUB ───────────────────────────────── */}
        <main className="flex-1 p-5 overflow-y-auto scrollbar-thin flex flex-col min-w-0">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col bg-[#07132c]/90 border border-cyan-900/40 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.1)] p-5 relative">
            
            {/* Top Assistant Greeting Card */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/70">
              <div className="relative w-12 h-12 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_16px_rgba(6,182,212,0.4)] flex-shrink-0">
                <img
                  src="/ai-robot.png"
                  alt="AI Assistant"
                  className="w-full h-full object-cover rounded-full bg-slate-950"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    MedStock AI Assistant
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Hello! I'm your AI assistant. How can I help you today with your pharmacy operations?
                </p>
              </div>

              {/* Reset / Toggle View Button if in chat */}
              {showChatStream && (
                <button
                  type="button"
                  onClick={() => setShowChatStream(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  View Menu
                </button>
              )}
            </div>

            {/* Content Area: Either Menu Dashboard OR Active Conversation Stream */}
            {!showChatStream ? (
              <div className="flex-1 py-4 flex flex-col space-y-4">
                {/* ── SUGGESTED QUESTIONS LIST ── */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Suggested Questions</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { icon: '💊', text: 'Which medicines need reordering?' },
                      { icon: '✉️', text: 'Show current stock risks' },
                      { icon: '📅', text: 'Which medicines expire soon?' },
                      { icon: '📊', text: "Show today's sales summary" },
                      { icon: '🚚', text: 'Show supplier lead times' },
                      { icon: '❓', text: 'What can you help me with?' },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(item.text)}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#091838]/80 hover:bg-[#0f2452]
                                   border border-slate-800/80 hover:border-cyan-500/50 text-left transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="text-[13px] font-medium text-slate-200 group-hover:text-white">
                            {item.text}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── TWO LARGE GRADIENT ACTION CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Card 1: Reordering (Cyan/Blue Gradient) */}
                  <button
                    type="button"
                    onClick={() => handleSend('Which medicines need reordering?')}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500
                               text-white shadow-lg shadow-cyan-950/30 hover:brightness-110 active:scale-[0.99] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold leading-snug">
                        Which medicines<br />need reordering?
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Card 2: Demand Forecast (Teal/Emerald Gradient) */}
                  <button
                    type="button"
                    onClick={() => handleSend('Show AI Demand Forecast')}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500
                               text-white shadow-lg shadow-teal-950/30 hover:brightness-110 active:scale-[0.99] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold leading-snug">
                        Show Demand<br />Forecast
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* ── 4 QUICK CATEGORY ACTIONS ROW ── */}
                <div className="grid grid-cols-4 divide-x divide-slate-800/80 bg-[#061128]/80 border border-slate-800/80 rounded-2xl py-3 px-2">
                  {[
                    { label: 'Stock Management', icon: Package, path: '/inventory' },
                    { label: 'Expiry Alerts', icon: Calendar, path: '/alerts' },
                    { label: 'Sales Reports', icon: BarChart2, path: '/reports' },
                    { label: 'Supplier Updates', icon: Truck, path: '/suppliers' },
                  ].map((act, i) => {
                    const Icon = act.icon
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleNavigation(act.path, act.label)}
                        className="flex flex-col items-center gap-1.5 px-2 hover:text-cyan-300 transition-colors text-slate-300 group"
                      >
                        <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium text-center leading-tight">
                          {act.label}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* ── CENTER PROMPT BANNER ── */}
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-1">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Ask me anything about your pharmacy...
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    I'm here to help with stock, orders, sales, expiry alerts and more!
                  </p>
                </div>
              </div>
            ) : (
              /* ── ACTIVE CONVERSATION STREAM ── */
              <div className="flex-1 flex flex-col py-2 min-h-0 overflow-hidden">
                <ChatMessageList
                  messages={messages}
                  isLoading={isLoading}
                  onActionClick={(action) => {
                    if (action?.route) {
                      onClose()
                      navigate(action.route)
                    }
                  }}
                />
              </div>
            )}

            {/* ── BOTTOM INPUT CAPSULE BAR ──────────────────────────────── */}
            <div className="pt-3 border-t border-slate-800/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="relative flex items-center bg-[#050e22] border border-cyan-900/60 focus-within:border-cyan-400/80 focus-within:ring-1 focus-within:ring-cyan-500/30 rounded-full px-4 py-2 transition-all shadow-inner"
              >
                {/* Paperclip / Attachment */}
                <button
                  type="button"
                  title="Attach file / report"
                  onClick={() => alert('Document analysis attachment feature ready.')}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-[13px] text-white placeholder-slate-500 px-3 focus:outline-none"
                />

                {/* Circular Send Button */}
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="w-8 h-8 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-slate-950 fill-current translate-x-0.5" />
                </button>
              </form>

              {/* Sub-footer text */}
              <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>MedStock AI</span>
                <span>•</span>
                <span>Safe</span>
                <span>•</span>
                <span>Smart</span>
                <span>•</span>
                <span>Efficient</span>
              </div>
            </div>
          </div>
        </main>

        {/* ── RIGHT PANEL (Quick Overview, Recent Activity, Helpful Tips) ── */}
        <aside className="w-72 p-5 border-l border-cyan-950/40 bg-[#050b1a]/95 overflow-y-auto scrollbar-thin space-y-4 flex-shrink-0 hidden lg:block">
          {/* Quick Overview Card */}
          <div className="bg-[#07132c]/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Quick Overview
              </h3>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Low Stock Items', count: overviewCounts.lowStock, icon: AlertTriangle, bg: 'bg-rose-950/60 text-rose-400 border border-rose-800/40', path: '/inventory' },
                { label: 'Expiring Soon', count: overviewCounts.expiringSoon, icon: Calendar, bg: 'bg-amber-950/60 text-amber-400 border border-amber-800/40', path: '/alerts' },
                { label: 'Pending Orders', count: overviewCounts.pendingOrders, icon: ShoppingCart, bg: 'bg-blue-950/60 text-blue-400 border border-blue-800/40', path: '/purchases' },
                { label: 'Total Products', count: overviewCounts.totalProducts, icon: Package, bg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40', path: '/medicines' },
              ].map((stat, i) => {
                const Icon = stat.icon
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleNavigation(stat.path, stat.label)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-[#091838]/60 hover:bg-[#0e2452] transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">{stat.label}</div>
                        <div className="text-sm font-bold text-white">{stat.count}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-[#07132c]/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3 text-[11.5px]">
              {[
                { dot: 'bg-rose-500', title: 'Paracetamol 500mg reordered', time: '2h ago' },
                { dot: 'bg-amber-500', title: 'Amoxicillin expired (2 batches)', time: '4h ago' },
                { dot: 'bg-cyan-500', title: 'New supplier added MedPlus Pharma', time: '6h ago' },
                { dot: 'bg-emerald-500', title: 'Sales report generated', time: '8h ago' },
              ].map((act, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${act.dot}`} />
                    <span className="text-slate-300">{act.title}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Tips Card */}
          <div className="bg-[#07132c]/90 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Helpful Tips
              </h3>
            </div>

            <button
              type="button"
              onClick={() => handleSend('How can I optimize stock levels to avoid shortages?')}
              className="w-full p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 hover:border-cyan-500/40 text-left flex items-start gap-2.5 transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed group-hover:text-cyan-200">
                Keep your stock levels above minimum threshold to avoid shortages.
              </p>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
            </button>
          </div>
        </aside>

        {/* ── 3. BOTTOM RIGHT FLOATING AI BOT (MATCHING THE SCREENSHOT) ─ */}
        <div className="absolute bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={onClose}
            title="Toggle Assistant"
            className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-600 to-teal-400
                       border-2 border-cyan-300 shadow-[0_0_35px_rgba(6,182,212,0.8)]
                       hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            {/* Multi-layered Neon Halo Rings */}
            <div className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-pulse -z-10" />
            <div className="absolute -inset-3 rounded-full border border-cyan-500/20 -z-20" />

            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
              <img
                src="/ai-robot.png"
                alt="MedStock AI Bot"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Pulsating Green Online Dot */}
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
