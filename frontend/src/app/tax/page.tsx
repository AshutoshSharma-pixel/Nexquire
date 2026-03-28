"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Info, AlertCircle, TrendingDown, DollarSign, ArrowUpRight, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"

export default function TaxOptimizer() {
  const [taxData, setTaxData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getTaxAnalysis().then(data => setTaxData(data)).finally(() => setLoading(false))
  }, [])

  const taxHarvesting = [
    { name: "HDFC Top 100 Fund", gain: "₹52,400", status: "Harvest Ready", progress: 95, type: "LTCG in 15 days", color: "#10B981" },
    { name: "Quant Small Cap Fund", gain: "₹1,25,000", status: "Watch", progress: 65, type: "LTCG in 120 days", color: "#2D6FF7" }
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-5xl mx-auto space-y-12">
      <header className="space-y-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-white">Tax & Exit Optimizer</h1>
          <p className="text-lg text-muted-foreground font-medium">Stop losing wealth to taxes. Track LTCG thresholds and exit loads in real-time.</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="text-[10px] text-primary uppercase font-black tracking-[0.2em] mb-3">Tax-Free LTCG Goal</div>
            <div className="text-2xl font-bold tracking-tight text-white mb-4">₹1,25,000 / Year</div>
            <Progress value={42} className="h-2 bg-white/5" />
            <div className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-widest">₹52,400 Harvested This Year</div>
          </CardContent>
        </Card>
        
        <Card className="glass border-white/5 bg-secondary/30">
          <CardContent className="p-6">
             <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3">Potential Tax Save</div>
            <div className="text-3xl font-black text-success">₹8,450</div>
            <div className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12} /> Optimization Available</div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-secondary/30">
          <CardContent className="p-6">
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3">Exit Load Exposure</div>
            <div className="text-3xl font-black text-warning">₹2,100</div>
            <div className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-widest flex items-center gap-1.5"><AlertCircle size={12} /> 48 hours to zero load</div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5 bg-secondary/30">
          <CardContent className="p-6">
            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-3">Portfolio Tax Grade</div>
            <div className="text-3xl font-black text-white">A+</div>
            <div className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-widest flex items-center gap-1.5">Elite Tax Efficiency</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 text-primary"><Clock size={20} /></div>
          LTCG Countdown Tracker
        </h2>
        
        <div className="space-y-4">
          {taxHarvesting.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass border-white/5 hover:border-white/10 transition-all cursor-default">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-3">
                          <h3 className="font-bold text-xl text-white">{item.name}</h3>
                          <Badge className={item.status === "Harvest Ready" ? "bg-success/10 text-success border-success/20" : "bg-primary/10 text-primary border-primary/20"}>
                            {item.status}
                          </Badge>
                       </div>
                       <p className="text-xs text-muted-foreground font-medium">Unrealized Gain: <span className="text-white font-bold">{item.gain}</span></p>
                    </div>
                    <div className="w-full md:w-80 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">Holding Intensity</span>
                        <span style={{ color: item.color }}>{item.type}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="h-12 border-white/10 glass hover:bg-white/5 text-white font-bold px-8 rounded-xl shrink-0">
                      Set Exit Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative group p-[1px] rounded-[2.5rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 animate-gradient-shift" />
        <Card className="bg-background/90 backdrop-blur-3xl border-none rounded-[2.5rem] p-8 md:p-12 relative z-10">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <DollarSign size={150} className="text-primary" />
          </div>
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3 text-white">
              <div className="p-3 rounded-2xl bg-primary/20 text-primary shadow-[0_0_20px_rgba(45,111,247,0.3)]"><AlertCircle size={24} /></div>
              Strategic AI Exit Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-8">
            <p className="text-lg text-muted-foreground font-medium max-w-3xl leading-relaxed">
              Your HDFC Top 100 holding is 350 days old. Selling in 15 days will move your gain from <strong>Short Term (20% tax)</strong> to <strong>Long Term (12.5% tax)</strong>. This single wait will save you approximately ₹3,930 in taxes.
            </p>
            <div className="flex flex-wrap gap-4">
               <Button size="lg" className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(45,111,247,0.4)] text-lg flex items-center gap-2 group">
                  Apply Strategy <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </Button>
               <Button variant="ghost" className="h-16 px-10 text-white font-bold glass border-white/10 hover:bg-white/5">
                  View Detailed Breakdown
               </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${className}`}>
      {children}
    </span>
  )
}
