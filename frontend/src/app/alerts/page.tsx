"use client"

import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Globe, Zap, AlertTriangle, ShieldCheck, TrendingUp, Info, ArrowUpRight, Filter, Search } from "lucide-react"

export default function IntelligenceFeed() {
  const alerts = [
    {
      severity: "🔴 Critical",
      title: "Iran-USA Tension Escalation",
      body: "Strait of Hormuz transit threatened. Crude oil prices projected to rise 12% in next 48 hours. Negative impact on Indian Paint and OMC bucket.",
      time: "2 mins ago",
      sectors: ["Oils", "Paints", "Logistics"],
      action: "Pause Small Cap SIP"
    },
    {
      severity: "🟢 Opportunity",
      title: "Nifty Correction Threshold",
      body: "Market corrected 8% from top. PE now at 17.2, which historically precedes a 15% recovery over 6 months. Strong bias for lump sum deployment.",
      time: "1 hour ago",
      sectors: ["Nifty 50", "Direct Equity"],
      action: "Strategic Buy"
    },
    {
      severity: "🟡 Watch",
      title: "US Fed Rate Signal",
      body: "Powell hints at 'higher for longer'. Yield curve likely to stay inverted. Indian debt funds might see yield compression.",
      time: "4 hours ago",
      sectors: ["Debt", "G-Sec"],
      action: "Review Debt Weight"
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/20 text-primary"><Bell size={24} /></div>
             Intelligence Feed
          </h1>
          <p className="text-lg text-muted-foreground font-medium">9 AI agents scanning the world 24/7 to protect your wealth.</p>
        </motion.div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-12 glass border-white/5 text-white font-bold rounded-xl flex items-center gap-2 group hover:bg-white/5">
              <Filter size={18} /> Filter Alerts
           </Button>
           <Badge className="bg-primary/20 text-primary border-primary/40 flex items-center gap-2 px-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> LIVE STREAM
           </Badge>
        </div>
      </header>

      <div className="space-y-6">
        {alerts.map((alert, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="glass border-white/5 hover:border-white/10 transition-all cursor-default relative overflow-hidden group">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                alert.severity.includes("🔴") ? "bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]" : 
                alert.severity.includes("🟢") ? "bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-warning"
              }`} />
              
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row justify-between gap-10">
                  <div className="flex-1 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md ${
                              alert.severity.includes("🔴") ? "bg-destructive/10 text-destructive border border-destructive/20" : 
                              alert.severity.includes("🟢") ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"
                           }`}>
                              {alert.severity}
                           </span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{alert.time}</span>
                        </div>
                        <div className="lg:hidden text-[10px] font-black text-primary border border-primary/20 px-3 py-1 rounded-md uppercase tracking-widest">
                           {alert.action}
                        </div>
                     </div>

                     <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{alert.title}</h3>
                        <p className="text-base text-muted-foreground leading-relaxed font-medium">
                           {alert.body}
                        </p>
                     </div>

                     <div className="flex flex-wrap gap-2 pt-2">
                        {alert.sectors.map(s => (
                           <span key={s} className="px-3 py-1.5 rounded-xl glass border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">
                              #{s}
                           </span>
                        ))}
                     </div>
                  </div>

                  <div className="min-w-[200px] flex flex-col justify-between items-end gap-6 text-right">
                     <div className="hidden lg:block">
                        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1.5">Sector Impact</div>
                        <div className="flex gap-2 justify-end">
                           <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20"><TrendingUp size={16} className="rotate-180" /></div>
                           <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center border border-success/20"><TrendingUp size={16} /></div>
                        </div>
                     </div>

                     <div className="space-y-4 w-full">
                        <div className="hidden lg:block space-y-1">
                           <div className="text-[10px] text-primary uppercase font-black tracking-widest">Recommended Action</div>
                           <div className="text-lg font-black text-white">{alert.action}</div>
                        </div>
                        <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-[0_0_20px_rgba(45,111,247,0.3)] flex items-center gap-2 group/btn">
                           Take Action <ArrowUpRight className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </Button>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center py-10">
         <Button variant="ghost" className="text-muted-foreground font-bold hover:text-white gap-2">
            Load More Intelligence <Zap size={14} className="text-primary" />
         </Button>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest border ${className}`}>
      {children}
    </span>
  )
}
