# Nexquire 🏹 — Invest with Intelligence

[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini 2.0](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**Nexquire** is an institutional-grade wealth intelligence platform that combines premium minimalist design with the cognitive power of **Google Gemini 2.0**. It transforms complex raw data into actionable wealth-building strategies, providing a sophisticated command center for the modern investor.

---

## 🏛️ Modern Stack & Architecture

Nexquire is built on a high-performance, distributed architecture designed for low-latency intelligence and seamless scalability.

### **Frontend** (Next.js 15 App Router)
- **Styling**: Tailwind CSS with a custom "Series A" high-contrast design system.
- **Animations**: `framer-motion` for fluid, physics-based UI transitions.
- **Interactivity**: Dynamic multi-view architecture with state-aware navigation.
- **Theme**: Automatic theme-aware accessibility (Dark/Light).

### **Backend** (FastAPI)
- **Intelligence**: Multi-agent orchestration via **Gemini 2.0 Flash** and **CrewAI**.
- **Real-Time Feed**: Asynchronous news and market signal processing.
- **Security**: Strict credential isolation via Python `python-dotenv`.

### **Cloud Infrastructure** (Firebase Core)
- **Authentication**: Secure, production-ready identity management.
- **Firestore**: Real-time NoSQL database for portfolio tracking and user profiling.
- **Storage**: Scalable object storage for investment artifacts.

---

## 💎 Core Features

### **1. Adaptive Onboarding & Risk Profiling**
A high-fidelity 5-step wizard that assesses behavioral risk and generates a personalized investment blueprint using Gemini's deep reasoning.

### **2. Strategic Command Hub (World Monitor)**
A real-time, high-density **Multi-Vector Risk Command Center** that synthesizes global geopolitical nodes:
- **Global Posture Monitoring**: Real-time status toggles (CRITICAL, WATCH, STABLE) for the EU, Middle East, Asia, US, and India desks.
- **Maritime Chokepoint Tracking**: Live risk analysis of critical shipping lanes like the **Strait of Hormuz** and **Suez Canal**.
- **Neural Confidence Index**: AI-driven reliability scores (0-100%) for geopolitical signal synthesis.

### **3. Intelligence Alert Engine**
An institutional-grade "Rupee-impact" feed that translates complex global events into specific portfolio adjustments, including **basis point (bps)** precision for macro-stress indicators like the **VIX Index** and **Yield Spreads**.

### **4. Portfolio X-Ray & AI Rebalancing**
Automated "Execute Action" flows that simplify asset allocation moves (e.g., Debt-to-Equity switches) with institutional precision.

### **5. Wealth Chat API**
A context-aware AI conversational interface capable of answering complex portfolio-specific queries in plain English.

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+
- Python 3.10+
- Firebase Project & Service Account JSON

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **Environment Variables**
Create a `.env` in the root:
```env
# Backend
GOOGLE_API_KEY=your_gemini_api_key
FIREBASE_PROJECT_ID=your_id
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
```

---

## 🛡️ Security
Nexquire follows a **Security-First** deployment model. All sensitive keys, Firebase credentials, and environment configurations are strictly excluded from version control via a rigorous `.gitignore` structure.

---

## 🏹 Nexquire
*Master your wealth with institutional precision.* 📈💹🚀⚖️
