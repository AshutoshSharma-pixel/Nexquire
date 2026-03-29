const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const api = {
  // Onboarding
  onboard: async (data: any) => {
    const res = await fetch(`${API_URL}/api/ai/onboarding/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  // Funds
  getFunds: async (category: string, timeframe: string = "1y") => {
    const res = await fetch(`${API_URL}/api/ai/funds/screen?category=${category}&timeframe=${timeframe}`)
    return res.json()
  },

  // Alerts
  getAlerts: async () => {
    const res = await fetch(`${API_URL}/api/ai/alerts`)
    return res.json()
  },

  // Chat
  chat: async (message: string) => {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    return res.json()
  },

  // Tax
  getTaxAnalysis: async () => {
    const res = await fetch(`${API_URL}/api/ai/tax/analysis`)
    return res.json()
  },

  // Broker
  getBrokerRecommendation: async (knowledge: string, investable: number) => {
    const res = await fetch(`${API_URL}/api/ai/broker/recommend?knowledge=${knowledge}&investable=${investable}`)
    return res.json()
  },
  
  // Market Pulse
  getMarketPulse: async () => {
    const res = await fetch(`${API_URL}/api/market-pulse`)
    return res.json()
  },

  // Live Financial News
  getLiveNews: async () => {
    const res = await fetch(`${API_URL}/api/news/live`)
    return res.json()
  },

  // Expanded Market Data (ETFs, Commodities, Movers, F&O)
  getMarketData: async () => {
    const res = await fetch(`${API_URL}/api/market/all`)
    return res.json()
  },

  // Market Status
  getMarketStatus: async () => {
    const res = await fetch(`${API_URL}/api/market/status`)
    return res.json()
  },

  // Geopolitical Posture
  getGeopoliticalPosture: async () => {
    const res = await fetch(`${API_URL}/api/ai/geopolitical-posture`)
    return res.json()
  },
  
  // Portfolio X-Ray
  uploadCams: async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${API_URL}/api/portfolio/upload-cams`, {
      method: "POST",
      body: formData,
    })
    return res.json()
  },

  manualEntry: async (holdings: any[]) => {
    const res = await fetch(`${API_URL}/api/portfolio/manual-entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings }),
    })
    return res.json()
  },

  searchFund: async (q: string) => {
    const res = await fetch(`${API_URL}/api/portfolio/search-fund?q=${q}`)
    return res.json()
  },

  liveValuation: async (holdings: any[]) => {
    const res = await fetch(`${API_URL}/api/portfolio/live-valuation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings }),
    })
    return res.json()
  },

  analyzePortfolio: async (holdings: any[], userProfile: any) => {
    const res = await fetch(`${API_URL}/api/portfolio/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holdings, user_profile: userProfile }),
    })
    return res.json()
  }
}
