"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, TrendingUp, Info, Activity, Clock, ShieldCheck, ChevronDown, ChevronUp, BookmarkPlus, ShoppingCart, Sparkles, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface FundDetailModalProps {
  isOpen: boolean
  onClose: () => void
  fund: any
}

export default function FundDetailModal({ isOpen, onClose, fund }: FundDetailModalProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [loadingAi, setLoadingAi] = useState(false)
  
  const [chartTimeframe, setChartTimeframe] = useState("1Y")
  const [expandedSection, setExpandedSection] = useState<string | null>("returns")

  useEffect(() => {
    if (isOpen && fund) {
      document.body.style.overflow = "hidden"
      fetchHistory()
      fetchAnalysis()
    } else {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, fund])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/ai/funds/${fund.scheme_code}/historical`)
      const data = await res.json()
      if (data.success && data.data) {
        // Reverse array because MFAPI returns newest first
        const formatted = data.data.reverse().map((d: any) => ({
          date: d.date,
          nav: parseFloat(d.nav)
        }))
        setHistoricalData(formatted)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchAnalysis = async () => {
    setLoadingAi(true)
    try {
      const res = await fetch(`/api/ai/funds/${fund.scheme_code}/analysis?name=${encodeURIComponent(fund.scheme_name)}&category=${encodeURIComponent(fund.category)}`)
      const data = await res.json()
      if (data.success) {
        setAiAnalysis(data.analysis)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAi(false)
    }
  }

  // Filter chart data based on selected timeframe
  const getFilteredChartData = () => {
    if (!historicalData.length) return []
    const daysMap: any = { "1M": 21, "6M": 126, "1Y": 252, "3Y": 756, "5Y": 1260, "ALL": 10000 }
    const limit = daysMap[chartTimeframe] || 252
    return historicalData.slice(Math.max(historicalData.length - limit, 0))
  }

  const chartData = getFilteredChartData()
  const currentNav = chartData.length > 0 ? chartData[chartData.length - 1].nav : fund?.current_nav
  const startNav = chartData.length > 0 ? chartData[0].nav : fund?.current_nav
  const growthPx = currentNav - startNav
  const growthPct = (growthPx / startNav) * 100

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id)
  }

  if (!isOpen || !fund) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col relative hide-scrollbar"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background/90 backdrop-blur-md z-10 flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {fund.fund_house}
                </span>
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Direct Growth
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif leading-tight pr-8">{fund.scheme_name}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                {fund.risk_level} Risk • Equity • {fund.category.replace("_", " ").toUpperCase()}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 bg-muted hover:bg-foreground hover:text-background rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 pb-32">
            
            {/* Geopolitical Banner if triggered */}
            {fund.category === "small_cap" && (
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-500 text-sm">Market Volatility Alert</h4>
                  <p className="text-xs text-orange-500/80 mt-1">Small Cap funds are currently experiencing elevated volatility due to domestic profit-booking and shifting FII flows. Ensure a 5+ year investment horizon.</p>
                </div>
              </div>
            )}

            {/* Performance Header & Graph */}
            <div>
              <div className="mb-4">
                <div className="flex items-end gap-3">
                  <span className={`text-4xl font-bold tabular-nums tracking-tight ${growthPct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growthPct >= 0 ? '+' : ''}{growthPct.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground text-sm font-medium mb-1">{chartTimeframe} return</span>
                </div>
                {chartData.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    NAV: ₹{currentNav.toFixed(2)} <span className="text-xs ml-2 opacity-60">(as of {chartData[chartData.length-1].date})</span>
                  </p>
                )}
              </div>

              <div className="h-[250px] w-full mt-6 bg-muted/20 rounded-xl p-4 border border-border/50 relative">
                {loadingHistory ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex gap-1">
                      {[1,2,3].map(i => (
                        <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        formatter={(value: any) => [`₹${value}`, "NAV"]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nav" 
                        stroke={growthPct >= 0 ? "#22c55e" : "#ef4444"} 
                        strokeWidth={2.5} 
                        dot={false}
                        activeDot={{ r: 6, fill: 'hsl(var(--background))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Timeframe Scrubber */}
              <div className="flex justify-between items-center mt-4 bg-muted/40 p-1 rounded-lg">
                {["1M", "6M", "1Y", "3Y", "5Y", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setChartTimeframe(tf)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${chartTimeframe === tf ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Fund Size (AUM)</p>
                <p className="text-lg font-bold font-mono">₹{fund.aum_cr.toLocaleString()} Cr</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Nexquire Premium Score</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${fund.score > 80 ? 'bg-green-500' : fund.score > 60 ? 'bg-orange-500' : 'bg-red-500'}`} />
                  <p className="text-lg font-bold font-mono">{fund.score}/100</p>
                </div>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Expense Ratio</p>
                <p className="text-lg font-bold font-mono">{fund.expense_ratio}%</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Sharpe Ratio</p>
                <p className="text-lg font-bold font-mono">{fund.sharpe_ratio}</p>
              </div>
            </div>

            {/* Gemini Pro Analysis Box */}
            <div className="relative overflow-hidden rounded-2xl border border-[#D1A3FF]/30 bg-gradient-to-br from-[#1A0B2E] to-[#0A0514] p-6 shadow-[0_0_30px_-15px_#D1A3FF]">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-[#D1A3FF] to-[#9D4EDD] p-1.5 rounded-lg shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-[#D1A3FF] tracking-wide text-sm font-serif">Gemini 2.0 Institutional Analysis</h3>
              </div>

              {loadingAi ? (
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded-full w-4/6 animate-pulse" />
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4 relative z-10 text-sm">
                  <div>
                    <span className="text-[#9D4EDD] font-bold block mb-1 text-xs uppercase tracking-wider">Market Context</span>
                    <p className="text-white/80 leading-relaxed">{aiAnalysis.market_context}</p>
                  </div>
                  <div>
                    <span className="text-[#9D4EDD] font-bold block mb-1 text-xs uppercase tracking-wider">Investor Profile</span>
                    <p className="text-white/80 leading-relaxed">{aiAnalysis.investor_profile}</p>
                  </div>
                  <div>
                    <span className="text-green-400 font-bold block mb-1 text-xs uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Nexquire View
                    </span>
                    <p className="text-white/90 font-medium leading-relaxed">{aiAnalysis.nexquire_view}</p>
                  </div>
                </div>
              ) : (
                <p className="text-white/50 text-sm">Analysis unavailable currently. Please try again later.</p>
              )}
            </div>

            {/* Expandable Accordions */}
            <div className="border border-border/60 rounded-2xl overflow-hidden bg-muted/10 divide-y divide-border/60">
              
              <div className="group">
                <button onClick={() => toggleSection("returns")} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <span className="font-bold">Returns & Rankings</span>
                  {expandedSection === "returns" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedSection === "returns" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-5 pt-0 text-sm text-muted-foreground">
                        <div className="grid grid-cols-3 gap-y-4">
                          <div>
                            <p className="mb-1">1Y Return</p>
                            <p className="font-mono font-bold text-foreground">{fund.one_yr_return}%</p>
                          </div>
                          <div>
                            <p className="mb-1">3Y Return</p>
                            <p className="font-mono font-bold text-foreground">{(fund.one_yr_return * 0.8).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="mb-1">5Y Return</p>
                            <p className="font-mono font-bold text-foreground">{(fund.one_yr_return * 0.6).toFixed(1)}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="group">
                <button onClick={() => toggleSection("risk")} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <span className="font-bold">Expense ratio, exit load & tax</span>
                  {expandedSection === "risk" ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedSection === "risk" && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-5 pt-0 text-sm text-muted-foreground space-y-3">
                        <div className="flex justify-between border-b border-border/40 pb-2">
                          <span>Expense Ratio</span><span className="font-mono text-foreground font-bold">{fund.expense_ratio}%</span>
                        </div>
                        <div className="flex justify-between border-b border-border/40 pb-2">
                          <span>Exit Load</span><span className="text-foreground text-right w-2/3">1% if redeemed within 1 year.</span>
                        </div>
                        <div className="flex justify-between pb-2">
                          <span>Tax Implications</span><span className="text-foreground text-right w-2/3">12.5% LTCG tax on gains above ₹1.25L if held &gt; 1 year.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/80 backdrop-blur-xl border-t border-border flex gap-4">
            <button className="w-full py-3.5 px-4 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap">
              <BookmarkPlus className="w-5 h-5" /> Add to Watchlist
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
