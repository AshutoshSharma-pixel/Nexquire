"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUp, Loader2, RefreshCw, TrendingUp, TrendingDown,
  Wallet, Zap, BarChart2, Globe, Shield, Target, Clock,
  AlertCircle, ChevronRight, Send
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

type ChatRole = "user" | "assistant"

export type ChatLine = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  failed?: boolean
  actions?: Array<{ label: string; url: string }>
  followUps?: Array<{ text: string }>
}

// ─── Markdown Renderer ─────────────────────────────────────────────────────────

function formatInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>
    }
    return <span key={`${keyPrefix}-s-${i}`}>{p}</span>
  })
}

function MarkdownBlock({ text, isUser }: { text: string; isUser?: boolean }) {
  const lines = text.split("\n")
  const nodes: React.ReactNode[] = []
  let listBuf: string[] = []

  const flushList = (base: number) => {
    if (!listBuf.length) return
    nodes.push(
      <ul key={`ul-${base}`} className={`my-2 ml-4 list-disc space-y-1 ${isUser ? "text-white/90" : "text-gray-700"}`}>
        {listBuf.map((item, j) => (
          <li key={j} className="text-sm leading-relaxed">{formatInline(item, `li-${base}-${j}`)}</li>
        ))}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((line, idx) => {
    const t = line.trim()
    if (t.startsWith("- ") || t.startsWith("• ")) { listBuf.push(t.slice(2)); return }
    flushList(idx)
    if (!t) { nodes.push(<div key={`sp-${idx}`} className="h-1.5" />); return }
    nodes.push(
      <p key={`p-${idx}`} className={`mb-1.5 text-sm leading-relaxed ${isUser ? "text-white" : "text-gray-800"}`}>
        {formatInline(t, `p-${idx}`)}
      </p>
    )
  })
  flushList(lines.length)
  return <div>{nodes}</div>
}

function splitActionSection(full: string) {
  let marker = "💡 Do this today:"
  let i = full.indexOf(marker)
  if (i === -1) { marker = "💡 Your Action Today:"; i = full.indexOf(marker) }
  if (i === -1) return { body: full, action: null as string | null }
  return { body: full.slice(0, i).trim(), action: full.slice(i).trim() }
}

function AiBubble({ content, actions }: { content: string; actions?: Array<{ label: string; url: string }> }) {
  const { body, action } = splitActionSection(content)
  return (
    <div className="space-y-2.5">
      {body && <MarkdownBlock text={body} />}
      {action && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <MarkdownBlock text={action.replace("💡 ", "").replace("Do this today:", "Action:")} />
        </div>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((act, i) => (
            <a key={i} href={act.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              {act.label} <ChevronRight className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Quick Prompts ─────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: BarChart2, text: "Portfolio Health Check" },
  { icon: TrendingUp, text: "Find Better Funds For Me" },
  { icon: Globe, text: "Geopolitical Impact Today" },
  { icon: Shield, text: "Tax Optimization" },
  { icon: Clock, text: "Invest Now or Wait?" },
  { icon: Target, text: "Diversification Score" },
  { icon: Zap, text: "Goal-Based Planning" },
]

function greetingPeriod() {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

type CtxType = { display: string; xirr: number; sip: number; bench: string }
type MarketLite = { is_open?: boolean; status?: string }

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots({ slowHint }: { slowHint: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">N</div>
      <div className="rounded-xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
          {slowHint && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-gray-400">
              Consulting AI…
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WealthChatView({ standalone }: { standalone?: boolean }) {
  const { user } = useAuth()
  const uid = user?.uid ?? "anonymous"
  const userName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Investor"
  const userInitials =
    user?.displayName?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() || "ME"

  const [messages, setMessages] = useState<ChatLine[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [slowHint, setSlowHint] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [ctx, setCtx] = useState<CtxType | null>(null)
  const [market, setMarket] = useState<MarketLite | null>(null)
  const [geminiHistory, setGeminiHistory] = useState<{ role: string; parts: string[] }[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToBottom = () => { requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })) }
  useEffect(() => { scrollToBottom() }, [messages, loading])

  useEffect(() => {
    fetch(`${API_URL}/api/market/status`).then(r => r.json()).then(setMarket).catch(() => setMarket(null))
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${API_URL}/api/chat/context/${encodeURIComponent(uid)}`)
        const data = r.ok ? await r.json() : null
        if (cancelled || !data) return
        setCtx({ display: data.portfolio_value_display || "₹12,45,000", xirr: data.xirr ?? 11.2, sip: data.monthly_sip ?? 8000, bench: data.benchmark_comparison === "beating" ? "beating" : "trailing" })
      } catch {
        if (!cancelled) setCtx({ display: "₹12,45,000", xirr: 11.2, sip: 8000, bench: "trailing" })
      }
    })()
    return () => { cancelled = true }
  }, [uid])

  useEffect(() => {
    if (!ctx) return
    const benchLine = ctx.bench === "beating"
      ? `Portfolio beating benchmark — XIRR at ${ctx.xirr}%. Let's protect and grow that edge.`
      : `Returns trailing Nifty 50 — XIRR at ${ctx.xirr}%. I have recommendations ready.`
    const welcome: ChatLine = {
      id: "welcome", role: "assistant",
      content: `Good ${greetingPeriod()}, ${userName}.\n\nI'm your Nexquire AI CFO — I have full visibility into your portfolio at **${ctx.display}** and the markets.\n\n${benchLine}\n\nWhat would you like to analyse today?`,
      createdAt: Date.now(),
    }
    setMessages(m => m.length === 0 ? [welcome] : m)
  }, [ctx, userName])

  const sendMessages = useCallback(async (text: string, optimisticUser?: ChatLine) => {
    setApiError(null); setLoading(true); setSlowHint(false)
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
    slowTimerRef.current = setTimeout(() => setSlowHint(true), 10_000)
    const assistantId = `a-${Date.now()}`
    let fullReply = ""

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, user_id: uid === "anonymous" ? "demo_user" : uid, history: geminiHistory }),
      })
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

      const assistant: ChatLine = { id: assistantId, role: "assistant", content: "", createdAt: Date.now() }
      setMessages(prev => {
        const base = prev.filter(x => x.id !== optimisticUser?.id || !x.failed)
        return [...base.filter(x => !x.failed), assistant]
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      setLoading(false)
      let actions: any[] | undefined, followUps: any[] | undefined, buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n"); buffer = lines.pop() || ""
        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace(/^data:\s*/, ""))
              if (data.chunk !== undefined) { fullReply += data.chunk; setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullReply } : m)) }
              if (data.metadata) { actions = data.metadata.actions; followUps = data.metadata.follow_ups; setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, actions, followUps } : m)) }
            } catch {}
          }
        }
      }

      if (!fullReply) throw new Error("Empty response")
      setGeminiHistory(prev => [...prev, { role: "user", parts: [text] }, { role: "model", parts: [fullReply] }])
    } catch {
      setApiError("Backend offline — make sure the backend is running on port 8000.")
      if (optimisticUser) {
        setMessages(prev => [...prev.filter(x => x.id !== optimisticUser.id && x.id !== assistantId), { ...optimisticUser, failed: true }])
      } else setMessages(prev => prev.filter(x => x.id !== assistantId))
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
      setSlowHint(false); setLoading(false)
    }
  }, [uid, geminiHistory])

  const handleSend = async (raw: string) => {
    const text = raw.trim(); if (!text || loading) return
    const userLine: ChatLine = { id: `u-${Date.now()}`, role: "user", content: text, createdAt: Date.now() }
    setMessages(prev => [...prev, userLine]); setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    await sendMessages(text, userLine)
  }

  const retryFailed = async (line: ChatLine) => {
    if (line.role !== "user") return
    setMessages(prev => prev.filter(x => x.id !== line.id))
    const fresh: ChatLine = { id: `u-${Date.now()}`, role: "user", content: line.content, createdAt: Date.now() }
    setMessages(prev => [...prev, fresh]); await sendMessages(line.content, fresh)
  }

  const adjustTextarea = () => {
    const el = textareaRef.current; if (!el) return
    el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const marketOpen = market?.is_open === true || market?.status === "open"
  const marketLabel = marketOpen ? "OPEN" : market ? "CLOSED" : "…"

  return (
    <div className={`flex flex-col gap-0 ${standalone ? "h-[calc(100vh-52px)]" : "min-h-[calc(100vh-14rem)]"}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between pb-5 mb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Wealth Chat</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personal AI CFO · Gemini 2.0 Flash · Real-time market data</p>
        </div>
        {/* Compact portfolio snapshot */}
        {ctx && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Portfolio</p>
              <p className="text-base font-bold font-mono text-gray-900">{ctx.display}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">XIRR</p>
              <p className={`text-base font-bold font-mono ${ctx.bench === "beating" ? "text-emerald-600" : "text-red-500"}`}>{ctx.xirr}%</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${marketOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${marketOpen ? "text-emerald-600" : "text-amber-600"}`}>{marketLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Prompts ── */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {QUICK_PROMPTS.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.button key={p.text} type="button" disabled={loading}
              onClick={() => handleSend(p.text)}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="shrink-0 flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:border-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Icon className="w-3.5 h-3.5" />
              {p.text}
            </motion.button>
          )
        })}
      </div>

      {/* ── Alerts ── */}
      <AnimatePresence>
        {apiError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 border border-red-200 bg-red-50 rounded-xl px-4 py-2.5 mb-3"
          >
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="flex-1 text-xs font-medium text-red-700">{apiError}</p>
            <button onClick={() => setApiError(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
          </motion.div>
        )}
        {!marketOpen && market && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 border border-amber-200 bg-amber-50/60 rounded-xl px-4 py-2.5 mb-3"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-800">Markets are closed — plan and research now; execute when the session opens at 9:15 AM IST.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white" style={{ minHeight: 420 }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center">
                <span className="text-lg font-black text-white">N</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Loading your portfolio context…</p>
                <p className="text-xs text-gray-400 mt-1">Your AI CFO is ready to answer any question</p>
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  m.role === "user" ? "bg-gray-900 text-white" : "bg-indigo-600 text-white"
                }`}>
                  {m.role === "user" ? userInitials : "N"}
                </div>

                {/* Bubble */}
                <div className={`max-w-[min(100%,44rem)] ${m.role === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block text-left px-4 py-3 rounded-xl ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-gray-900 text-white shadow-sm"
                      : "rounded-tl-sm border border-gray-100 bg-white text-gray-900 shadow-sm"
                  } ${m.failed ? "opacity-60" : ""}`}>
                    {m.role === "assistant"
                      ? <AiBubble content={m.content} actions={m.actions} />
                      : <p className="whitespace-pre-wrap text-sm text-white">{m.content}</p>
                    }
                  </div>

                  {/* Follow-ups */}
                  {m.role === "assistant" && m.followUps && m.followUps.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {m.followUps.map((chip, i) => (
                        <button key={i} onClick={() => handleSend(chip.text)} disabled={loading}
                          className="flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:border-indigo-400 hover:text-indigo-700 transition-all disabled:opacity-50 shadow-sm"
                        >
                          {chip.text} <ChevronRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`mt-1.5 text-[10px] text-gray-400 font-mono ${m.role === "user" ? "text-right" : ""}`}>
                    {formatTime(m.createdAt)}
                    {m.failed && <span className="ml-2 text-red-400 font-medium">· Failed</span>}
                  </div>

                  {/* Retry */}
                  {m.failed && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} type="button"
                      onClick={() => retryFailed(m)}
                      className={`mt-1.5 inline-flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all ${m.role === "user" ? "ml-auto" : ""}`}
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && <TypingDots slowHint={slowHint} />}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-gray-100 bg-gray-50/40 px-4 py-3">
          <div className="flex items-end gap-2.5">
            <textarea ref={textareaRef} rows={1} value={input}
              onChange={e => { setInput(e.target.value); adjustTextarea() }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(input) } }}
              placeholder="Ask your AI CFO anything..."
              className="max-h-[120px] min-h-[42px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              disabled={loading}
            />
            <motion.button type="button" disabled={loading || !input.trim()}
              onClick={() => void handleSend(input)}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-700"
              aria-label="Send"
            >
              {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            </motion.button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
