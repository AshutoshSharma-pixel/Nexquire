"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Search, ArrowUpRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import FundDetailModal from "@/components/modals/FundDetailModal"

const categoryMapping: Record<string, string> = {
  "Small Cap": "small_cap",
  "Mid Cap": "mid_cap",
  "Large Cap": "large_cap",
  "Flexi Cap": "flexi_cap",
  "ELSS": "elss",
  "Debt": "debt",
  "Index": "index",
  "Gold & Silver": "gold_silver",
  "Commodities": "commodities"
}

const loadingMessages = [
  "Scanning 44 AMCs...",
  "Calculating real-time returns...",
  "Running Gemini AI analysis...",
  "Ranking top performers...",
  "Almost ready..."
]

export default function FundScreenerView() {
  const [selectedCategory, setSelectedCategory] = useState("Large Cap")
  const [timeframe, setTimeframe] = useState("1Y")
  const [funds, setFunds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const [selectedFund, setSelectedFund] = useState<any>(null)

  const categories = ["Small Cap", "Mid Cap", "Large Cap", "Flexi Cap", "ELSS", "Debt", "Index", "Gold & Silver", "Commodities"]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  const fetchFunds = async (cat: string, tf: string, retryCount = 0) => {
    setIsLoading(true)
    setError(null)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      const backendCat = categoryMapping[cat] || "large_cap"
      const data = await api.getFunds(backendCat, tf)
      
      clearTimeout(timeoutId)

      if (data.success && data.funds) {
        const mappedFunds = data.funds.map((f: any, idx: number) => ({
          ...f,
          name: f.scheme_name,
          fund_house: f.fund_house,
          score: f.score,
          period_return: f.period_return ?? f.one_yr_return ?? f.tf_return ?? f.cagr_1y ?? 0,
          expense: f.expense_ratio ?? f.expense ?? 0,
          sharpe: f.sharpe_ratio ?? f.sharpe ?? 0,
          aum: f.aum_cr ?? f.aum ?? 0,
          tags: [f.risk_level, ...(f.ai_reason ? [f.ai_reason] : [])],
          flags: f.risk_flags || [],
          rank: idx + 1,
          color: idx === 0 ? "#000000" : idx < 3 ? "#444444" : "#888888"
        }))
        setFunds(mappedFunds)
        setIsLoading(false)
      } else {
        throw new Error(data.error || "Failed to fetch funds")
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || retryCount < 2) {
        setError("Backend is warming up. Retrying...")
        setTimeout(() => fetchFunds(cat, tf, retryCount + 1), 3000)
      } else {
        setError("Unable to scan AMCs at this moment. Please try again later.")
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchFunds(selectedCategory, timeframe)
  }, [selectedCategory, timeframe])

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-[#000] leading-tight flex items-center gap-4">
            Fund Screener
          </h2>
          <p className="text-[#999] text-xs mt-1 font-medium italic">
            Mutual Fund NAVs update once daily at 9:00 PM IST per SEBI regulations · Prices & ETFs update every 60s
          </p>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-muted-foreground text-sm font-bold">Ranked across 1,500+ funds from all 44 AMCs.</p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/10 border border-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">Synced: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <div className="flex bg-[#F5F5F5] p-1 rounded-xl border border-[#E8E8E8]">
              {["1M", "1Y", "3Y", "5Y"].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    timeframe === tf ? "bg-primary text-white" : "text-[#666] hover:text-[#000]"
                  }`}
                >
                  {tf}
                </button>
              ))}
           </div>
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-[500px]">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat ? "bg-[#000] text-white shadow-lg shadow-black/20" : "bg-white text-[#666] border border-[#EEEEEE] hover:border-[#000]"
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>
      </header>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
               <div className="flex items-center gap-3">
                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 <span className="text-2xl font-black tracking-tight">{loadingMessages[msgIndex]}</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full opacity-20 pointer-events-none">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="h-48 rounded-3xl bg-muted border border-border animate-pulse" />
                 ))}
               </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
               <p className="text-red-500 font-bold">{error}</p>
               <Button onClick={() => fetchFunds(selectedCategory, timeframe)} className="font-bold rounded-xl">Retry Scan</Button>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {funds.map((fund, idx) => (
                fund.rank && (
                  <motion.div
                    key={fund.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedFund(fund)}
                    className="group relative cursor-pointer"
                  >
                    <div className="bg-white rounded-3xl border border-[#F0F0F0] p-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center text-xl font-black text-gray-900 shadow-sm overflow-hidden">
                             {fund.fund_house?.slice(0, 2).toUpperCase() || "MF"}
                          </div>
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-[#999] uppercase mb-1 block">RANK #{fund.rank}</span>
                            <h3 className="font-bold text-[#000] text-sm leading-tight max-w-[180px] truncate">{fund.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-black ${fund.period_return >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {fund.period_return > 0 ? '+' : ''}{fund.period_return.toFixed(2)}%
                          </div>
                          <span className="text-[9px] font-bold text-[#999] uppercase tracking-wider">{timeframe} Return</span>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                        <div className="flex flex-col">
                          <span style={{ fontSize: 9, color: '#999', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Risk Value</span>
                          <span style={{ color: fund.risk_level?.includes('High') ? '#ef4444' : '#10b981', fontSize: 16, fontWeight: 800 }}>
                            {fund.risk_level}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span style={{ fontSize: 9, color: '#999', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expense</span>
                          <span style={{ color: '#000', fontSize: 16, fontWeight: 800 }}>
                            {(fund.expense || 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span style={{ fontSize: 9, color: '#999', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sharpe</span>
                          <span style={{ color: '#000', fontSize: 16, fontWeight: 800 }}>
                            {(fund.sharpe || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span style={{ fontSize: 9, color: '#999', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AUM</span>
                          <span style={{ color: '#000', fontSize: 16, fontWeight: 800 }}>
                            ₹{(fund.aum || 0).toLocaleString('en-IN')} Cr
                          </span>
                        </div>
                      </div>

                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        border: '3px solid #F0F0F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#000' }}>{fund.score}</span>
                        <div style={{
                          position: 'absolute',
                          bottom: -15,
                          fontSize: 8,
                          fontWeight: 900,
                          color: '#999',
                          textTransform: 'uppercase'
                        }}>Score</div>
                      </div>

                      <div className="text-muted-foreground/30 group-hover:text-primary transition-colors">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FundDetailModal 
        isOpen={selectedFund !== null} 
        onClose={() => setSelectedFund(null)} 
        fund={selectedFund} 
      />
    </div>
  )
}
