"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import GlobeAnimation from "@/components/GlobeAnimation"
import { ArrowRight, ChevronRight, X } from "lucide-react"
import gsap from "gsap"

// --- COMPONENTS ---

const StatItem = ({ target, label, suffix = "" }: { target: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 2
      const increment = target / (duration * 60)
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 1000 / 60)
      return () => clearInterval(timer)
    }
  }, [isInView, target])

  return (
    <div ref={ref} className="py-12 px-10 text-center border-r border-[#E8E8E8] last:border-none">
      <div className="text-[48px] font-black text-black leading-none mb-4 tracking-[-2px]">
        {count}{suffix}
      </div>
      <div className="text-[12px] text-[#999] uppercase tracking-[1.5px] font-semibold">{label}</div>
    </div>
  )
}

const LayerCard = ({ num, icon, name, desc, index, isActive }: { num: string, icon: string, name: string, desc: string, index: number, isActive: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, x: 30 }}
    animate={{ 
      opacity: isActive ? 1 : 0.55,
      scale: isActive ? 1.03 : 1,
      borderColor: isActive ? "#000" : "#E8E8E8"
    }}
    transition={{ duration: 0.4 }}
    className={`flex-shrink-0 w-[256px] bg-white border rounded-[24px] p-8 cursor-pointer relative overflow-hidden group transition-all duration-400 scroll-snap-align-start ${isActive ? 'shadow-[0_24px_48px_rgba(0,0,0,0.12)]' : ''}`}
  >
    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-black transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0'}`} />
    <div className="text-[11px] font-bold tracking-[2px] text-[#CCC] uppercase mb-6">{num}</div>
    <div className={`w-12 h-12 bg-[#F5F5F5] rounded-[12px] flex items-center justify-center text-2xl mb-6 transition-transform ${isActive ? 'scale-110 rotate-[-5deg]' : ''}`}>
      {icon}
    </div>
    <h3 className="text-[16px] font-bold text-black mb-3">{name}</h3>
    <p className="text-[13px] text-[#777] leading-relaxed mb-6">{desc}</p>
    <div className={`absolute bottom-8 right-8 text-[18px] transition-all ${isActive ? 'text-black translate-x-1 translate-y-[-4px]' : 'text-[#DDD]'}`}>↗</div>
  </motion.div>
)

const StepCard = ({ num, title, desc, index }: { num: string, title: string, desc: string, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white border border-[#E8E8E8] rounded-[24px] p-12 transition-all hover:translate-y-[-4px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
  >
    <div className="text-[80px] font-black tracking-[-4px] text-black mb-8 leading-none">{num}</div>
    <h4 className="text-[20px] font-bold text-black mb-4">{title}</h4>
    <p className="text-[14px] text-[#666] leading-relaxed">{desc}</p>
  </motion.div>
)

const AlertPreview = ({ label, title, body, action, color, index }: { label: string, title: string, body: string, action: string, color: string, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white border border-[#E8E8E8] rounded-[16px] p-8 relative overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
  >
    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: color }} />
    <div className="text-[11px] font-bold tracking-[2px] uppercase mb-3" style={{ color: color }}>{label}</div>
    <h4 className="text-[16px] font-bold text-black mb-2">{title}</h4>
    <p className="text-[14px] text-[#666] leading-relaxed mb-5">{body}</p>
    <div className="text-[14px] font-bold cursor-pointer" style={{ color: color }}>{action}</div>
  </motion.div>
)

const FloatingAlert = ({ label, title, sub, color, top, bottom, right, delay, isFading }: { label: string, title: string, sub: string, color: string, top?: string, bottom?: string, right: string, delay: number, isFading: boolean }) => (
  <motion.div 
    animate={{ 
      y: isFading ? -8 : [0, -10, 0],
      opacity: isFading ? 0 : 1,
      scale: isFading ? 0.95 : 1
    }}
    transition={{ 
      y: isFading ? { duration: 0.4 } : { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 }
    }}
    className="absolute bg-white border border-[#E8E8E8] rounded-[12px] p-4 min-w-[190px] shadow-[0_4px_24px_rgba(0,0,0,0.07)] z-10 transition-shadow hover:shadow-xl"
    style={{ top, bottom, right }}
  >
    <div className="text-[9px] font-bold tracking-[1.5px] uppercase mb-1" style={{ color }}>{label}</div>
    <div className="text-[11px] font-bold text-black">{title}</div>
    <div className="text-[10px] text-[#999]">{sub}</div>
  </motion.div>
)

export default function LandingPage() {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [activeCard, setActiveCard] = useState(-1)
  const [progress, setProgress] = useState(0)
  const hasPlayed = useRef(false)

  const startCardScroll = () => {
    if (window.innerWidth <= 768) return
    setIsLocked(true)
    document.body.style.overflow = 'hidden'
    hasPlayed.current = true
    
    const container = scrollContainerRef.current
    const cardWidth = 256 + 16 // 256px card + 16px gap
    
    const scrollToCard = (index: number) => {
      if (!hasPlayed.current) return // Stop if cancelled/skipped
      
      if (index >= 9) {
        // Done — unlock scroll
        setTimeout(() => {
          document.body.style.overflow = ''
          setIsLocked(false)
          setActiveCard(-1) // Reset highlight
        }, 1000)
        return
      }
      
      setActiveCard(index)
      setProgress(((index + 1) / 9) * 100)
      
      if (container) {
        container.scrollTo({
          left: index * cardWidth,
          behavior: 'smooth'
        })
      }
      
      setTimeout(() => scrollToCard(index + 1), 800)
    }
    
    scrollToCard(0)
  }

  const skipScroll = () => {
    document.body.style.overflow = ''
    setIsLocked(false)
    hasPlayed.current = true 
    setActiveCard(-1)
    setProgress(100)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 9999, behavior: 'smooth'
      })
    }
    // Scroll to next section
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current && window.innerWidth > 768) {
          startCardScroll()
        }
      },
      { threshold: 0.5 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipScroll()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      observer.disconnect()
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [])
  const [alerts, setAlerts] = useState([
    { label: "GEOPOLITICAL ALERT", labelColor: "#DC2626", title: "Strait of Hormuz tension", sub: "Crude oil may spike — act now" },
    { label: "OPPORTUNITY", labelColor: "#16A34A", title: "Nifty PE at 17.2", sub: "Strong SIP entry signal" },
    { label: "SIP SIGNAL", labelColor: "#D97706", title: "Pause small cap SIP", sub: "Volatility elevated this month" }
  ])
  const [fadingIndex, setFadingIndex] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())

  const fetchLiveAlerts = async () => {
    try {
      const res = await fetch('/api/ai/alerts/live')
      if (!res.ok) return
      const newAlerts = await res.json()
      
      if (newAlerts && Array.isArray(newAlerts) && newAlerts.length >= 3) {
        // Update cards one by one with staggering
        for (let i = 0; i < 3; i++) {
          await new Promise(r => setTimeout(r, i * 400)) // delay before starting each fade
          setFadingIndex(i)
          await new Promise(r => setTimeout(r, 400)) // fade duration
          setAlerts(prev => {
            const updated = [...prev]
            updated[i] = newAlerts[i]
            return updated
          })
          setFadingIndex(null)
          await new Promise(r => setTimeout(r, 200)) // small pause after fade-in
        }
        setLastUpdated(Date.now())
      }
    } catch (e) {
      console.log('Live alerts polling failed:', e)
    }
  }

  useEffect(() => {
    fetchLiveAlerts()
    const interval = setInterval(fetchLiveAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = () => {
    const mins = Math.floor((Date.now() - lastUpdated) / 60000)
    return mins === 0 ? "Just now" : `${mins} min${mins > 1 ? 's' : ''} ago`
  }

  return (
    <div className="bg-white min-h-screen text-black overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 left-0 w-full z-[100] bg-white border-b border-[#E8E8E8] py-5 px-12 flex justify-between items-center h-[80px]">
        <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => router.push('/landing')}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="text-[17px] font-bold tracking-tight text-black">Nexquire</span>
        </div>
        <div className="flex items-center gap-10">
          {['Features', 'How it works', 'Alerts'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="text-[14px] font-medium text-[#666] hover:text-black transition-colors">{link}</a>
          ))}
        </div>
        <Button 
          onClick={() => router.push('/auth')}
          className="bg-black text-white hover:bg-[#222] px-6 py-2 h-[44px] rounded-lg text-[14px] font-bold"
        >
          Start Free →
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center px-12 overflow-visible bg-white">
        {/* LIVE Indicator */}
        <div className="absolute top-10 right-12 z-[110] flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
           <span className="text-[10px] font-black text-[#DC2626] uppercase tracking-widest">Live Signals</span>
        </div>

        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
          <div className="relative z-10 max-w-[540px]">
            {/* ... hero text ... */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 border border-[#E0E0E0] px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[1.5px] text-[#666] uppercase mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              India&apos;s First World-Aware Wealth Agent
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[52px] md:text-[84px] font-black leading-[1.0] tracking-[-3px] mb-6"
            >
              Invest with <br /> Intelligence.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-[17px] text-[#555] leading-[1.7] max-w-[420px] mb-10"
            >
              Age-aware. Market-aware. Geopolitically intelligent. Built for India&apos;s 15 crore investors.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3 mb-12"
            >
              <Button 
                onClick={() => router.push('/auth')}
                className="bg-black text-white hover:bg-[#222] px-7 py-3.5 h-[54px] rounded-[10px] text-[15px] font-bold transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Start Investing Smart →
              </Button>
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-[1.5px] border-[#D0D0D0] text-black hover:border-black px-7 py-3 h-[54px] rounded-[10px] text-[15px] font-bold transition-all"
              >
                See how it works
              </button>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-6 text-[13px] text-[#999] font-medium"
            >
              <span>— Bank-grade security</span>
              <span>— 44 AMCs covered</span>
              <span>— Real-time alerts</span>
            </motion.div>
          </div>

          <div className="relative lg:block hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
              <GlobeAnimation />
              
              <div className="mt-8 text-[11px] font-bold text-[#999] uppercase tracking-widest">
                Last updated: {getTimeAgo()}
              </div>

              <FloatingAlert 
                label={alerts[0].label} 
                title={alerts[0].title} 
                sub={alerts[0].sub} 
                color={alerts[0].labelColor || "#DC2626"} 
                top="10%" right="55%" delay={0} 
                isFading={fadingIndex === 0}
              />
              <FloatingAlert 
                label={alerts[1].label} 
                title={alerts[1].title} 
                sub={alerts[1].sub} 
                color={alerts[1].labelColor || "#16A34A"} 
                top="50%" right="3%" delay={-2} 
                isFading={fadingIndex === 1}
              />
              <FloatingAlert 
                label={alerts[2].label} 
                title={alerts[2].title} 
                sub={alerts[2].sub} 
                color={alerts[2].labelColor || "#D97706"} 
                bottom="12%" right="42%" delay={-1} 
                isFading={fadingIndex === 2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-[#E8E8E8]">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4">
          <StatItem target={15} suffix="Cr+" label="DEMAT ACCOUNTS" />
          <StatItem target={44} label="AMCS SCANNED" />
          <StatItem target={9} label="AI AGENTS" />
          <StatItem target={50} suffix="ms" label="ALERT LATENCY" />
        </div>
      </section>

      {/* 9 Layers Grid */}
      <section id="features" ref={sectionRef} className="py-24 px-12 bg-white relative min-h-[600px]">
        <div className="container mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="text-[11px] font-bold tracking-[3px] text-[#999] uppercase mb-4">THE SYSTEM</div>
            <h2 className="text-[32px] md:text-[52px] font-extrabold tracking-[-2px] mb-4">Nine layers of intelligence.</h2>
            <p className="text-[18px] text-[#666]">Every agent works in real-time, 24/7, to protect and grow your wealth.</p>
          </motion.div>

          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-12 scrollbar-hide scroll-snap-type-x-mandatory"
          >
            {[
              { num: "01", icon: "📊", label: "Profiling", desc: "Age-aware risk modeling and personalized allocation blueprints." },
              { num: "02", icon: "🌐", label: "Geopolitical", desc: "Monitors wars, sanctions, and global supply chain disruptions." },
              { num: "03", icon: "🛡️", label: "Political signals", desc: "Tracks statements from 20+ global political figures and tariffs." },
              { num: "04", icon: "📈", label: "Fund screener", desc: "Scores all 1,500+ funds across all 44 AMCs in real-time." },
              { num: "05", icon: "⚡", label: "Market timing", desc: "Nifty PE analysis and FII/DII flow tracking for entry signals." },
              { num: "06", icon: "🔍", label: "Portfolio X-Ray", desc: "Upload CAMS statement for instant deep diagnostics and rebalancing." },
              { num: "07", icon: "🧮", label: "Tax optimizer", desc: "LTCG harvesting and tax-efficient exit planning with rupee impact." },
              { num: "08", icon: "💬", label: "Wealth chat", desc: "Your AI CFO. Portfolio-aware, jargon-free, always available." },
              { num: "09", icon: "🏆", label: "Broker advisor", desc: "Objective broker selection based on your profile and needs." }
            ].map((layer, i) => (
              <LayerCard key={i} index={i} num={layer.num} icon={layer.icon} name={layer.label} desc={layer.desc} isActive={activeCard === i} />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-[2px] bg-[#E8E8E8] rounded-full mt-6 relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-black"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
          </div>

          {/* Skip Button */}
          {isLocked && (
            <button 
              onClick={skipScroll}
              className="absolute -bottom-16 right-0 text-[13px] text-[#999] hover:text-black font-bold transition-colors flex items-center gap-1 group"
            >
              Skip exploration <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-12 bg-[#F8F8F8] border-t border-[#E8E8E8]">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-[11px] font-bold tracking-[3px] text-[#999] uppercase mb-4">THE PROCESS</div>
            <h2 className="text-[32px] md:text-[52px] font-extrabold tracking-[-2px] mb-16">Three steps to smarter investing.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard index={0} num="01" title="Share your profile" desc="Just your age, income, and goals. Takes 3 minutes. No financial jargon required." />
            <StepCard index={1} num="02" title="We watch the world" desc="9 AI agents scan global events, political statements, and market signals around the clock." />
            <StepCard index={2} num="03" title="Get exact actions" desc="Not summaries. Not dashboards. Exact actions — what to buy, skip, or sell, and why." />
          </div>
        </div>
      </section>

      {/* Live Alerts Section */}
      <section id="alerts" className="py-24 px-12 bg-white">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-[11px] font-bold tracking-[3px] text-[#999] uppercase mb-4">LIVE INTELLIGENCE</div>
            <h2 className="text-[32px] md:text-[52px] font-extrabold tracking-[-2px] mb-16">Real signals. Right now.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <AlertPreview index={0} color="#DC2626" label="GEOPOLITICAL ALERT" title="Iran-USA tensions escalating" body="Strait of Hormuz disruption detected. Crude oil futures spiking across markets." action="→ Pause Oil & Gas SIPs this month" />
            <AlertPreview index={1} color="#D97706" label="MARKET SIGNAL" title="Nifty PE entering caution zone" body="PE at 22.3 — historically signals stretched valuations and reduced upside." action="→ Shift ₹2,000/month to liquid fund" />
            <AlertPreview index={2} color="#16A34A" label="OPPORTUNITY" title="Small cap correction — entry zone" body="Index down 12%. PE at 3-year low. Strong probability of recovery over 3-year horizon." action="→ Ideal lump sum entry moment" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white text-center px-12">
        <div className="container mx-auto max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-[40px] md:text-[64px] font-black tracking-[-3px] mb-6 leading-tight"
          >
            Start investing like the 1%.
          </motion.h2>
          <p className="text-[18px] text-[#666] mb-12">Join Indians making smarter investment decisions with Nexquire.</p>
          <Button 
            onClick={() => router.push('/auth')}
            className="bg-white text-black hover:bg-[#F0F0F0] px-10 py-4 h-[60px] rounded-[12px] text-[16px] font-bold transition-transform hover:-translate-y-0.5"
          >
            Start for Free →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-12 border-t border-[#E8E8E8] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">N</div>
          <span className="text-[15px] font-bold text-black tracking-tight">Nexquire</span>
        </div>
        <p className="text-[13px] text-[#999] font-medium">© 2026 Nexquire. Built for India&apos;s investors.</p>
        <div className="flex items-center gap-8">
           {['Features', 'GitHub', 'Contact'].map(l => (
             <a key={l} href="#" className="text-[13px] text-[#999] font-medium hover:text-black transition-colors">{l}</a>
           ))}
        </div>
      </footer>
    </div>
  )
}
