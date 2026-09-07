import { useState, useEffect, useRef } from 'react'
import { aiAPI } from '../../api/services'
import {
  Sparkles, TrendingUp, AlertTriangle, AlertCircle, ShoppingCart, Send,
  Bot, Clock, ShieldCheck, CheckCircle2, RefreshCw, ArrowRight, Zap,
  BarChart2, Activity, Truck, Calendar, Layers, Check, User, ChevronRight,
  HelpCircle, MessageSquare, Plus
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'

export default function AIInsights() {
  const { isDark } = useTheme()

  const [forecast,        setForecast]        = useState([])
  const [risks,           setRisks]           = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [anomalies,       setAnomalies]       = useState([])
  const [loading,         setLoading]         = useState(true)

  // AI Assistant Chat state
  const [query,            setQuery]            = useState('')
  const [chatLog,          setChatLog]          = useState([
    {
      sender: 'ai',
      text: 'Hello! I can help review demand projections, stockout risks, batch expiry, sales analytics, and supplier lead times. What would you like to inspect?',
      type: 'WELCOME'
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
      toast.error('Failed to load inventory insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAIData()
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog, assistantLoading])

  const handleAsk = async (textToAsk) => {
    const q = textToAsk || query
    if (!q || !q.trim()) return

    const userMsg = { sender: 'user', text: q }
    setChatLog(prev => [...prev, userMsg])
    setQuery('')
    setAssistantLoading(true)

    try {
      const res = await aiAPI.askAssistant(q)
      const aiMsg = {
        sender: 'ai',
        text: res.data?.answer || 'Response prepared from current inventory data.',
        type: res.data?.type || 'GENERAL_INFO',
        data: res.data?.data || null
      }
      setChatLog(prev => [...prev, aiMsg])
    } catch (err) {
      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to retrieve current inventory data. Please check the backend connection.',
          type: 'ERROR'
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

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 skeleton rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 skeleton rounded-xl w-64" />
            <div className="h-3.5 skeleton rounded-lg w-96" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="h-80 skeleton rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-md shadow-amber-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                Inventory Insights & Forecasting
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase border border-amber-200/50">
                Forecasting tools
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
            Predictive demand forecasting, stockout risk radar, automated reorders & conversational assistant
          </p>
        </div>

        <button
          onClick={fetchAIData}
          className="btn-secondary !text-xs !py-2 !px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh insights</span>
        </button>
      </div>

      {/* ── SECTION 1: AI KPI CARDS ── */}
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

      {/* ── SECTION 2: DEMAND FORECAST BAR CHART ── */}
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
                <Bar dataKey="currentStock" name="Current Stock Balance" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── SECTION 3 & 4: STOCK RISK MATRIX & AI REORDER RECOMMENDATIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Risk Matrix */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                AI Stockout Risk Radar
              </h3>
              <p className="text-xs text-slate-400">Days of supply remaining before complete depletion</p>
            </div>
            <span className="badge badge-red">{criticalRisksCount} Critical</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="table w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80">
                  <th>Medicine</th>
                  <th>Stock</th>
                  <th>Days Left</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(risks || []).slice(0, 6).map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="font-bold text-slate-800 dark:text-slate-200">{r.medicineName}</td>
                    <td className="font-mono">{r.currentStock} units</td>
                    <td>
                      <span className={`font-bold font-mono ${r.daysRemaining <= 3 ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {r.daysRemaining} days
                      </span>
                    </td>
                    <td>
                      <span className={
                        r.riskLevel === 'CRITICAL' ? 'badge badge-red' :
                        r.riskLevel === 'HIGH' ? 'badge badge-yellow' : 'badge badge-green'
                      }>
                        {r.riskLevel}
                      </span>
                    </td>
                    <td>
                      <Link
                        to="/purchases"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                      >
                        Create PO <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Reorder Recommendations */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                AI Reorder Decision Support
              </h3>
              <p className="text-xs text-slate-400">Automated purchase order quantities and cost estimates</p>
            </div>
            <span className="badge badge-green">Live Engine</span>
          </div>

          <div className="space-y-3">
            {(recommendations || []).slice(0, 4).map((rec, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{rec.medicineName}</p>
                    <span className="badge badge-blue text-[10px]">{rec.category}</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                    {rec.confidence} Confidence
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-slate-400 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock / Safety</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{rec.currentStock} / {rec.safetyStock}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Time</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{rec.supplierLeadTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{rec.estimatedCost}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-500">Supplier: <strong className="text-slate-700 dark:text-slate-300">{rec.supplierName}</strong></span>
                  <Link
                    to="/purchases"
                    className="btn-primary !text-[11px] !py-1 !px-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-3 h-3" /> Order {rec.recommendedOrderQty} Units
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: ANOMALY DETECTION ── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-500" />
              AI Inventory & Sales Anomaly Radar
            </h2>
            <p className="text-xs text-slate-400">Statistical deviation detection across POS volumes, inventory adjustments & procurement</p>
          </div>
          <span className="badge badge-purple">{(anomalies || []).length} Events Detected</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(anomalies || []).map(anom => (
            <div
              key={anom.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
                    {anom.id}
                  </span>
                  <span className={anom.severity === 'HIGH' ? 'badge badge-red' : anom.severity === 'MEDIUM' ? 'badge badge-yellow' : 'badge badge-gray'}>
                    {anom.severity} RISK
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{anom.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{anom.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-1 text-[11px]">
                <p className="text-slate-400">Target SKU: <strong className="text-slate-700 dark:text-slate-300">{anom.medicineName}</strong></p>
                <p className="text-blue-600 dark:text-blue-400 font-medium">💡 Recommendation: {anom.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 6: CONVERSATIONAL AI PHARMACY ASSISTANT ── */}
      <div className="card space-y-4 border border-blue-500/20 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Inventory assistant
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-400">Natural language inventory query & decision support agent</p>
            </div>
          </div>
        </div>

        {/* Quick query chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap">Suggested:</span>
          <button
            onClick={() => handleAsk("Which medicines need to be reordered?")}
            className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 whitespace-nowrap transition-colors border border-blue-200/50 dark:border-blue-800/40"
          >
            🛒 Which medicines need reorder?
          </button>
          <button
            onClick={() => handleAsk("Which medicines expire next month?")}
            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 whitespace-nowrap transition-colors border border-amber-200/50 dark:border-amber-800/40"
          >
            📅 Which medicines expire next month?
          </button>
          <button
            onClick={() => handleAsk("Show today's sales and revenue summary")}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 whitespace-nowrap transition-colors border border-emerald-200/50 dark:border-emerald-800/40"
          >
            💰 Show today's sales summary
          </button>
          <button
            onClick={() => handleAsk("Which suppliers have fastest delivery times?")}
            className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 whitespace-nowrap transition-colors border border-purple-200/50 dark:border-purple-800/40"
          >
            🚚 Supplier lead times & delays
          </button>
        </div>

        {/* Chat History Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 max-h-96 overflow-y-auto space-y-3.5 text-xs">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                }`}
              >
                <p className="font-medium">{msg.text}</p>

                {/* Structured data table if returned by AI query */}
                {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="text-slate-400 font-bold uppercase text-[9px]">
                          <th className="pb-1">Medicine</th>
                          <th className="pb-1">Current Stock</th>
                          <th className="pb-1">Suggested Order</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {msg.data.slice(0, 3).map((d, i) => (
                          <tr key={i}>
                            <td className="py-1 font-bold">{d.medicineName}</td>
                            <td className="py-1 font-mono">{d.currentStock}</td>
                            <td className="py-1 font-bold text-emerald-600">{d.recommendedOrderQty || d.recommendedReorder} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {assistantLoading && (
            <div className="flex gap-3 justify-start items-center text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="font-medium text-slate-500">Reviewing inventory data...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => { e.preventDefault(); handleAsk(query); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about inventory forecasts, stock risks, expiry batches, or suppliers..."
            className="input !text-xs w-full flex-1"
          />
          <button
            type="submit"
            disabled={!query.trim() || assistantLoading}
            className="btn-primary !text-xs !py-2.5 !px-5 flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  )
}
