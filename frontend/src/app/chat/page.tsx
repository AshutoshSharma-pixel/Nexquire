"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles, User, Bot, Loader2, ArrowRight, Shield, Zap, Globe } from "lucide-react"
import { api } from "@/lib/api"

const TypingIndicator = () => (
  <div className="flex gap-1.5 p-4 rounded-2xl glass border-white/5 w-16 items-center justify-center">
    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
  </div>
)

export default function WealthChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your Nexquire AI CFO. I'm aware of your profile and today's market signals. How can I help you build wealth today?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages([...messages, { role: "user", content: userMsg }])
    setInput("")
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Based on your current portfolio and the recent FII outflow I'm tracking, it's wise to hold your current Small Cap positions but pause new lump sum investments. The Nifty PE is stable at 23.4, but global volatility warrants a cautious 15% cash position. Would you like a detailed breakdown?" 
      }])
    }, 1500)
  }

  const prompts = [
    "Should I invest now?",
    "What do I do with my ₹50,000 bonus?",
    "Am I on track for retirement?",
    "Explain LTCG in simple terms"
  ]

  return (
    <div className="h-screen bg-background flex flex-col p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            AI Wealth Chat <Badge className="bg-primary/10 text-primary border-primary/20">Beta</Badge>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Portfolio-aware. Geopolitical-aware. Jargon-free.</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-success"><Globe size={14} /> Live Intelligence</span>
          <span className="flex items-center gap-1.5 text-primary"><Sparkles size={14} /> Portfolio Linked</span>
        </div>
      </header>

      <ScrollArea className="flex-1 pr-4 mb-4 border border-white/5 rounded-3xl bg-secondary/5 p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent blur-3xl" />
        <div className="space-y-8 relative z-10">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-4`}
              >
                {msg.role === "assistant" && (
                   <div className="w-10 h-10 rounded-xl glass border-primary/30 flex items-center justify-center text-primary shrink-0 self-end">
                      <Bot size={20} />
                   </div>
                )}
                <div className={`max-w-[80%] p-5 rounded-3xl ${
                  msg.role === "user" 
                    ? "bg-primary text-white rounded-br-none shadow-[0_4px_15px_rgba(45,111,247,0.3)]" 
                    : "glass text-foreground border-white/10 rounded-bl-none shadow-premium leading-relaxed"
                }`}>
                  <p className="text-sm md:text-base">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                   <div className="w-10 h-10 rounded-xl glass border-white/20 flex items-center justify-center text-white shrink-0 self-end">
                      <User size={20} />
                   </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl glass border-primary/30 flex items-center justify-center text-primary shrink-0 self-end opacity-50">
                    <Bot size={20} />
                 </div>
                 <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {prompts.map(p => (
            <button 
              key={p} 
              onClick={() => setInput(p)}
              className="px-4 py-2 rounded-xl glass border-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/10 hover:text-white transition-all whitespace-nowrap"
            >
              <Zap size={12} className="inline mr-1.5 text-primary" /> {p}
            </button>
          ))}
        </div>
        <div className="flex gap-3 relative md:px-20">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask anything about your wealth..." 
            className="flex-1 h-16 bg-white/5 border-white/10 rounded-2xl pr-16 focus-visible:ring-primary shadow-inner text-white text-lg px-6" 
          />
          <Button 
            onClick={handleSend}
            className="absolute right-2 md:right-22 top-2 h-12 w-12 bg-primary hover:bg-primary/90 rounded-xl p-0 shadow-[0_0_20px_rgba(45,111,247,0.4)]"
          >
            <Send size={24} className="text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${className}`}>
      {children}
    </span>
  )
}
