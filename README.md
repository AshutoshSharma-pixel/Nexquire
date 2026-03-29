# Nexquire 🏹 — Invest with Intelligence

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini 2.0](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

**Nexquire** is an institutional-grade wealth intelligence platform that combines a premium Investment Terminal UI with the cognitive power of **Google Gemini 2.0 Flash**. It transforms complex raw market data and portfolio holdings into actionable wealth-building strategies — providing a sophisticated command center for the modern investor.

---

## 🏛️ Architecture

Nexquire is built on a high-performance, distributed architecture designed for low-latency intelligence delivery.

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 Frontend                       │
│  Dashboard · Fund Screener · Portfolio X-Ray · AI Chat      │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST / SSE Streaming
┌─────────────────────▼───────────────────────────────────────┐
│                    FastAPI Backend                           │
│  /api/market · /api/portfolio · /api/ai · /api/chat         │
└───────┬─────────────┬──────────────────┬────────────────────┘
        │             │                  │
   MFAPI.in      NewsAPI.org       Gemini 2.0 Flash
  (Live NAVs)   (Market News)     (AI Synthesis)
```

### **Frontend** — Next.js 15 App Router
- **Design System**: Custom "Investment Terminal" aesthetic — monochrome-first palette, sharp geometry (`12-16px` radius), `font-mono` tabular numbers for all financial figures
- **Animations**: `framer-motion` for deliberate, institutional-grade transitions
- **Auth**: Firebase Authentication with protected route wrappers
- **Chat**: Server-Sent Events (SSE) streaming for real-time AI responses

### **Backend** — FastAPI
- **Intelligence**: Google Gemini 2.0 Flash for portfolio analysis, chat, and fund screening
- **Real-Time NAV**: `mfapi.in` with 5-minute in-memory cache for live fund valuations
- **News Feed**: NewsAPI integration for geopolitical and market intelligence
- **XIRR Engine**: `scipy.optimize.brentq` for precision annualized return calculation
- **PDF Parsing**: `pdfplumber` multi-vector CAMS/KFintech statement parser

---

## 💎 Feature Modules

### **1. Portfolio X-Ray — AI Audit Engine**
The flagship feature. Upload a CAMS/KFintech consolidated statement (PDF) or enter holdings manually to get a full institutional AI audit:

- **Live NAV Valuation** — Real-time portfolio value via MFAPI (updates daily at 9 PM IST)
- **XIRR Calculator** — True annualized return using Brent's method (handles SIPs/lumpsum)
- **AI Grade (A–F)** — Gemini 2.0 assigns a portfolio quality score with reasoning
- **Audit Findings** — HIGH/MED/LOW severity issues (expense ratio leaks, overlap, concentration)
- **Stress Test Risk Matrix** — 4-scenario crash simulation (Nifty −20%, Crude $120, Rupee −10%, RBI hike)
- **Fund Overlap Engine** — Stock-level duplicate detection across all held funds
- **Strategic Alternatives** — AI-recommended fund switches with rationale and expected improvement
- **Tax Harvesting** — STCG/LTCG eligible fund identification
- **WhatsApp Share** — One-click share of audit report (Grade + Value + XIRR)

### **2. AI Fund Screener**
Institutional-grade fund discovery across 9 categories:

| Category | Description |
|----------|-------------|
| Large Cap | Top 100 blue-chip stability funds |
| Mid Cap | High-growth emerging market leaders |
| Small Cap | Alpha-generating micro/small cap funds |
| Flexicap | Unconstrained multi-cap allocation |
| Gold & Silver | Precious metals ETF/FOF exposure |
| Commodities | Diversified commodity basket funds |
| ETFs | Nifty 50, Sensex, Sectoral ETFs |
| International | Global equity diversification funds |
| Debt | Fixed income, liquid, and hybrid funds |

### **3. AI Wealth Chat — Personal AI CFO**
Context-aware conversational intelligence powered by Gemini 2.0 Flash:

- Streams responses in real-time via SSE
- Has full visibility into user's portfolio context (value, XIRR, SIP amount)
- Quick-prompt chips for common financial queries
- Follow-up suggestion chips after each AI response
- Persistent conversation history with Gemini multi-turn support
- Retry failed messages with one click

### **4. Intelligence Feed — Geopolitical Monitor**
Real-time multi-vector risk command center:

- **Global Posture Monitoring** — Live status (CRITICAL / WATCH / STABLE) for EU, Middle East, Asia, US, India desks
- **Maritime Chokepoint Tracking** — Strait of Hormuz, Suez Canal, South China Sea
- **Rupee-Impact Translation** — Complex geopolitical events → specific portfolio adjustments in ₹ terms
- **Neural Confidence Index** — AI-driven reliability scores (0–100%) for each signal

### **5. Adaptive Onboarding & Risk Profiling**
A 5-step behavioral risk assessment wizard that generates a personalized investment blueprint using Gemini's deep reasoning.

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- Firebase Project & Service Account

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev                     # Starts on http://localhost:3000
```

### **Environment Variables**

**Root `.env`** (backend reads this):
```env
# AI
GEMINI_API_KEY=your_gemini_api_key

# News Intelligence
NEWSAPI_KEY=your_newsapi_key
NEWS_API_KEY=your_newsapi_key      # Both aliases used

# Firebase Admin (backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

**`frontend/.env.local`** (Next.js client):
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 📂 Project Structure

```
Nexquire/
├── backend/
│   ├── main.py                         # FastAPI app + router registration
│   ├── requirements.txt
│   ├── routers/
│   │   ├── portfolio_xray.py           # AI audit engine (XIRR, NAV, stress test)
│   │   ├── market.py                   # Live market data
│   │   ├── ai_chat.py                  # Wealth chat SSE endpoint
│   │   └── fund_screener.py            # Fund search & screening
│   └── services/
│       ├── nav_service.py              # Live NAV fetching + 5-min cache
│       ├── xirr_service.py             # XIRR via scipy Brent's method
│       ├── pdf_parser.py               # CAMS/KFintech PDF parser
│       ├── overlap_service.py          # Fund-level stock overlap engine
│       └── stress_test.py              # 4-scenario crash simulator
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   └── dashboard/page.tsx      # Main dashboard with view routing
    │   ├── components/dashboard/
    │   │   ├── PortfolioXRayView.tsx   # Portfolio X-Ray UI (institutional grade)
    │   │   ├── WealthChatView.tsx      # AI Wealth Chat UI
    │   │   ├── FundScreenerView.tsx    # Fund Screener UI
    │   │   └── IntelligenceFeed.tsx    # Geopolitical monitor
    │   └── lib/
    │       └── api.ts                  # Typed API client for all endpoints
    └── package.json
```

---

## 🛡️ Security

Nexquire follows a **Security-First** deployment model:
- All API keys, Firebase credentials, and private keys are excluded from version control via `.gitignore`
- PDF statements are processed in-memory and never persisted to disk
- Firebase Auth enforces authentication on all protected dashboard routes

---

## 🏹 Nexquire
*Master your wealth with institutional precision.* 📈💹🚀⚖️
