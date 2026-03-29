"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, FileText, Plus, Trash2, Search as SearchIcon,
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck,
  Activity, Zap, Clock, IndianRupee, Loader2, AlertCircle,
  ChevronRight, Target, BarChart2, Shield, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { toast } from "sonner"

const DEMO_PORTFOLIO = [
  { fund_name: "HDFC Top 100 Fund Regular Growth", scheme_code: "119598", units: 245.67, amount_invested: 120000, purchase_date: "2022-01-15", category: "Large Cap" },
  { fund_name: "Axis Bluechip Fund Regular Growth", scheme_code: "120465", units: 198.43, amount_invested: 80000, purchase_date: "2022-03-10", category: "Large Cap" },
  { fund_name: "SBI Small Cap Fund Direct Growth", scheme_code: "125497", units: 89.21, amount_invested: 60000, purchase_date: "2021-06-20", category: "Small Cap" },
  { fund_name: "Mirae Asset Emerging Bluechip Regular", scheme_code: "118989", units: 312.54, amount_invested: 50000, purchase_date: "2022-08-01", category: "Mid Cap" },
  { fund_name: "ICICI Pru Value Discovery Fund Regular", scheme_code: "120701", units: 156.78, amount_invested: 40000, purchase_date: "2023-02-14", category: "Value" }
]

const loadingMessages = [
  "Reading holdings...",
  "Fetching live NAVs from MFAPI...",
  "Calculating XIRR...",
  "Analysing fund overlap...",
  "Running stress simulations...",
  "Consulting Gemini AI...",
  "Compiling audit report..."
]

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  HIGH:   { color: "#ef4444", bg: "#fef2f2", label: "HIGH" },
  MEDIUM: { color: "#f59e0b", bg: "#fffbeb", label: "MED" },
  LOW:    { color: "#6366f1", bg: "#eef2ff", label: "LOW" },
}

export default function PortfolioXRayView() {
  const [tab, setTab] = useState<'upload' | 'manual' | 'analysis'>('upload')
  const [holdings, setHoldings] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [liveValuation, setLiveValuation] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => setLoadingMsgIdx(p => (p + 1) % loadingMessages.length), 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const triggerLiveValuation = useCallback(async (h: any[]) => {
    if (!h.length) return
    try { setLiveValuation(await api.liveValuation(h)) }
    catch (e) { console.error(e) }
  }, [])

  useEffect(() => {
    if (holdings.length && tab === 'analysis') {
      const t = setInterval(() => triggerLiveValuation(holdings), 5 * 60 * 1000)
      return () => clearInterval(t)
    }
  }, [holdings, tab, triggerLiveValuation])

  const runAnalysis = async (h: any[]) => {
    setLoading(true)
    try {
      const val = await api.liveValuation(h)
      setLiveValuation(val)
      const res = await api.analyzePortfolio(val.holdings, { age: 32 })
      setAnalysis(res)
      setTab('analysis')
    } catch (e: any) {
      toast.error("Analysis failed: " + e.message)
    } finally { setLoading(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true)
    try {
      const data = await api.uploadCams(file)
      if (data.success) { setHoldings(data.holdings); toast.success(`Parsed ${data.count} funds`); await runAnalysis(data.holdings) }
    } catch (e: any) { toast.error(e.message || "Failed to parse PDF") }
    finally { setLoading(false) }
  }

  const handleSearch = async (val: string) => {
    setSearchQuery(val)
    if (val.length < 3) { setSearchResults([]); return }
    setIsSearching(true)
    try { const d = await api.searchFund(val); setSearchResults(d.results || []) }
    catch (e) { console.error(e) }
    finally { setIsSearching(false) }
  }

  const addFund = (fund: any) => {
    setHoldings([...holdings, { fund_name: fund.schemeName, scheme_code: fund.schemeCode, units: 0, amount_invested: 0, purchase_date: new Date().toISOString().split('T')[0], category: "Equity" }])
    setSearchQuery(""); setSearchResults([])
  }

  const updateHolding = (idx: number, field: string, value: any) => {
    const u = [...holdings]; u[idx] = { ...u[idx], [field]: value }; setHoldings(u)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10">
        <div className="relative w-20 h-20">
          <motion.div className="absolute inset-0 rounded-full border-2 border-indigo-200" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent"
            animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart2 className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <AnimatePresence mode="wait">
            <motion.p key={loadingMsgIdx}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-lg font-semibold tracking-tight text-gray-900"
            >{loadingMessages[loadingMsgIdx]}</motion.p>
          </AnimatePresence>
          <p className="text-sm text-gray-400 font-medium">AI Audit Engine · Gemini 2.0 Flash</p>
        </div>
        <div className="flex gap-1.5">
          {loadingMessages.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === loadingMsgIdx ? "w-6 bg-indigo-600" : "w-1.5 bg-gray-200"}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ─── Header Bar ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Portfolio X-Ray</h1>
          <p className="text-sm text-gray-500 mt-0.5">Institutional AI Audit · Powered by Gemini 2.0 Flash</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden w-fit bg-gray-50 p-1">
        {(['upload', 'manual', 'analysis'] as const).map(t => (
          <button key={t}
            onClick={() => {
              if (t === 'analysis' && !analysis) { toast.error("Run analysis first"); return }
              setTab(t)
            }}
            className={`px-6 py-2.5 text-xs font-semibold tracking-widest uppercase transition-all rounded-lg ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === 'upload' ? 'Statement Upload' : t === 'manual' ? 'Manual Entry' : 'Audit Report'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ═══════════════════════════════════════════════════
            UPLOAD TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'upload' && (
          <motion.div key="upload"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-5 gap-6">
              {/* Drop Zone */}
              <div className="md:col-span-3 relative border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-5 hover:border-gray-900 hover:bg-gray-50/60 transition-all cursor-pointer group">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center group-hover:bg-gray-900 transition-all">
                  <Upload className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-900 text-base">Drop CAMS / KFintech statement</p>
                  <p className="text-sm text-gray-400">or click to browse · PDF up to 15 MB</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Encrypted · Never Stored</span>
                </div>
              </div>

              {/* How-to Guide */}
              <div className="md:col-span-2 bg-gray-900 rounded-2xl p-8 text-white space-y-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">Get Your Statement</span>
                </div>
                <div className="space-y-5">
                  {[
                    { n: "01", title: "Go to camsonline.com", sub: "Click 'Statement' → CAS (Consolidated)" },
                    { n: "02", title: "Request CAS Summary", sub: "Select All AMCs, All time periods" },
                    { n: "03", title: "Upload PDF here", sub: "Instant analysis across 40+ AMCs" }
                  ].map(s => (
                    <div key={s.n} className="flex gap-4 items-start">
                      <span className="text-xs font-bold text-indigo-400 font-mono mt-0.5 w-5 shrink-0">{s.n}</span>
                      <div>
                        <p className="text-sm font-semibold">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Demo Portfolio */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-8 py-5">
              <div>
                <p className="text-sm font-semibold text-gray-700">No statement available?</p>
                <p className="text-xs text-gray-400 mt-0.5">Load a sample portfolio with real allocation traps and fund overlap.</p>
              </div>
              <button
                onClick={async () => { setHoldings(DEMO_PORTFOLIO); await runAnalysis(DEMO_PORTFOLIO) }}
                className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-all shadow-sm"
              >
                <Zap className="w-4 h-4" />
                Load Demo Portfolio
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            MANUAL ENTRY TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'manual' && (
          <motion.div key="manual"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
          >
            {/* Totals bar */}
            <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-6 py-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Invested</span>
              <span className="text-2xl font-bold font-mono tabular-nums">
                ₹{holdings.reduce((a, h) => a + (Number(h.amount_invested) || 0), 0).toLocaleString()}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
              </div>
              <Input
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search 1,500+ funds (e.g. Parag Parikh Flexi Cap)..."
                className="h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm font-medium"
              />
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  >
                    {searchResults.map((r: any) => (
                      <div key={r.schemeCode} onClick={() => addFund(r)}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 group"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.schemeName}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{r.schemeCode}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Holdings Table */}
            {holdings.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left pl-5 pr-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Fund</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Units</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-widest">Invested (₹)</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {holdings.map((h, idx) => (
                      <motion.tr key={idx} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="pl-5 pr-3 py-3.5">
                          <p className="font-medium text-gray-900 leading-tight">{h.fund_name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{h.scheme_code}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <input type="number" value={h.units}
                            onChange={e => updateHolding(idx, "units", parseFloat(e.target.value))}
                            className="w-24 text-right font-mono text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <input type="number" value={h.amount_invested}
                            onChange={e => updateHolding(idx, "amount_invested", parseFloat(e.target.value))}
                            className="w-28 text-right font-mono text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                        <td className="pr-3 py-3.5">
                          <button onClick={() => setHoldings(holdings.filter((_, i) => i !== idx))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {holdings.length > 0 && (
              <button onClick={() => runAnalysis(holdings)}
                className="w-full py-3.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <BarChart2 className="w-4 h-4" />
                Run Portfolio Audit
              </button>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════
            ANALYSIS / AUDIT REPORT TAB
        ═══════════════════════════════════════════════════ */}
        {tab === 'analysis' && analysis && (
          <motion.div key="analysis"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="space-y-6 pb-16"
          >
            {/* ── Command Bar ── */}
            <div className="sticky top-0 z-50 bg-gray-900 rounded-xl px-5 py-3.5 flex items-center justify-between border border-gray-800 shadow-xl">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Portfolio Value</p>
                  <p className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                    ₹{(liveValuation?.total_current || analysis?.portfolio?.total_current || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-700" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Return</p>
                  <p className={`text-base font-bold font-mono mt-0.5 ${(analysis?.portfolio?.total_gain_loss || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(analysis?.portfolio?.total_gain_loss || 0) >= 0 ? "+" : ""}{analysis?.portfolio?.total_return_pct || 0}%
                  </p>
                </div>
                <div className="w-px h-8 bg-gray-700" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">XIRR</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">{analysis.portfolio.xirr}%</p>
                </div>
                <div className="w-px h-8 bg-gray-700" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Grade</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: analysis.ai_analysis.grade_color }}>
                    {analysis.ai_analysis.grade}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-gray-500 font-medium">NAV Live</span>
                </div>
                <button
                  onClick={() => triggerLiveValuation(holdings)}
                  className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw className="w-3 h-3" />Refresh
                </button>
              </div>
            </div>

            {/* ── Bento Grid: Hero Metrics ── */}
            <div className="grid grid-cols-12 gap-4">
              {/* Grade */}
              <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
                  style={{ borderColor: analysis.ai_analysis.grade_color + "40", background: analysis.ai_analysis.grade_color + "10" }}>
                  <span className="text-4xl font-black" style={{ color: analysis.ai_analysis.grade_color }}>
                    {analysis.ai_analysis.grade}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Audit Grade</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">{analysis.ai_analysis.grade_reason}</p>
                </div>
              </div>

              {/* XIRR + Alpha */}
              <div className="col-span-5 bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">XIRR</p>
                  <p className="text-4xl font-bold font-mono tabular-nums text-gray-900">{analysis.portfolio.xirr}%</p>
                  <p className="text-xs text-gray-400">True Annualised Return</p>
                </div>
                <div className="space-y-1.5 border-l border-gray-100 pl-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Alpha vs Nifty</p>
                  <p className={`text-4xl font-bold font-mono tabular-nums ${analysis.portfolio.beating_nifty ? "text-emerald-600" : "text-red-500"}`}>
                    {analysis.portfolio.beating_nifty ? "+" : "-"}{Math.abs(analysis.portfolio.xirr - analysis.portfolio.nifty_benchmark).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400">Nifty 1Y: {analysis.portfolio.nifty_benchmark}%</p>
                </div>
              </div>

              {/* Holdings + Allocation */}
              <div className="col-span-4 bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Holdings</p>
                  <span className="text-2xl font-bold font-mono text-gray-900">{analysis.portfolio.holdings_count}</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(analysis.allocation).slice(0,4).map(([cat, pct]: any) => (
                    <div key={cat} className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-indigo-500 rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-mono text-gray-500 w-12 text-right">{pct}%</span>
                      <span className="text-xs text-gray-400 w-20 truncate">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── AI Verdict Panel ── */}
            <div className="bg-gray-900 rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                    <Zap className="w-4.5 h-4.5 text-white w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Gemini AI Verdict</span>
                      <span className="text-xs text-gray-600">· Institutional AI Audit</span>
                    </div>
                    <p className="text-gray-100 text-base font-semibold leading-relaxed">{analysis.ai_analysis.overall_verdict}</p>
                  </div>
                </div>
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-5 py-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1.5">The One Thing To Do Now</p>
                  <p className="text-white font-semibold text-sm">"{analysis.ai_analysis.the_one_thing}"</p>
                </div>
              </div>
            </div>

            {/* ── Problems & Recommendations ── */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Audit Findings */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-bold text-gray-900">Audit Findings</h3>
                  </div>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-100">
                    {analysis.problems.length} Issues
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {analysis.problems.map((p: any, i: number) => {
                    const sev = SEVERITY_CONFIG[p.severity] || SEVERITY_CONFIG.LOW
                    return (
                      <div key={i} className="flex gap-4 px-5 py-4 hover:bg-gray-50/70 transition-colors group">
                        <div className="flex flex-col items-center pt-0.5 gap-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{ color: sev.color, background: sev.bg }}>
                            {sev.label}
                          </span>
                          <div className="w-px flex-1 bg-gray-100" />
                        </div>
                        <div className="flex-1 pb-1">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{p.fund}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{p.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-red-500">{p.rupee_impact}</span>
                            <span className="text-xs text-gray-400 group-hover:text-indigo-600 transition-colors font-medium">{p.action?.slice(0, 30)}… →</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold text-gray-900">Recommendations</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                    High Impact
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {analysis.ai_analysis.top_recommendations.map((r: any) => (
                    <div key={r.rank} className="px-5 py-4 hover:bg-gray-50/70 transition-colors group">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {r.rank}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{r.action}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-1">{r.expected_benefit}</p>
                          <p className="text-xs text-gray-400 mt-1 italic leading-relaxed">{r.how_to}</p>
                          <div className="flex items-center justify-between mt-2.5">
                            <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-lg">
                              {r.effort}
                            </span>
                            <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Execute <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Overlap Analysis ── */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Duplicated Stocks */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Top Duplicated Stocks</h3>
                  <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    analysis.overlap.verdict?.includes('HIGH')
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                    {analysis.overlap.verdict?.split('-')[0]?.trim()} Overlap
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {analysis.overlap.most_duplicated_stocks.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                          {s.stock.slice(0,2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{s.stock}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {s.appears_in} funds
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlap Pairs */}
              <div className="bg-gray-900 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-bold text-white">Worst Overlap Pairs</h3>
                </div>
                <div className="px-5 py-2 divide-y divide-gray-800">
                  {analysis.overlap.overlap_pairs.length > 0 ? (
                    analysis.overlap.overlap_pairs.map((p: any, i: number) => (
                      <div key={i} className="py-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-semibold text-gray-300 leading-snug truncate">{p.fund1}</p>
                            <p className="text-xs text-gray-600 uppercase font-bold">+ {p.fund2?.slice(0,30)}…</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold font-mono text-red-400">{p.overlap_pct}%</p>
                            <p className="text-xs text-gray-600">overlap</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 italic">Common: {p.common_stocks?.join(', ')}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center gap-3 opacity-40">
                      <ShieldCheck className="w-10 h-10 text-white" />
                      <p className="text-xs font-bold text-white uppercase tracking-widest">No critical overlap detected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Stress Test Risk Matrix ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Stress Test · Risk Matrix</h3>
                <p className="text-xs text-gray-400">Simulated portfolio loss under 4 crash scenarios</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysis.stress_test).map(([key, s]: any) => (
                  <div key={key} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 hover:border-gray-300 hover:shadow-sm transition-all">
                    <p className="text-xs font-semibold text-gray-500 leading-snug h-8 flex items-start">{s.scenario}</p>
                    <div>
                      <p className={`text-2xl font-bold font-mono tabular-nums ${s.estimated_loss >= 0 ? "text-red-500" : "text-emerald-500"}`}>
                        {s.estimated_loss >= 0 ? "−" : "+"}₹{Math.abs(s.estimated_loss).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Estimated impact</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className={`h-full rounded-full ${s.portfolio_impact_pct > 15 ? "bg-red-400" : "bg-amber-400"}`}
                            initial={{ width: 0 }} whileInView={{ width: `${Math.min(s.portfolio_impact_pct, 100)}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-xs font-bold font-mono text-gray-600">{s.portfolio_impact_pct}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-50 pt-3">{s.recovery_outlook}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Strategic Alternatives Table ── */}
            {analysis.ai_analysis.better_alternatives?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Strategic Alternatives</h3>
                  <span className="text-xs text-gray-400">· AI-recommended fund switches</span>
                </div>
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">Current Fund</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">Recommended Switch</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">Rationale</th>
                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {analysis.ai_analysis.better_alternatives.map((a: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/60 transition-colors group">
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900 leading-snug">{a.current_fund}</p>
                            <span className="text-xs bg-red-50 text-red-600 border border-red-100 font-bold px-2 py-0.5 rounded-md mt-1.5 inline-block">Underperformer</span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-emerald-700 leading-snug flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 shrink-0" />{a.suggested_fund}
                            </p>
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <p className="text-xs text-gray-500 leading-relaxed italic">{a.reason}</p>
                            <p className="text-xs font-semibold text-emerald-600 mt-1">{a.expected_improvement}</p>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all">
                              Switch →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Tax Opportunities ── */}
            {analysis.tax_opportunities?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Tax Harvesting Opportunities</h3>
                  <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold px-2.5 py-1 rounded-lg">
                    {analysis.tax_opportunities.length} Eligible
                  </span>
                </div>
                <div className="space-y-3">
                  {analysis.tax_opportunities.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.fund}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.days_held} days held · {t.action}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600 font-mono">₹{(t.tax_saving || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Tax saving</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
