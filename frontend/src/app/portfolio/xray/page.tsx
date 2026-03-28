"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle2, TrendingUp, AlertTriangle, Layers, Percent, ArrowRight, ShieldCheck, Microscope } from "lucide-react"

export default function PortfolioXRay() {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)

  const handleUpload = () => {
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setIsAnalyzed(true)
    }, 2500)
  }

  const metrics = [
    { label: "True XIRR", value: "12.8%", sub: "vs Benchmark 14.2%", color: "text-white" },
    { label: "Fund Overlap", value: "42%", sub: "High Risk Density", color: "text-destructive" },
    { label: "Expense Drag", value: "₹12,400", sub: "Annualized cost", color: "text-warning" },
    { label: "Alpha Capacity", value: "+8%", sub: "Ready for Harvest", color: "text-success" }
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-6xl mx-auto space-y-12">
      <header className="max-w-3xl space-y-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/20 text-primary"><Microscope size={24} /></div>
             Portfolio X-Ray
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Upload your CAS PDF for deep-dive diagnostics of your true performance and hidden risks.</p>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {!isAnalyzed ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          >
            <div 
              className="max-w-2xl mx-auto glass p-1 gap-1 rounded-[3rem] relative group cursor-pointer"
              onClick={handleUpload}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
              <div className="border-2 border-dashed border-white/5 group-hover:border-primary/40 transition-all rounded-[2.8rem] py-24 flex flex-col items-center gap-6 relative z-10">
                <motion.div 
                  animate={isUploading ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_40px_rgba(45,111,247,0.2)] group-hover:scale-110 transition-transform"
                >
                  <Upload size={36} />
                </motion.div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white">Upload CAS PDF</h3>
                  <p className="text-muted-foreground text-sm font-medium">Drop your CAMS or KFintech CAS file here</p>
                </div>
                {isUploading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 pt-4"
                  >
                    <div className="text-primary font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Running Structural Analysis...</div>
                    <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="w-1/2 h-full bg-primary"
                        />
                    </div>
                  </motion.div>
                )}
                {!isUploading && (
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-4">Local Parsing. Private. Encrypted.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m, idx) => (
                <Card key={m.label} className="glass border-white/5 bg-secondary/20">
                  <CardContent className="p-8 space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{m.label}</div>
                    <div className={`text-4xl font-black ${m.color}`}>{m.value}</div>
                    <div className="text-xs font-medium text-muted-foreground">{m.sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 glass border-white/5 bg-secondary/10 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-bold text-white flex items-center justify-between">
                    Fund Overlap Heatmap
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 uppercase">High Risk Area</Badge>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground font-medium pt-2">
                    42% overlap detected between Nippon Small Cap and Quant Small Cap. You are unintentionally overweight in PSU Bank stocks.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-12 flex items-center justify-center h-[400px]">
                   {/* Heatmap Simulation */}
                   <div className="grid grid-cols-4 gap-4 w-full h-full opacity-60">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: Math.random() * 0.5 + 0.1 }}
                          transition={{ delay: i * 0.05 }}
                          className="rounded-xl"
                          style={{ backgroundColor: i % 5 === 0 ? "#EF4444" : "#2D6FF7" }}
                        />
                      ))}
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass px-6 py-3 rounded-2xl border-white/10 text-white font-bold flex items-center gap-2">
                         <Layers size={20} className="text-primary" /> Multi-Layer Map Active
                      </div>
                   </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5 rounded-[2rem] p-8 overflow-hidden relative">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                   <CardHeader className="p-0 mb-6">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <TrendingUp className="text-primary w-5 h-5" />
                        AI Rebalancing Plan
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0 space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 flex gap-4">
                           <div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">1</div>
                           <p className="text-sm font-medium text-white/80">Sell HDFC Top 100 for tax harvesting (Save ₹3,930).</p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 flex gap-4">
                           <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">2</div>
                           <p className="text-sm font-medium text-white/80">Move ₹50,000 to Parag Parikh Flexi Cap for better geography diversification.</p>
                        </div>
                      </div>
                      <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-[0_0_30px_rgba(45,111,247,0.3)]">
                        Apply Blueprint
                      </Button>
                      <button className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors underline decoration-primary underline-offset-4">
                        Download Detailed PDF Report
                      </button>
                   </CardContent>
                </Card>
                <div className="glass p-6 rounded-3xl border-white/5 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center border border-success/20">
                      <ShieldCheck size={24} />
                   </div>
                   <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Trust Signal</div>
                      <div className="text-sm font-bold text-white">Full Data Privacy Verified</div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
