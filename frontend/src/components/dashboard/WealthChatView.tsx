"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp, Loader2, RefreshCw, TrendingUp, TrendingDown, Wallet, Zap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

type ChatRole = "user" | "assistant"

export type ChatLine = {
  id: string
  role: ChatRole
  content: string
  createdAt: number
  failed?: boolean
  actions?: Array<{label: string, url: string}>
  followUps?: Array<{text: string}>
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function formatInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-gray-900">
          {p.slice(2, -2)}
        </strong>
      )
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
          <li key={j} className="text-sm leading-relaxed">
            {formatInline(item, `li-${base}-${j}`)}
          </li>
        ))}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((line, idx) => {
    const t = line.trim()
    if (t.startsWith("- ") || t.startsWith("• ")) {
      listBuf.push(t.slice(2))
      return
    }
    flushList(idx)
    if (!t) {
      nodes.push(<div key={`sp-${idx}`} className="h-1.5" />)
      return
    }
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
  if (i === -1) {
    marker = "💡 Your Action Today:"
    i = full.indexOf(marker)
  }
  if (i === -1) return { body: full, action: null as string | null }
  return { body: full.slice(0, i).trim(), action: full.slice(i).trim() }
}

function AiBubble({ content, actions }: { content: string, actions?: Array<{label: string, url: string}> }) {
  const { body, action } = splitActionSection(content)
  return (
    <div className="space-y-2.5">
      {body && <MarkdownBlock text={body} />}
      {action && (
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 px-4 py-3">
          <MarkdownBlock text={action} />
        </div>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((act, i) => (
            <a
              key={i}
              href={act.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-bold tracking-wide text-white shadow hover:bg-gray-700 transition"
            >
              {act.label} <ArrowUp className="w-3 h-3 rotate-45" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Quick Prompts ─────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: "📊", text: "Portfolio Health Check" },
  { icon: "🔍", text: "Find Better Funds For Me" },
  { icon: "🌐", text: "Geopolitical Impact Today" },
  { icon: "🧾", text: "Tax Optimization Opportunities" },
  { icon: "⏱️", text: "Should I Invest Now or Wait?" },
  { icon: "📈", text: "Compare Nifty vs My Portfolio" },
  { icon: "⚖️", text: "Diversification Score" },
  { icon: "🎯", text: "Goal-Based Planning" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
    <div className="flex gap-3">
      {/* AI Avatar */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
        <span className="bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-xs font-black text-transparent">N</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-gray-400"
                animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </div>
          {slowHint && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-400"
            >
              Taking longer than usual…
            </motion.span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Portfolio Snapshot Strip ─────────────────────────────────────────────────

function PortfolioStrip({ ctx }: { ctx: CtxType }) {
  const isBeating = ctx.bench === "beating"
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
          <Wallet className="h-3.5 w-3.5 text-gray-600" />
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Portfolio</div>
          <div className="text-sm font-bold text-gray-900">{ctx.display}</div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-sm">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isBeating ? "bg-emerald-50" : "bg-red-50"}`}>
          {isBeating
            ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            : <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          }
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">XIRR</div>
          <div className={`text-sm font-bold ${isBeating ? "text-emerald-600" : "text-red-500"}`}>
            {ctx.xirr}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
          <Zap className="h-3.5 w-3.5 text-blue-600" />
        </div>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Monthly SIP</div>
          <div className="text-sm font-bold text-gray-900">
            ₹{Number(ctx.sip).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WealthChatView({ standalone }: { standalone?: boolean }) {
  const { user } = useAuth()
  const uid = user?.uid ?? "anonymous"
  const userName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Investor"
  const userInitials =
    user?.displayName
      ?.split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "ME"

  const [messages, setMessages] = useState<ChatLine[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [slowHint, setSlowHint] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [ctx, setCtx] = useState<CtxType | null>(null)
  const [market, setMarket] = useState<MarketLite | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef<ChatLine[]>([])

  useEffect(() => { messagesRef.current = messages }, [messages])

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }))
  }
  useEffect(() => scrollToBottom(), [messages, loading])

  // Fetch market status
  useEffect(() => {
    fetch(`${API_URL}/api/market/status`)
      .then((r) => r.json())
      .then(setMarket)
      .catch(() => setMarket(null))
  }, [])

  // Fetch portfolio context
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${API_URL}/api/chat/context/${encodeURIComponent(uid)}`)
        const data = r.ok ? await r.json() : null
        if (cancelled || !data) return
        setCtx({
          display: data.portfolio_value_display || "₹12,45,000",
          xirr: typeof data.xirr === "number" ? data.xirr : 11.2,
          sip: typeof data.monthly_sip === "number" ? data.monthly_sip : 8000,
          bench: data.benchmark_comparison === "beating" ? "beating" : "trailing",
        })
      } catch {
        if (!cancelled) {
          setCtx({ display: "₹12,45,000", xirr: 11.2, sip: 8000, bench: "trailing" })
        }
      }
    })()
    return () => { cancelled = true }
  }, [uid])

  // Generate welcome message once context is loaded
  useEffect(() => {
    if (!ctx) return
    const benchLine =
      ctx.bench === "beating"
        ? "You're beating the benchmark — let's protect and grow that edge."
        : "Your returns are trailing the Nifty 50 — let's fix that."
    const welcome: ChatLine = {
      id: "welcome",
      role: "assistant",
      content:
        `Good ${greetingPeriod()}, ${userName}. 👋\n\n` +
        `I'm your Nexquire AI CFO — I have full visibility into your portfolio and the markets.\n\n` +
        `Your portfolio stands at **${ctx.display}** with an XIRR of **${ctx.xirr}%**.\n` +
        `${benchLine}\n\n` +
        `What would you like to work on today?`,
      createdAt: Date.now(),
    }
    setMessages((m) => (m.length === 0 ? [welcome] : m))
  }, [ctx, userName])

  // ─── API call ──────────────────────────────────────────────────────────────

  // Keep Gemini-style history separately for the API
  const [geminiHistory, setGeminiHistory] = useState<{ role: string; parts: string[] }[]>([])

  const sendMessages = useCallback(
    async (text: string, optimisticUser?: ChatLine) => {
      setApiError(null)
      setLoading(true)
      setSlowHint(false)
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
      slowTimerRef.current = setTimeout(() => setSlowHint(true), 10_000)

      const assistantId = `a-${Date.now()}`
      let fullReply = ""

      try {
        const res = await fetch(`${API_URL}/api/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            user_id: uid === "anonymous" ? "demo_user" : uid,
            history: geminiHistory,
          }),
        })

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

        const assistant: ChatLine = {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
        }

        setMessages((prev) => {
          const base = prev.filter((x) => x.id !== optimisticUser?.id || !x.failed)
          return [...base.filter((x) => !x.failed), assistant]
        })

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        
        // Remove typing slow hint once we start getting chunks
        setLoading(false)

        let actions: any[] | undefined
        let followUps: any[] | undefined
        
        let buffer = ""
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" // keep partial line for next iteration
          
          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              try {
                const jsonStr = line.replace(/^data:\s*/, "")
                const data = JSON.parse(jsonStr)
                if (data.chunk !== undefined) {
                  fullReply += data.chunk
                  setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullReply } : m))
                }
                if (data.metadata) {
                  actions = data.metadata.actions
                  followUps = data.metadata.follow_ups
                  setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, actions, followUps } : m))
                }
              } catch (e) {} // ignore invalid mid-stream bits
            }
          }
        }

        if (!fullReply) throw new Error("Empty response stream")

        setGeminiHistory((prev) => [
          ...prev,
          { role: "user", parts: [text] },
          { role: "model", parts: [fullReply] },
        ])

      } catch (err: any) {
        setApiError("Backend offline or connection failed — make sure backend is running.")
        if (optimisticUser) {
          setMessages((prev) => [
            ...prev.filter((x) => x.id !== optimisticUser.id && x.id !== assistantId),
            { ...optimisticUser, failed: true },
          ])
        } else {
            setMessages((prev) => prev.filter((x) => x.id !== assistantId))
        }
      } finally {
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
        setSlowHint(false)
        setLoading(false)
      }
    },
    [uid, geminiHistory]
  )

  const handleSend = async (raw: string) => {
    const text = raw.trim()
    if (!text || loading) return

    const userLine: ChatLine = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
    }

    setMessages((prev) => [...prev, userLine])
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    await sendMessages(text, userLine)
  }

  const retryFailed = async (line: ChatLine) => {
    if (line.role !== "user") return
    setMessages((prev) => prev.filter((x) => x.id !== line.id))
    const freshUser: ChatLine = {
      id: `u-${Date.now()}`,
      role: "user",
      content: line.content,
      createdAt: Date.now(),
    }
    setMessages((prev) => [...prev, freshUser])
    await sendMessages(line.content, freshUser)
  }

  const onQuickPrompt = (q: string) => void handleSend(q)

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend(input)
    }
  }

  const adjustTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const marketOpen = market?.is_open === true || market?.status === "open"
  const marketLabel = marketOpen ? "OPEN" : market ? "CLOSED" : "…"

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`flex flex-col gap-5 ${standalone ? "h-[calc(100vh-52px)]" : "min-h-[calc(100vh-14rem)]"}`}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-gray-900">AI Wealth Chat</h2>
            {/* Market status badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                marketOpen
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${marketOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {marketLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-900">{userName}</span>.{" "}
            Your personal AI CFO is ready.
          </p>
        </div>

        {/* Portfolio snapshot strip */}
        {ctx && <PortfolioStrip ctx={ctx} />}
      </div>

      {/* ── Market closed banner ────────────────────────────────────────── */}
      {!marketOpen && market && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3"
        >
          <span className="text-amber-500">⏰</span>
          <p className="text-sm font-medium text-amber-800">
            Markets are closed — plan and research now; execute when the session opens.
          </p>
        </motion.div>
      )}

      {/* ── API Error banner ────────────────────────────────────────────── */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <span className="text-red-500">⚠️</span>
            <p className="flex-1 text-sm font-medium text-red-700">{apiError}</p>
            <button
              onClick={() => setApiError(null)}
              className="text-red-400 hover:text-red-600 text-xs font-bold"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Prompts ───────────────────────────────────────────────── */}
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_PROMPTS.map((p, i) => (
          <motion.button
            key={p.text}
            type="button"
            disabled={loading}
            onClick={() => onQuickPrompt(`${p.icon} ${p.text}`)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {p.icon} {p.text}
          </motion.button>
        ))}
      </div>

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 md:p-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    m.role === "user"
                      ? "bg-gray-900 text-white shadow-md"
                      : "border border-gray-200 bg-white shadow-sm text-gray-900"
                  }`}
                >
                  {m.role === "user" ? userInitials : "N"}
                </div>

                {/* Bubble */}
                <div className={`max-w-[min(100%,42rem)] ${m.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-2xl px-4 py-3 text-left ${
                      m.role === "user"
                        ? "rounded-tr-sm bg-gray-900 text-white shadow-md"
                        : "rounded-tl-sm border border-gray-100 bg-white text-gray-900 shadow-sm"
                    } ${m.failed ? "opacity-60" : ""}`}
                  >
                    {m.role === "assistant"
                      ? <AiBubble content={m.content} actions={m.actions} />
                      : <p className="whitespace-pre-wrap text-sm text-white">{m.content}</p>
                    }
                  </div>

                  {/* Contextual Follow-ups */}
                  {m.role === "assistant" && m.followUps && m.followUps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.followUps.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(chip.text)}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {chip.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`mt-2 text-[10px] text-gray-400 ${m.role === "user" ? "text-right" : ""}`}>
                    {formatTime(m.createdAt)}
                    {m.failed && <span className="ml-2 text-red-400 font-medium">Failed</span>}
                  </div>

                  {/* Retry button */}
                  {m.failed && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      type="button"
                      onClick={() => retryFailed(m)}
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-900 transition-all ${
                        m.role === "user" ? "ml-auto" : ""
                      }`}
                    >
                      <RefreshCw className="h-3 w-3" /> Retry
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && <TypingDots slowHint={slowHint} />}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Area ──────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50/60 p-3 md:p-4">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea() }}
              onKeyDown={onKeyDown}
              placeholder="Ask your AI CFO anything…"
              className="max-h-[120px] min-h-[46px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
              disabled={loading}
            />
            <motion.button
              type="button"
              disabled={loading || !input.trim()}
              onClick={() => void handleSend(input)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-700"
              aria-label="Send"
            >
              {loading
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <ArrowUp className="h-5 w-5" />
              }
            </motion.button>
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
