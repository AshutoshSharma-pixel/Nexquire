"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { Search, SlidersHorizontal, ArrowUpRight, ShieldCheck, Zap, TrendingUp, Trophy, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card" // Re-adding Card/CardContent as they are used in JSX

const categories = ["Small Cap", "Mid Cap", "Large Cap", "Flexi Cap", "ELSS", "Debt", "Index"]

const ScoreBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <span>{label}</span>
      <span style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
)

export default function FundScreener() {
  const [selectedCategory, setSelectedCategory] = useState("Small Cap")

  const funds = [
    {
      name: "Quant Small Cap Fund",
      score: 94,
      cagr: "38.2%",
      sharpe: 2.4,
      expense: "0.64%",
      tags: ["High Alpha", "Momentum"],
      flags: [],
      rank: 1,
      color: "#FFD700" // Gold
    },
    {
      name: "Nippon India Small Cap Fund",
      score: 89,
      cagr: "34.5%",
      sharpe: 2.1,
      expense: "0.72%",
      tags: ["Consistent", "Stable Manager"],
      flags: ["AUM Bloat"],
      rank: 2,
      color: "#C0C0C0" // Silver
    },
    {
      name: "HSBC Small Cap Fund",
      score: 82,
      cagr: "31.2%",
      sharpe: 1.8,
      expense: "0.85%",
      tags: ["Value Orientation"],
      flags: ["Manager Change"],
      rank: 3,
      color: "#CD7F32" // Bronze
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-white">AI Fund Screener</h1>
          <p className="text-muted-foreground mt-1">Scanning 44 AMCs to find your best alpha generators.</p>
        </motion.div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 transition-all text-white" placeholder="Search funds..." />
          </div>
          <Button variant="outline" className="h-12 border-white/10 bg-white/5 text-white rounded-xl px-6 gap-2 hover:bg-white/10">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              selectedCategory === cat 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(45,111,247,0.4)]" 
                : "bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {funds.map((fund, idx) => (
            <motion.div
              key={fund.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              layout
            >
              <Card className="glass border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: fund.color }} />
                <CardContent className="p-8">
                  <div className="flex flex-col xl:flex-row justify-between gap-12">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 text-white" style={{ background: `${fund.color}20`, color: fund.color }}>
                              <Trophy size={24} />
                           </div>
                           <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{fund.name}</h3>
                        </div>
                        <div className="flex gap-2">
                           <Badge className="bg-primary/10 text-primary border-primary/20">Rank #{fund.rank}</Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {fund.tags.map(tag => (
                           <span key={tag} className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                              {tag}
                           </span>
                        ))}
                        {fund.flags.map(flag => (
                          <span key={flag} className="text-[10px] uppercase font-black tracking-[0.1em] text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" /> {flag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                         <ScoreBar label="Portfolio Synergy" value={fund.score} color="#2D6FF7" />
                         <ScoreBar label="Alpha Consistency" value={78} color="#10B981" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-row items-center gap-8 xl:gap-16 border-t xl:border-t-0 xl:border-l border-white/10 pt-8 xl:pt-0 xl:pl-16">
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">3Y CAGR</div>
                        <div className="text-3xl font-black text-white group-hover:text-success transition-colors">{fund.cagr}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sharpe</div>
                        <div className="text-3xl font-black text-white group-hover:text-primary transition-colors">{fund.sharpe}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Expense</div>
                        <div className="text-3xl font-black text-white">{fund.expense}</div>
                      </div>
                      <div className="col-span-2 md:col-span-1 flex flex-col gap-3 min-w-[140px]">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl flex items-center gap-2 group/btn">
                          Analysis <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Button>
                        <Button variant="outline" className="border-white/10 text-white font-bold h-12 rounded-xl hover:bg-white/5">
                           Compare
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${className}`}>{children}</span>
}
