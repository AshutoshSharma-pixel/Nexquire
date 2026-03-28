"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ChevronRight, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, Scale, Timer, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveUserProfile } from "@/lib/db"
import { useAuth } from "@/contexts/AuthContext"

// --- TYPES ---
interface OnboardingData {
  age: number
  goals: string[]
  amount: number
  riskScore: number
  broker: string
  allocation?: { small: number; mid: number; large: number }
}

// --- COMPONENTS ---

const StepProgress = ({ step }: { step: number }) => {
  const steps = ["Profile", "Goals", "Amount", "Risk", "Broker"]
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-0">
        {steps.map((_, i) => (
          <React.Fragment key={i}>
            <div className="relative flex items-center justify-center">
              {i < step - 1 ? (
                <div className="w-[10px] h-[10px] rounded-full bg-black" />
              ) : i === step - 1 ? (
                <div className="relative flex items-center justify-center">
                  <div className="w-[18px] h-[18px] rounded-full border border-black/20" />
                  <div className="absolute w-[10px] h-[10px] rounded-full bg-black" />
                </div>
              ) : (
                <div className="w-[10px] h-[10px] rounded-full border-[1.5px] border-[#D0D0D0]" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-[48px] h-[1px] ${i < step - 1 ? "bg-black" : "bg-[#E0E0E0]"}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex gap-[34px] mt-1">
        {steps.map((s, i) => (
          <span key={i} className={`text-[10px] font-bold uppercase tracking-[1px] w-[24px] text-center ${i === step - 1 ? "text-black" : "text-[#999]"}`}>
            {s.charAt(0)}
          </span>
        ))}
      </div>
    </div>
  )
}

const AllocationBar = ({ label, percentage, value, color = "black" }: { label: string, percentage: number, value?: string, color?: string }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-[13px] text-[#666]">{label}</span>
      <span className="text-[13px] font-bold text-black">{value || `${percentage}%`}</span>
    </div>
    <div className="h-[6px] w-full bg-[#F0F0F0] rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full bg-black rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  </div>
)

const CheckmarkIcon = () => (
  <div className="w-20 h-20 rounded-full border-[3px] border-black flex items-center justify-center relative overflow-hidden group">
    <motion.svg 
      viewBox="0 0 24 24" 
      className="w-10 h-10 text-black"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <motion.path 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M5 13l4 4L19 7"
      />
    </motion.svg>
  </div>
)

// --- MAIN PAGE ---

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<OnboardingData>({
    age: 25,
    goals: [],
    amount: 10000,
    riskScore: 5,
    broker: ""
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [blueprint, setBlueprint] = useState<any>(null)

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("onboarding_progress")
    if (saved) {
      const parsed = JSON.parse(saved)
      setData(parsed.data)
      setStep(parsed.step)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("onboarding_progress", JSON.stringify({ step, data }))
  }, [step, data])

  const nextStep = () => {
    if (step === 5) {
      finalizeOnboarding()
    } else {
      setStep(s => s + 1)
    }
  }

  const prevStep = () => setStep(s => Math.max(1, s - 1))

  const finalizeOnboarding = async () => {
    setLoading(true)
    try {
      // 1. Get AI Blueprint
      const res = await fetch(`/api/onboarding/blueprint?user_id=${user?.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          age: data.age,
          income: "100000", 
          monthly_investable: data.amount,
          goal: data.goals[0] || "Wealth Creation",
          risk_score: data.riskScore,
          knowledge_level: "Intermediate",
          broker_preference: data.broker
        })
      })
      const bp = await res.json()
      setBlueprint(bp)
      
      // 2. Save to Firestore
      if (user) {
        await saveUserProfile(user.uid, {
          ...data,
          onboarding_completed: true,
          initial_blueprint: bp,
          updated_at: new Date().toISOString()
        })
      }
      
      setIsCompleted(true)
    } catch (e) {
      console.error("Onboarding finalization failed", e)
      setIsCompleted(true) // Fallback for UI 
    } finally {
      setLoading(false)
    }
  }

  // Derived Values
  const getRiskProfile = () => {
    if (data.age <= 23) return { label: "HIGH GROWTH PROFILE", color: "#10B981", small: 70, mid: 20, large: 10 }
    if (data.age <= 28) return { label: "BALANCED GROWTH PROFILE", color: "#2D6FF7", small: 50, mid: 30, large: 20 }
    if (data.age <= 35) return { label: "MODERATE PROFILE", color: "#F59E0B", small: 30, mid: 40, large: 30 }
    if (data.age <= 45) return { label: "CONSERVATIVE PROFILE", color: "#F97316", small: 15, mid: 25, large: 60 }
    return { label: "CAPITAL PRESERVATION", color: "#EF4444", small: 5, mid: 15, large: 80 }
  }

  const riskProfile = getRiskProfile()

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-[600px] w-full text-center"
        >
          <div className="flex justify-center mb-8">
            <CheckmarkIcon />
          </div>
          
          <h1 className="text-[36px] font-black tracking-[-2px] leading-tight mb-4">
            Your Investment Blueprint is ready.
          </h1>
          <p className="text-[17px] text-[#666] mb-12">
            Based on your profiling, we&apos;ve engineered a high-conviction path for your wealth.
          </p>

          <div className="bg-white border-[1.5px] border-[#E8E8E8] rounded-[24px] p-10 text-left shadow-[0_32px_80px_rgba(0,0,0,0.06)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Check size={80} strokeWidth={3} />
             </div>

             <div className="flex items-center gap-2 mb-8">
                <div className="w-1.5 h-6 bg-black rounded-full" />
                <h3 className="text-[13px] font-black uppercase tracking-[2px]">Core Allocation</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-10">
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#F0F0F0" strokeWidth="12" fill="transparent" />
                      <circle cx="64" cy="64" r="54" stroke="black" strokeWidth="12" fill="transparent" strokeDasharray="339" strokeDashoffset={339 - (339 * riskProfile.small / 100)} strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[20px] font-black">AI</span>
                   </div>
                </div>

                <div className="space-y-6">
                   <AllocationBar label="Small Cap" percentage={riskProfile.small} value={`₹${(data.amount * riskProfile.small / 100).toLocaleString()}`} />
                   <AllocationBar label="Mid Cap" percentage={riskProfile.mid} value={`₹${(data.amount * riskProfile.mid / 100).toLocaleString()}`} />
                   <AllocationBar label="Large Cap" percentage={riskProfile.large} value={`₹${(data.amount * riskProfile.large / 100).toLocaleString()}`} />
                </div>
             </div>

             <div className="border-t border-[#F0F0F0] pt-8">
                <p className="text-[12px] font-bold text-[#999] uppercase tracking-[1px] mb-4">Starter Recommendations</p>
                <div className="flex flex-wrap gap-2">
                   {["Quant Small Cap", "Nifty Next 50", "HDFC Mid Cap"].map(f => (
                     <span key={f} className="px-4 py-2 bg-[#F9F9F9] border border-[#E0E0E0] rounded-full text-[13px] font-bold text-black">{f}</span>
                   ))}
                </div>
             </div>
          </div>

          <Button 
            onClick={() => router.push("/dashboard")}
            className="w-full h-[64px] bg-black text-white hover:bg-[#222] rounded-[16px] text-[17px] font-black mt-12 transition-all hover:-translate-y-1 shadow-xl"
          >
            Let&apos;s go →
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#E8E8E8] py-5 px-12 flex justify-between items-center z-50 h-[80px]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/landing")}>
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="text-[17px] font-bold tracking-tight text-black">Nexquire</span>
        </div>

        <StepProgress step={step} />

        <button onClick={() => router.push("/dashboard")} className="text-[13px] font-bold text-[#999] hover:text-black transition-colors uppercase tracking-[1px]">
          Skip for now
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto pt-[140px] pb-[160px] px-8 flex justify-center">
        <div className="max-w-[560px] w-full mt-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-[11px] font-black tracking-[2.5px] text-[#999] uppercase mb-3">STEP 1 OF 5</div>
                <h2 className="text-[44px] font-black tracking-[-2.5px] leading-[1.1] mb-2">Tell us about yourself.</h2>
                <p className="text-[17px] text-[#666] mb-12 font-medium">We use this to build your personal investment blueprint.</p>

                <div className="mb-10">
                  <p className="text-[14px] font-bold text-black mb-6">How old are you?</p>
                  <div className="flex items-center gap-10">
                    <button 
                      onClick={() => setData({ ...data, age: Math.max(18, data.age - 1) })}
                      className="w-14 h-14 rounded-full border-[1.5px] border-[#E0E0E0] hover:border-black flex items-center justify-center text-[24px] font-light transition-all active:scale-90"
                    >—</button>
                    <div className="text-[88px] font-black tracking-[-5px] w-32 text-center select-none">{data.age}</div>
                    <button 
                      onClick={() => setData({ ...data, age: Math.min(80, data.age + 1) })}
                      className="w-14 h-14 rounded-full border-[1.5px] border-[#E0E0E0] hover:border-black flex items-center justify-center text-[24px] font-light transition-all active:scale-90"
                    >+</button>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8" style={{ backgroundColor: `${riskProfile.color}10`, borderColor: `${riskProfile.color}30` }}>
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: riskProfile.color }} />
                   <span className="text-[11px] font-black uppercase tracking-[1px]" style={{ color: riskProfile.color }}>{riskProfile.label}</span>
                </div>

                <div className="space-y-6 bg-[#FBFBFB] p-8 rounded-[24px] border border-[#F0F0F0]">
                   <p className="text-[13px] font-bold text-[#666] mb-2">Target Asset Allocation:</p>
                   <AllocationBar label="Small Cap" percentage={riskProfile.small} />
                   <AllocationBar label="Mid Cap" percentage={riskProfile.mid} />
                   <AllocationBar label="Large Cap" percentage={riskProfile.large} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-[11px] font-black tracking-[2.5px] text-[#999] uppercase mb-3">STEP 2 OF 5</div>
                <h2 className="text-[44px] font-black tracking-[-2.5px] leading-[1.1] mb-2">What are you investing for?</h2>
                <p className="text-[17px] text-[#666] mb-12 font-medium">Select one primary goal. We&apos;ll fine-tune the risk accordingly.</p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "wealth", emoji: "💰", title: "Wealth creation", desc: "Long-term growth" },
                    { id: "home", emoji: "🏠", title: "Buy a home", desc: "Down payment planning" },
                    { id: "retire", emoji: "🌴", title: "Retirement", desc: "Financial freedom" },
                    { id: "edu", emoji: "🎓", title: "Education", desc: "Child&apos;s future fund" },
                    { id: "em", emoji: "🛡️", title: "Emergency fund", desc: "3-6 months safety net" },
                    { id: "travel", emoji: "✈️", title: "Lifestyle", desc: "Experiences & life goals" }
                  ].map(g => {
                    const selected = data.goals.includes(g.title)
                    return (
                      <div 
                        key={g.id}
                        onClick={() => setData({ ...data, goals: [g.title] })}
                        className={`p-6 border-[1.5px] rounded-[20px] transition-all cursor-pointer text-center group ${selected ? "bg-black border-black border-[2px]" : "border-[#E0E0E0] hover:border-black"}`}
                      >
                        <div className="text-[32px] mb-4 group-hover:scale-110 transition-transform">{g.emoji}</div>
                        <div className={`text-[15px] font-bold mb-1 ${selected ? "text-white" : "text-black"}`}>{g.title}</div>
                        <div className={`text-[12px] ${selected ? "text-white/60" : "text-[#999]"}`}>{g.desc}</div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-[11px] font-black tracking-[2.5px] text-[#999] uppercase mb-3">STEP 3 OF 5</div>
                <h2 className="text-[44px] font-black tracking-[-2.5px] leading-[1.1] mb-2">Monthly investment.</h2>
                <p className="text-[17px] text-[#666] mb-12 font-medium">How much can you consistently put to work?</p>

                <div className="flex items-center gap-4 bg-white border-[1.5px] border-[#E0E0E0] focus-within:border-black rounded-[20px] px-8 py-6 mb-6 transition-all">
                  <span className="text-[40px] font-light text-[#BBB]">₹</span>
                  <input 
                    type="number"
                    value={data.amount}
                    onChange={(e) => setData({ ...data, amount: parseInt(e.target.value) || 0 })}
                    className="text-[48px] font-black tracking-[-2.5px] w-full outline-none leading-none"
                    placeholder="10,000"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-12">
                  {[5000, 10000, 25000, 50000, 100000].map(v => (
                    <button 
                      key={v}
                      onClick={() => setData({ ...data, amount: v })}
                      className={`px-5 py-2.5 rounded-full border-[1.5px] text-[13px] font-bold transition-all ${data.amount === v ? "bg-black border-black text-white" : "border-[#E8E8E8] hover:border-black"}`}
                    >
                      ₹{v.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="space-y-6 pt-10 border-t border-[#F0F0F0]">
                  <p className="text-[14px] text-[#666] mb-6">Your monthly ₹{data.amount.toLocaleString()} will be split as:</p>
                  <AllocationBar label="Small Cap" percentage={riskProfile.small} value={`₹${(data.amount * riskProfile.small / 100).toLocaleString()}`} />
                  <AllocationBar label="Mid Cap" percentage={riskProfile.mid} value={`₹${(data.amount * riskProfile.mid / 100).toLocaleString()}`} />
                  <AllocationBar label="Large Cap" percentage={riskProfile.large} value={`₹${(data.amount * riskProfile.large / 100).toLocaleString()}`} />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-[11px] font-black tracking-[2.5px] text-[#999] uppercase mb-3">STEP 4 OF 5</div>
                <h2 className="text-[44px] font-black tracking-[-2.5px] leading-[1.1] mb-2">About risk.</h2>
                <p className="text-[17px] text-[#666] mb-12 font-medium">Fine-tune your allocation based on your conviction.</p>

                <p className="text-[15px] font-bold mb-8 italic text-center p-6 bg-black text-white rounded-[20px]">
                  &ldquo;If your ₹10,000 investment dropped to ₹7,000 tomorrow, what would you do?&rdquo;
                </p>

                <div className="space-y-4">
                  {[
                    { s: 1, icon: <AlertCircle className="text-red-500" />, text: "Sell everything immediately", sub: "Priority: Capital Protection" },
                    { s: 3, icon: <Scale className="text-orange-500" />, text: "Sell some to reduce exposure", sub: "Action: Tactical De-risking" },
                    { s: 6, icon: <Timer className="text-blue-500" />, text: "Hold and wait", sub: "Philosophy: Market Resilience" },
                    { s: 10, icon: <Zap className="text-green-500" />, text: "Buy more — it's on sale!", sub: "Perspective: Strategic Growth" }
                  ].map(opt => {
                    const selected = data.riskScore === opt.s
                    return (
                      <div 
                        key={opt.s}
                        onClick={() => setData({ ...data, riskScore: opt.s })}
                        className={`flex items-center gap-5 p-6 border-[1.5px] rounded-[20px] transition-all cursor-pointer ${selected ? "border-black bg-[#FBFBFB] shadow-sm ml-2" : "border-[#E0E0E0] hover:border-black"}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-[#F0F0F0] flex items-center justify-center">
                          {React.cloneElement(opt.icon as any, { size: 24 })}
                        </div>
                        <div>
                          <div className="text-[16px] font-bold">{opt.text}</div>
                          <div className="text-[13px] text-[#999]">{opt.sub}</div>
                        </div>
                        {selected && <Check className="ml-auto text-black" size={20} />}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-[11px] font-black tracking-[2.5px] text-[#999] uppercase mb-3">STEP 5 OF 5</div>
                <h2 className="text-[44px] font-black tracking-[-2.5px] leading-[1.1] mb-2">Your broker.</h2>
                <p className="text-[17px] text-[#666] mb-12 font-medium">We&apos;ll sync with your preferred platform.</p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "groww", name: "Groww", tag: "Best for beginners" },
                    { id: "zerodha", name: "Zerodha", tag: "Best for traders" },
                    { id: "angel", name: "Angel One", tag: "Best for research" },
                    { id: "upstox", name: "Upstox", tag: "Low cost" },
                    { id: "paytm", name: "Paytm Money", tag: "Easy SIP" },
                    { id: "ai", name: "Help me choose", tag: "AI recommendation" }
                  ].map(b => {
                    const selected = data.broker === b.name
                    return (
                      <div 
                        key={b.id}
                        onClick={() => setData({ ...data, broker: b.name })}
                        className={`p-6 border-[1.5px] rounded-[20px] transition-all cursor-pointer text-center group ${selected ? "bg-black border-black text-white" : "border-[#E0E0E0] hover:border-black"}`}
                      >
                        <div className={`text-[17px] font-black mb-1 ${selected ? "text-white" : "text-black"}`}>{b.name}</div>
                        <div className={`text-[12px] ${selected ? "text-white/60" : "text-[#999]"}`}>{b.tag}</div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] py-6 px-12 flex justify-between items-center h-[100px] z-50">
        <button 
          onClick={prevStep}
          className={`text-[15px] font-bold flex items-center gap-2 transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "text-[#999] hover:text-black"}`}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-bold text-[#BBB] uppercase tracking-[1px] pointer-events-none">
          {step} of 5
        </div>

        <Button 
          onClick={nextStep}
          disabled={loading || (step === 2 && data.goals.length === 0) || (step === 5 && !data.broker)}
          className="bg-black text-white hover:bg-[#222] px-10 py-4 h-[56px] rounded-[14px] text-[16px] font-black transition-all hover:translate-x-1 disabled:opacity-30 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
        </Button>
      </div>
    </div>
  )
}
