const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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
  getFunds: async (category: string) => {
    const res = await fetch(`${API_URL}/api/ai/funds/screen?category=${category}`)
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
  }
}
