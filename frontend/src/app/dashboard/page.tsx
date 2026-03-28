"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertCircle, Bell, LayoutDashboard, Search, MessageSquare, Wallet, Zap, Clock, ArrowUpRight } from "lucide-react"
import { api } from "@/lib/api"
import PortfolioChart from "@/components/charts/portfolio-chart"

const DashboardView = ({ alerts, isRefreshing, isAnalyzing, isExecuting, handleRefresh, handleAnalyze, handleExecute }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Portfolio Overview */}
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Portfolio Overview</CardTitle>
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold tracking-tight text-foreground">
            <CountUp end="1245000" />
          </div>
          <div className="text-xs text-success font-bold flex items-center gap-1">
            <TrendingUp size={12} /> +14.2% (XIRR)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full h-[300px]">
            <PortfolioChart />
          </div>
          <div className="space-y-6 min-w-[200px] w-full md:w-auto">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Invested Amount</span>
              <div className="text-xl font-bold text-foreground tracking-tight">₹10,50,000</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Returns</span>
              <div className="text-xl font-bold text-success font-bold tracking-tight">+₹1,95,000</div>
            </div>
            <Button 
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(45,111,247,0.3)] min-w-[180px]"
            >
              {isAnalyzing ? "Analyzing Risks..." : "Analyze Rebalancing"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Today's Action Card */}
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative p-[1px] rounded-[2rem] overflow-hidden group shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary animate-gradient-shift opacity-50 group-hover:opacity-100 transition-opacity" />
      <Card className="h-full bg-card backdrop-blur-3xl border-none rounded-[2rem] p-6 relative z-10">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Zap size={100} className="text-primary" />
        </div>
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
             <div className="p-2 rounded-lg bg-primary/20 text-primary"><AlertCircle size={20} /></div>
             AI Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <h3 className="text-2xl font-bold text-foreground leading-tight">Switch ₹50,000 from <span className="text-muted-foreground">Liquid</span> to <span className="text-primary">Small Cap</span></h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Market timing signals suggest a temporary dip in Small Caps. Deploy pending capital now for 12% projected relative alpha over 6 months.
          </p>
          <Button 
            disabled={isExecuting}
            onClick={handleExecute}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-black h-14 rounded-2xl text-lg flex items-center justify-center gap-2 group"
          >
            {isExecuting ? "Executing Order..." : <>Execute Action <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
          </Button>
        </CardContent>
      </Card>
    </motion.div>

    {/* Intelligence Feed */}
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center justify-between">
          Intelligence Feed
          <Badge className="bg-primary/10 text-primary border-primary/20">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert: any, idx: number) => (
          <motion.div 
            key={idx} 
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-muted/30 border border-border flex gap-4 transition-all cursor-pointer hover:border-primary/40 relative overflow-hidden group"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity.includes("🔴") ? "bg-destructive" : "bg-warning"}`} />
            <div className="text-xl mt-1">{alert.severity.includes("🔴") ? "🔴" : "🟡"}</div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{alert.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.body}</p>
            </div>
          </motion.div>
        ))}
        <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest">View all 12 alerts</Button>
      </CardContent>
    </Card>

    {/* Market Pulse Ticker Style */}
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Market Pulse</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Nifty 50 PE", value: "23.4", trend: "High Value", color: "text-warning" },
            { label: "FII Net Flow", value: "₹-4.2k Cr", trend: "Net Seller", color: "text-destructive" },
            { label: "Market Vol.", value: "VIX 14.2", trend: "Stable", color: "text-success" },
            { label: "India 10Y", value: "6.92%", trend: "Stable", color: "text-success" }
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-muted/20 border border-border text-center group hover:border-primary/20 transition-all">
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">{stat.label}</div>
              <div className="text-xl font-bold text-foreground mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.trend}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

const MockView = ({ title }: { title: string }) => (
  <Card className="border-border border-dashed bg-muted/5 flex flex-col items-center justify-center p-20 gap-4">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
      {title === "Fund Screener" && <Search size={32} />}
      {title === "Portfolio X-Ray" && <Wallet size={32} />}
      {title === "Intelligence Feed" && <Bell size={32} />}
      {title === "AI Wealth Chat" && <MessageSquare size={32} />}
      {title === "Tax Optimizer" && <Clock size={32} />}
    </div>
    <div className="text-center space-y-1">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground max-w-sm">This module is currently being synchronized with your real-time portfolio data. Stay tuned for institutional-grade insights. 🚀</p>
    </div>
    <Button variant="outline" className="mt-4 font-bold rounded-xl">Back to Dashboard</Button>
  </Card>
)

const CountUp = ({ end }: { end: string }) => {
  const [count, setCount] = useState(0)
  const target = parseInt(end.replace(/[^0-9]/g, ""))
  
  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = target / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <span>₹{count.toLocaleString()}</span>
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    api.getAlerts().then(data => {
      if (data && data.length > 0) setAlerts(data)
    }).catch(() => {
        // Fallback
        setAlerts([
            { type: "geopolitical", severity: "🔴 Act Now", title: "Middle East Tension", body: "Oil volatility may impact Energy stocks." },
            { type: "market", severity: "🟡 Watch", title: "Nifty PE Threshold", body: "Approaching 24.5. Consider STP over Lump sum." }
        ])
    })
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setIsRefreshing(false)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await new Promise(r => setTimeout(r, 2000))
    setIsAnalyzing(false)
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    await new Promise(r => setTimeout(r, 3000))
    setIsExecuting(false)
    alert("Rebalancing action executed successfully! ✅")
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/20 hidden lg:flex flex-col p-6 gap-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Nexquire</span>
        </div>
        <nav className="space-y-2">
          {[
            { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
            { icon: <Search size={20} />, label: "Fund Screener" },
            { icon: <Wallet size={20} />, label: "Portfolio X-Ray" },
            { icon: <Bell size={20} />, label: "Intelligence Feed" },
            { icon: <MessageSquare size={20} />, label: "AI Wealth Chat" },
            { icon: <Clock size={20} />, label: "Tax Optimizer" }
          ].map((item) => (
            <motion.button
              whileHover={{ x: 4 }}
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.label ? "bg-accent text-accent-foreground font-bold shadow-lg shadow-black/5" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className={activeTab === item.label ? "text-accent-foreground" : ""}>
                {item.icon}
              </div>
              <span className="text-sm">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <header className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{activeTab}</h1>
            <p className="text-muted-foreground">Welcome back, Ashutosh. Market is <span className="text-success font-bold">Steady</span>.</p>
          </motion.div>
          <div className="flex items-center gap-4">
            <Button 
              disabled={isRefreshing}
              onClick={handleRefresh}
              variant="outline" 
              className="hover:bg-accent border-border text-foreground font-bold min-w-[160px]"
            >
              {isRefreshing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Clock size={16} /></motion.div> : "Refresh Intelligence"}
            </Button>
            <div className="w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center font-bold text-primary bg-primary/10">AS</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Dashboard" ? (
              <DashboardView 
                alerts={alerts}
                isRefreshing={isRefreshing}
                isAnalyzing={isAnalyzing}
                isExecuting={isExecuting}
                handleRefresh={handleRefresh}
                handleAnalyze={handleAnalyze}
                handleExecute={handleExecute}
              />
            ) : (
              <MockView title={activeTab} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>{children}</span>
}
