"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertCircle, Bell, LayoutDashboard, Search, MessageSquare, Wallet, Zap, Clock, ArrowUpRight, Globe, Rss, ExternalLink, BarChart2, Layers, TrendingDown, Clock3, Trophy, SlidersHorizontal, ShieldCheck, Loader2 } from "lucide-react"
import FundScreenerView from '@/components/dashboard/FundScreenerView'
import WealthChatView from '@/components/dashboard/WealthChatView'
import PortfolioXRayView from "@/components/dashboard/PortfolioXRayView"
import FundDetailModal from "@/components/modals/FundDetailModal"
import MarketStatusBadge from "@/components/MarketStatusBadge"
import { api } from "@/lib/api"
import PortfolioChart from "@/components/charts/portfolio-chart"
import { Input } from "@/components/ui/input"

const CHANNELS = [
  { id: "iEpJwprxDdk", name: "Bloomberg Global", desc: "Global Financials" },
  { id: "P857H4ej-MQ", name: "CNBC-TV18", desc: "India's #1 Business" },
  { id: "LqiwumvMReo", name: "ET Now", desc: "Market Insights" },
  { id: "1PM2u77DEPM", name: "Zee Business", desc: "Hindi Finance" },
  { id: "9e4fXHLyc4U", name: "CNBC Awaaz", desc: "Hindi Markets" },
  { id: "tPsetVg5te4", name: "NDTV Profit", desc: "IPO & Live Updates" },
  { id: "gCNeDWCI0vo", name: "Al Jazeera", desc: "Global Markets" },
]

const LiveIntelligenceHub = ({ posture }: { posture: any }) => {
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0])
  const data = posture || {
    neural_confidence: 92.4,
    postures: [
      { region: "EU", impact: "STABLE", msg: "Strategic reserves offsetting energy volatility." },
      { region: "ME", impact: "WATCH", msg: "Monitoring shipping lane insurance spikes." },
      { region: "AS", impact: "WATCH", msg: "Semiconductor supply chain normalizing." }
    ]
  }

  return (
    <Card className="lg:col-span-3 border-accent/20 bg-accent/5 overflow-hidden border-2 shadow-2xl shadow-accent/5">
      <div className="p-4 border-b border-accent/10 flex items-center justify-between bg-accent/10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <h3 className="text-sm font-bold tracking-widest uppercase text-accent-foreground">Strategic Command Hub</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span className="hidden md:inline">Global Desk: ACTIVE</span>
          <Badge className="bg-accent/20 text-accent border-accent/30 lowercase font-mono">v2.4.1-live</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 aspect-video lg:aspect-[21/8]">
        {/* Channel Selection Sidebar */}
        <div className="bg-card/30 backdrop-blur-md border-r border-accent/10 p-2 hidden lg:flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 py-2 mb-2">
             <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Broadcast Registry</span>
          </div>
          {CHANNELS.map((ch) => (
            <button
              key={ch.name}
              onClick={() => setSelectedChannel(ch)}
              className={`w-full text-left p-3 rounded-lg transition-all border ${
                selectedChannel.name === ch.name 
                  ? "bg-accent/20 border-accent/40 shadow-inner" 
                  : "border-transparent hover:bg-white/5"
              }`}
            >
              <div className="text-[10px] font-bold text-foreground truncate">{ch.name}</div>
              <div className="text-[8px] text-muted-foreground truncate uppercase tracking-tighter opacity-60">{ch.desc}</div>
            </button>
          ))}
        </div>

        {/* Live Video Feed */}
        <div className="lg:col-span-3 bg-black relative group">
          <iframe 
            key={selectedChannel.id}
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${selectedChannel.id}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0`}
            title={selectedChannel.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          />
          <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
            <Badge className="bg-destructive text-destructive-foreground border-none px-3 py-1 text-xs animate-pulse">LIVE NEWS</Badge>
            <Badge className="bg-black/60 backdrop-blur-md text-white/80 border-white/10 px-3 py-1 text-[10px] uppercase font-bold tracking-widest">{selectedChannel.name}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-white tracking-widest uppercase">Source: {selectedChannel.desc}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex gap-1 h-3 items-end">
                   {[0.4, 0.7, 0.5, 0.9, 0.3].map((h, i) => (
                     <motion.div key={i} animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }} transition={{ repeat: Infinity, duration: 1 + i*0.2 }} className="w-0.5 bg-accent" />
                   ))}
                </div>
                <span className="text-[9px] font-bold text-accent tracking-tighter uppercase ml-1">Signal Strength: 100%</span>
            </div>
          </div>
        </div>
        
        {/* Global Situation Monitor */}
        <div className="bg-card/50 backdrop-blur-xl border-l border-accent/10 p-6 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-2">
             <Globe size={12} /> Strategic Posture
          </h4>
          <p className="text-[10px] text-muted-foreground font-medium leading-tight">Cross-referencing live feeds with portfolio risk-weights.</p>
        </div>
        
        <div className="space-y-3">
          {data.postures.map((item: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/50 flex flex-col gap-1">
               <div className="flex items-center justify-between">
                 <span className="text-[8px] font-bold text-foreground border border-border px-1 px-1 rounded uppercase tracking-tighter">{item.region}</span>
                 <span className={`text-[8px] font-black uppercase tracking-widest ${
                   item.impact === 'CRITICAL' ? 'text-destructive' : 
                   item.impact === 'WATCH' ? 'text-warning' : 'text-success'
                 }`}>{item.impact}</span>
               </div>
               <p className="text-[9px] text-muted-foreground leading-tight">{item.msg}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-auto pt-6 border-t border-accent/10">
           <div className="flex items-center justify-between mb-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              <span>AI Sentiment</span>
              <span className="text-accent">{data.neural_confidence}% Neural Confidence</span>
           </div>
           <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: `${data.neural_confidence}%` }} className="h-full bg-accent" />
           </div>
        </div>
      </div>
    </div>
  </Card>
)
}

const LiveNewsTicker = ({ articles }: { articles: any[] }) => {
  const tickerRef = React.useRef<HTMLDivElement>(null)
  const displayItems = articles.length > 0 ? [...articles, ...articles] : []

  return (
    <div className="lg:col-span-3 bg-card/50 border border-border/60 rounded-xl overflow-hidden relative">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">Live Financial Headlines</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Rss size={10} className="text-muted-foreground" />
          <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">ET · Moneycontrol · LiveMint · NDTV Profit · Business Standard</span>
        </div>
      </div>
      <div className="relative overflow-hidden h-9">
        {displayItems.length === 0 ? (
          <div className="flex items-center h-full px-4">
            <div className="h-2 w-48 bg-muted/40 rounded animate-pulse" />
          </div>
        ) : (
          <motion.div
            ref={tickerRef}
            className="flex items-center gap-0 absolute whitespace-nowrap h-full"
            animate={{ x: ["-0%", "-50%"] }}
            transition={{ duration: displayItems.length * 6, repeat: Infinity, ease: "linear" }}
          >
            {displayItems.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 text-xs font-medium text-foreground hover:text-primary transition-colors group shrink-0"
              >
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest border border-border px-1.5 py-0.5 rounded">{item.source}</span>
                <span className="group-hover:underline">{item.title}</span>
                <ExternalLink size={9} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-muted-foreground/30 ml-3">◆</span>
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

const MARKET_TABS = ["Commodities", "ETFs", "Gainers", "Losers", "F&O"] as const

const MarketDataHub = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = React.useState<string>("Commodities")
  const prevPrices = React.useRef<Record<string, string>>({})
  const [flashClasses, setFlashClasses] = React.useState<Record<string, string>>({})

  const rows: any[] = React.useMemo(() => {
    if (!data) return []
    if (activeTab === "Commodities") return data.commodities || []
    if (activeTab === "ETFs") return data.etfs || []
    if (activeTab === "Gainers") return data.movers?.gainers || []
    if (activeTab === "Losers") return data.movers?.losers || []
    if (activeTab === "F&O") return data.fno || []
    return []
  }, [activeTab, data])

  React.useEffect(() => {
    if (!rows || rows.length === 0) return
    const newClasses: Record<string, string> = {}
    rows.forEach((item: any) => {
      const sym = item.symbol || item.name
      const currentStr = item.price
      if (!currentStr || currentStr === "N/A") return
      
      const currentNum = parseFloat(currentStr.replace(/[^0-9.-]+/g, ""))
      const prevStr = prevPrices.current[sym]
      
      if (prevStr) {
        const prevNum = parseFloat(prevStr.replace(/[^0-9.-]+/g, ""))
        if (currentNum > prevNum) {
          newClasses[sym] = "price-up"
        } else if (currentNum < prevNum) {
          newClasses[sym] = "price-down"
        }
      }
      prevPrices.current[sym] = currentStr
    })
    
    if (Object.keys(newClasses).length > 0) {
      setFlashClasses(newClasses)
      setTimeout(() => setFlashClasses({}), 600)
    }
  }, [rows])

  return (
    <Card className="lg:col-span-3 border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-0 border-b border-border bg-muted/10">
        <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
          <BarChart2 size={14} className="text-muted-foreground" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Market Data</span>
        </div>
        <div className="flex overflow-x-auto">
          {MARKET_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              {tab === "Gainers" && <TrendingUp size={9} className="inline mr-1" />}
              {tab === "Losers" && <TrendingDown size={9} className="inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>
        <div className="ml-auto px-4 scale-75 origin-right">
          <MarketStatusBadge />
        </div>
      </div>
      <div className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="flex gap-3 p-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-16 w-36 rounded-xl bg-muted/20 animate-pulse flex-shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 p-4 overflow-x-auto">
            {rows.map((item: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex-shrink-0 min-w-[130px] p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-default ${flashClasses[item.symbol || item.name] || ""}`}
              >
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1 truncate">
                  {item.symbol || item.name}
                </div>
                <div className="text-sm font-bold text-foreground mb-0.5 truncate">
                  {item.price}
                </div>
                <div className={`text-[10px] font-bold ${item.color}`}>
                  {item.change_pct}
                  {item.unit && <span className="text-muted-foreground ml-1 font-normal">{item.unit}</span>}
                </div>
                {item.name && item.symbol && (
                  <div className="text-[8px] text-muted-foreground truncate mt-0.5 opacity-70">{item.name}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

const DashboardView = ({ alerts, marketData, newsData, extMarketData, isRefreshing, isAnalyzing, isExecuting, handleRefresh, handleAnalyze, handleExecute, setActiveTab, geopoliticalPosture }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Live Intelligence Hub - Full Width Top Section */}
    <LiveIntelligenceHub posture={geopoliticalPosture} />

    {/* Live News Ticker */}
    <LiveNewsTicker articles={newsData} />

    {/* Market Data Hub: ETFs, Commodities, Movers, F&O */}
    <MarketDataHub data={extMarketData} />

    {/* Portfolio Overview */}
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
            <Wallet size={16} /> Total Balance
          </CardTitle>
          <div className="text-4xl font-black text-foreground tracking-tighter">
            <CountUp end="₹12,45,000" />
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
      <CardContent className="space-y-3">
        {alerts.map((alert: any, idx: number) => (
          <motion.div 
            key={idx} 
            whileHover={{ x: 4 }}
            className="p-3 rounded-xl bg-muted/20 border border-border flex gap-3 transition-all cursor-pointer hover:border-primary/40 relative overflow-hidden group"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              alert.severity.includes("🔴") ? "bg-destructive" : 
              alert.severity.includes("🟠") ? "bg-orange-500" : 
              alert.severity.includes("🟡") ? "bg-yellow-500" : "bg-blue-500"
            }`} />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[10px] uppercase tracking-wider text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                   <span className="text-xs">{alert.severity.split(" ")[0]}</span> {alert.title}
                </h4>
                <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">{alert.time}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug font-medium">{alert.body}</p>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {alert.sectors?.map((s: string) => (
                  <Badge key={s} variant="outline" className="text-[7px] font-black uppercase tracking-tighter px-1.5 py-0 border-muted-foreground/20 text-muted-foreground">
                    {s}
                  </Badge>
                ))}
                <div className="ml-auto text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                   {alert.action} <ArrowUpRight size={10} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        <Button onClick={() => setActiveTab("Intelligence Feed")} variant="ghost" className="w-full text-primary hover:bg-primary/10 text-[9px] font-black uppercase tracking-[0.2em] h-8 mt-1">
          Open Strategic Command Hub ({alerts.length} Active)
        </Button>
      </CardContent>
    </Card>

    {/* Market Pulse Ticker Style */}
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Market Pulse (Real-Time)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketData.length > 0 ? marketData.map((stat: any) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-muted/20 border border-border text-center group hover:border-primary/20 transition-all"
            >
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">{stat.label}</div>
              <div className={`text-xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>{stat.value}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.trend}</div>
            </motion.div>
          )) : (
            [1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border animate-pulse h-24" />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  </div>
)

const IntelligenceView = ({ alerts }: any) => (
  <div className="space-y-6 max-w-4xl mx-auto">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Intelligence Feed</h2>
        <p className="text-muted-foreground text-sm">Real-time market signals and geopolitical risk indicators tailored to your holdings.</p>
      </div>
      <Badge className="bg-primary/10 text-primary border-primary/20 p-2 text-xs">{alerts.length} NEW SIGNALS</Badge>
    </div>
    
    <div className="grid gap-4">
      {alerts.map((alert: any, idx: number) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="p-6 rounded-2xl bg-card border border-border flex items-start gap-6 hover:shadow-xl hover:shadow-primary/5 transition-all group cursor-pointer"
        >
          <div className={`p-4 rounded-xl ${alert.severity.includes("🔴") ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"} text-2xl`}>
             {alert.severity.includes("🔴") ? <AlertCircle size={28} /> : <Zap size={28} />}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${alert.severity.includes("🔴") ? "text-destructive" : "text-warning"}`}>{alert.severity}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">2 MINS AGO</span>
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{alert.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{alert.body} This signal is derived from real-time monitoring of geopolitical shifts and market PE ratios.</p>
            <div className="pt-4 flex items-center gap-4">
              <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-lg">View Detailed Analysis</Button>
              <Button className="text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-lg bg-foreground text-background">Assess Portfolio Impact</Button>
            </div>
          </div>
        </motion.div>
      ))}
      {alerts.length === 0 && (
        <div className="p-6 rounded-2xl bg-muted/5 border border-border border-dashed flex items-center justify-center h-32 opacity-50">
           <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No active signals at this moment</p>
        </div>
      )}
    </div>
  </div>
)


const MockView = ({ title, alerts }: any) => (
  <>
    {title.trim() === "Intelligence Feed" ? (
      <IntelligenceView alerts={alerts} />
    ) : title.trim() === "Fund Screener" ? (
      <FundScreenerView />
    ) : (
      <Card className="border-border border-dashed bg-muted/5 flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {title === "Portfolio X-Ray" && <Wallet size={32} />}
          {title === "AI Wealth Chat" && <MessageSquare size={32} />}
          {title === "Tax Optimizer" && <Clock size={32} />}
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground max-w-sm">This module is currently being synchronized with your real-time portfolio data. Stay tuned for institutional-grade insights. 🚀</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-4 font-bold rounded-xl">Refresh View</Button>
      </Card>
    )}
  </>
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

const MarketClosedBanner = () => {
  const [status, setStatus] = useState<any>(null)
  const [countdown, setCountdown] = useState('')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.getMarketStatus()
        setStatus(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!status?.next_open) return
    const interval = setInterval(() => {
      const diff = new Date(status.next_open).getTime() - new Date().getTime()
      if (diff <= 0) {
        setCountdown('Opening soon')
        return
      }
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown(`in ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [status?.next_open])

  if (dismissed || !status || status.is_open || status.is_pre_market) return null

  const isWeekend = status.day === 'Saturday' || status.day === 'Sunday'
  const rightText = isWeekend ? "Opens Monday 9:15 AM IST" : "Opens tomorrow 9:15 AM IST"

  return (
    <div style={{
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: '10px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#B45309' }}>
        🔔 NSE & BSE are currently closed
      </div>
      <div className="flex items-center gap-4">
        <div style={{ fontSize: '13px', color: '#D97706' }}>
          {rightText} <span className="font-bold ml-1">{countdown}</span>
        </div>
        <button onClick={() => setDismissed(true)} className="text-[#B45309] hover:bg-[#FDE68A] p-1 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [marketData, setMarketData] = useState<any[]>([])
  const [newsData, setNewsData] = useState<any[]>([])
  const [extMarketData, setExtMarketData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [marketStatus, setMarketStatus] = useState<any>(null)
  const [geopoliticalPosture, setGeopoliticalPosture] = useState<any>(null)

  useEffect(() => {
    api.getMarketStatus().then(setMarketStatus).catch(() => {})
    api.getGeopoliticalPosture().then(setGeopoliticalPosture).catch(() => {})
  }, [])

  // Real-time Market Pulse Polling
  useEffect(() => {
    const fetchMarketData = () => {
      api.getMarketPulse().then(data => {
        if (data) setMarketData(data)
      }).catch(() => {
        setMarketData([
          { label: "Nifty 50", value: "₹22,453.20", trend: "+0.12%", color: "text-success" },
          { label: "Sensex", value: "₹74,123.50", trend: "+0.08%", color: "text-success" },
          { label: "FII Net Flow", value: "₹-4.2k Cr", trend: "Net Seller", color: "text-destructive" },
          { label: "India 10Y", value: "6.92%", trend: "Stable", color: "text-success" }
        ])
      })
    }
    
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000) // 30s — matches backend cache
    return () => clearInterval(interval)
  }, [])

  // Live News Polling — every 2 minutes
  useEffect(() => {
    const fetchNews = () => {
      api.getLiveNews().then((data: any) => {
        if (data?.articles?.length > 0) setNewsData(data.articles)
      }).catch(() => {})
    }
    fetchNews()
    const interval = setInterval(fetchNews, 120000)
    return () => clearInterval(interval)
  }, [])

  // Extended Market Data — ETFs, Commodities, Movers, F&O — every 60s
  useEffect(() => {
    const fetchExt = () => {
      api.getMarketData().then((data: any) => {
        if (data) setExtMarketData(data)
      }).catch(() => {})
    }
    fetchExt()
    const interval = setInterval(fetchExt, 60000)
    return () => clearInterval(interval)
  }, [])

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
            <div className="flex items-center gap-2 mt-1">
               <p className="text-muted-foreground text-sm">Welcome back, Ashutosh. Market is</p>
               <span className={`text-xs font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded border transition-all ${
                 marketStatus?.status === 'open' ? 'bg-success/10 text-success border-success/30' : 
                 marketStatus?.status === 'closed' ? 'bg-red-500/10 text-red-600 border-red-500/30' : 
                 marketStatus?.status === 'pre_market' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 
                 'bg-muted text-muted-foreground border-border'
               }`}>
                 {marketStatus?.status || "Analyzing"}
               </span>
            </div>
          </motion.div>
          <div className="flex items-center gap-4">
            <MarketStatusBadge />
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

        <MarketClosedBanner />

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
                marketData={marketData}
                newsData={newsData}
                extMarketData={extMarketData}
                isRefreshing={isRefreshing}
                isAnalyzing={isAnalyzing}
                isExecuting={isExecuting}
                handleRefresh={handleRefresh}
                handleAnalyze={handleAnalyze}
                handleExecute={handleExecute}
                setActiveTab={setActiveTab}
                geopoliticalPosture={geopoliticalPosture}
              />
            ) : activeTab === "Fund Screener" ? (
              <FundScreenerView />
            ) : activeTab === "AI Wealth Chat" ? (
              <WealthChatView />
            ) : activeTab === "Portfolio X-Ray" ? (
              <PortfolioXRayView />
            ) : (
              <MockView title={activeTab} alerts={alerts} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

