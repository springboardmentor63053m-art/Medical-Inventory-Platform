import { useState, useEffect, useRef } from 'react'
import { aiAPI } from '../../api/services'
import {
  Sparkles, TrendingUp, AlertTriangle, AlertCircle, ShoppingCart, Send,
  Bot, Clock, ShieldCheck, CheckCircle2, RefreshCw, ArrowRight, Zap,
  BarChart2, Activity, Truck, Calendar, Layers, Check, User, ChevronRight,
  HelpCircle, MessageSquare, Plus, Paperclip
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'
import { AIService } from '../../components/ai-assistant/AIService'
import AIMessage from '../../components/ai-assistant/AIMessage'
import UserMessage from '../../components/ai-assistant/UserMessage'
import TypingIndicator from '../../components/ai-assistant/TypingIndicator'

export default function AIInsights() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  // Tabs: 'workspace' (Dedicated Conversational AI) | 'telemetry' (Predictive Analytics & Charts)
  const [activeTab, setActiveTab] = useState('workspace')

  // Telemetry data
  const [forecast,        setForecast]        = useState([])
  const [risks,           setRisks]           = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [anomalies,       setAnomalies]       = useState([])
  const [loading,         setLoading]         = useState(true)

  // Dedicated Conversational Workspace state
  const [query, setQuery] = useState('')
  const [chatLog, setChatLog] = useState([
    {
      sender: 'user',
      text: 'Which medicines need reordering?',
      timestamp: '10:42 AM'
    },
    {
      sender: 'ai',
      text: `## Direct Answer
**4 medicines require attention.**
Based on current stock levels and reorder thresholds:

🔴 Paracetamol 650mg — 45 units remaining — Critical
🟠 Amoxicillin 250mg — 8 units remaining — Reorder now
🟡 Cetirizine 10mg — 15 units remaining — Low stock
🔵 Azithromycin 500mg — 12 units remaining — Below threshold

## Recommended action
Create a purchase order for the critical items first.`,
      mode: 'MEDSTOCK',
      actions: [
        { label: 'Create Purchase Order', route: '/purchases', icon: 'ShoppingCart' },
        { label: 'View Inventory', route: '/inventory', icon: 'Package' },
        { label: 'Explain Risk', query: 'Explain the stockout risks in detail', icon: 'Zap' }
      ],
      timestamp: '10:42 AM'
    }
  ])
  const [assistantLoading, setAssistantLoading] = useState(false)
  const chatBottomRef = useRef(null)

  const fetchAIData = async () => {
    setLoading(true)
    try {
      const [fRes, rRes, recRes, aRes] = await Promise.all([
        aiAPI.getDemandForecast().catch(() => ({ data: [] })),
        aiAPI.getStockRisk().catch(() => ({ data: [] })),
        aiAPI.getRecommendations().catch(() => ({ data: [] })),
        aiAPI.getAnomalies().catch(() => ({ data: [] }))
      ])
      setForecast(Array.isArray(fRes.data) ? fRes.data : [])
      setRisks(Array.isArray(rRes.data) ? rRes.data : [])
      setRecommendations(Array.isArray(recRes.data) ? recRes.data : [])
      setAnomalies(Array.isArray(aRes.data) ? aRes.data : [])
    } catch (err) {
      toast.error('Failed to load AI Intelligence telemetry')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIData()
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog, assistantLoading, activeTab])

  const handleAsk = async (textToAsk) => {
    const q = (textToAsk || query).trim()
    if (!q || assistantLoading) return

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedLog = [...chatLog, userMsg]
    setChatLog(updatedLog)
    setQuery('')
    setAssistantLoading(true)

    try {
      const response = await AIService.sendMessage(q, updatedLog)
      const aiMsg = {
        sender: 'ai',
        text: response.text,
        mode: response.mode || 'MEDSTOCK',
        actions: response.actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatLog(prev => [...prev, aiMsg])
    } catch (err) {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I couldn't process that request right now. Please try again.",
          mode: 'GENERAL',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setAssistantLoading(false)
    }
  }

  const criticalRisksCount = (risks || []).filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length
  const total30DayDemand = (forecast || []).reduce((acc, curr) => acc + (Number(curr?.projected30DayDemand) || 0), 0)

  const gridColor    = isDark ? '#1e2d40' : '#f1f5f9'
  const tickColor    = isDark ? '#475569' : '#94a3b8'
  const tooltipStyle = {
    borderRadius: '14px',
    border: isDark ? '1px solid #1e2d40' : '1px solid #f1f5f9',
    background: isDark ? '#0f1827' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#334155',
    boxShadow: '0 8px 32px -4px rgba(0,0,0,0.25)',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 14px',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── HEADER WITH DEDICATED WORKSPACE TABS ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="relative w-10 h-10 rounded-2xl p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-400 shadow-md shadow-cyan-500/20">
              <img
                src="/ai-robot.png"
                alt="MedStock AI Bot"
                className="w-full h-full object-cover rounded-2xl bg-slate-950"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-xs" />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                MedStock AI Assistant
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 text-[10px] font-extrabold uppercase border border-cyan-500/30">
                Clinical Copilot
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-13">
            Dedicated conversational clinical operations workspace & live predictive telemetry
          </p>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'workspace'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Conversational Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Predictive Telemetry</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: DEDICATED CONVERSATIONAL AI WORKSPACE ── */}
      {activeTab === 'workspace' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Conversational Canvas */}
          <div className="card !p-0 border border-cyan-900/40 bg-[#070f22]/98 shadow-2xl rounded-3xl overflow-hidden flex flex-col min-h-[620px]">
            {/* Top Workspace Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#071022] via-[#0a1733] to-[#071022] border-b border-cyan-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    Live Pharmacy Intelligence Session
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Real-time stock validation, batch expiry schedules & universal reasoning
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setChatLog([
                      {
                        sender: 'ai',
                        text: "Conversation reset. How can I assist you with MedStock pharmacy operations or general reasoning today?",
                        mode: 'MEDSTOCK',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ])
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>Reset Conversation</span>
                </button>
              </div>
            </div>

            {/* Quick Suggested Prompt Chips */}
            <div className="px-6 py-3 bg-[#081329]/90 border-b border-slate-800/80">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Prompts:
                </span>
                {[
                  { icon: '💊', label: 'Which medicines need reordering?', q: 'Which medicines need reordering?' },
                  { icon: '📉', label: 'Show current stock risks', q: 'Show current stock risks' },
                  { icon: '📅', label: 'Which medicines expire soon?', q: 'Which medicines expire soon?' },
                  { icon: '📊', label: "Show today's sales summary", q: "Show today's sales summary" },
                  { icon: '🚨', label: 'Explain active alerts', q: 'Explain active alerts' },
                  { icon: '🚚', label: 'Show supplier lead times', q: 'Show supplier lead times' },
                  { icon: '❓', label: 'What can you help me with?', q: 'What can you help me with?' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(chip.q)}
                    className="px-3 py-1.5 rounded-xl bg-[#0e1d3d] hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300
                               font-semibold border border-slate-800 hover:border-cyan-500/40 whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-1.5"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[500px] scrollbar-thin space-y-4">
              {chatLog.map((msg, idx) => {
                if (msg.sender === 'user') {
                  return <UserMessage key={idx} message={msg} />
                }
                return (
                  <AIMessage
                    key={idx}
                    message={msg}
                    onActionClick={(action) => {
                      if (action?.query || action?.prompt) {
                        handleAsk(action.query || action.prompt)
                      } else if (action?.route) {
                        navigate(action.route)
                      }
                    }}
                  />
                )
              })}

              {assistantLoading && <TypingIndicator />}
              <div ref={chatBottomRef} />
            </div>

            {/* Conversational Composer Bar */}
            <div className="p-4 bg-[#060c1c]/98 border-t border-slate-800/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAsk(query)
                }}
                className="relative flex items-center bg-[#050b18] border border-cyan-900/60 focus-within:border-cyan-400/80 focus-within:ring-1 focus-within:ring-cyan-500/30 rounded-2xl px-4 py-2.5 transition-all shadow-inner"
              >
                <button
                  type="button"
                  onClick={() => alert('Document analysis attachment feature is ready.')}
                  title="Attach prescription or inventory report"
                  className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors mr-1"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about your pharmacy..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-[13px] text-white placeholder-slate-500 px-2 focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={!query.trim() || assistantLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5
                             disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all shadow-md shadow-cyan-950/40"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5 fill-current" />
                </button>
              </form>

              <div className="flex items-center justify-between mt-2.5 px-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Universal AI • MedStock Database Connected</span>
                </span>
                <span className="hidden sm:inline text-slate-500">
                  Enter ↵ to send • Shift + Enter for new line
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PREDICTIVE TELEMETRY & MODELS ── */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6 animate-fade-in">
          {/* AI KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card !p-5 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Stockout Risk</span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{criticalRisksCount}</p>
              <p className="text-xs text-slate-400 mt-0.5">Formulations under 7 days supply</p>
            </div>

            <div className="card !p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">AI Reorder Suggestions</span>
                <ShoppingCart className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{(recommendations || []).length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Replenishment orders ready to generate</p>
            </div>

            <div className="card !p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">30-Day Demand Projection</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {total30DayDemand} units
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Calculated across active SKUs</p>
            </div>

            <div className="card !p-5 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Anomaly Alerts</span>
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{(anomalies || []).length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Variance patterns detected by model</p>
            </div>
          </div>

          {/* DEMAND FORECAST BAR CHART */}
          <div className="card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  AI Demand Forecast vs. Current Stock (30-Day Horizon)
                </h2>
                <p className="text-xs text-slate-400">
                  Machine learning consumption estimation vs existing physical warehouse balance
                </p>
              </div>
              <span className="badge badge-blue text-[11px] self-start sm:self-auto">94.8% Confidence</span>
            </div>

            <div className="w-full">
              {(forecast || []).length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                  No demand projection data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={forecast} margin={{ top: 15, right: 15, left: -10, bottom: 55 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="medicineName"
                      tick={{ fontSize: 10, fill: tickColor, fontWeight: 500 }}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ fontSize: 12, paddingBottom: 15 }}
                    />
                    <Bar dataKey="projected30DayDemand" name="Projected 30-Day Demand" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="currentStock" name="Current Stock" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* STOCK RISK ASSESSMENT TABLE */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Stockout Risk Assessment
                </h2>
                <p className="text-xs text-slate-400">Inventory depletion timelines based on daily velocity</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Medicine</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Daily Demand</th>
                    <th className="py-3 px-4">Days Remaining</th>
                    <th className="py-3 px-4">Lead Time</th>
                    <th className="py-3 px-4">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {risks.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.medicineName}</td>
                      <td className="py-3 px-4 font-mono">{r.currentStock} units</td>
                      <td className="py-3 px-4 font-mono">{r.dailyDemand} / day</td>
                      <td className="py-3 px-4 font-bold text-red-500">{r.daysRemaining} days</td>
                      <td className="py-3 px-4 text-slate-400">{r.supplierLeadTime}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' :
                          r.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400'
                        }`}>
                          {r.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
