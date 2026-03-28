"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, signUp, signInWithGoogle } from "@/lib/auth"
import { saveUserProfile, getUserProfile } from "@/lib/db"

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      if (activeTab === "signup") {
        const res = await signUp(formData.email, formData.password)
        await saveUserProfile(res.user.uid, { 
          email: formData.email, 
          name: formData.fullName, 
          created_at: new Date().toISOString() 
        })
        router.push("/onboarding")
      } else {
        await signIn(formData.email, formData.password)
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await signInWithGoogle()
      const profile = await getUserProfile(res.user.uid)
      if (profile) {
        router.push("/dashboard")
      } else {
        await saveUserProfile(res.user.uid, {
          email: res.user.email,
          name: res.user.displayName,
          created_at: new Date().toISOString()
        })
        router.push("/onboarding")
      }
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* LEFT SIDE - Desktop Only */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold text-sm">N</div>
          <span className="text-[17px] font-bold tracking-tight text-white">Nexquire</span>
        </div>

        <div className="max-w-[400px]">
          <p className="text-[24px] text-white font-light leading-[1.6] mb-4">
            &ldquo;The stock market is a device for transferring money from the impatient to the patient.&rdquo;
          </p>
          <div className="text-[14px] text-[#666]">
            — Warren Buffett
          </div>
        </div>

        <div className="flex items-center gap-4 text-[13px] text-[#555] font-medium">
          <span>15Cr+ investors</span>
          <span className="opacity-30">|</span>
          <span>44 AMCs</span>
          <span className="opacity-30">|</span>
          <span>9 AI agents</span>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px] flex flex-col">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="text-[17px] font-bold tracking-tight text-black">Nexquire</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-8 mb-8 border-b border-[#E8E8E8]">
            <button 
              onClick={() => { setActiveTab("signin"); setError(""); }}
              className={`pb-3 text-[16px] transition-all cursor-pointer ${activeTab === "signin" ? "font-bold text-black border-b-2 border-black" : "text-[#999] border-b-2 border-transparent"}`}
            >
              Sign in
            </button>
            <button 
              onClick={() => { setActiveTab("signup"); setError(""); }}
              className={`pb-3 text-[16px] transition-all cursor-pointer ${activeTab === "signup" ? "font-bold text-black border-b-2 border-black" : "text-[#999] border-b-2 border-transparent"}`}
            >
              Sign up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "signin" ? (
                <div className="flex flex-col">
                  <h1 className="text-[28px] font-extrabold tracking-[-1px] mb-1">Welcome back.</h1>
                  <p className="text-[14px] text-[#666] mb-8">Sign in to your Nexquire account.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <h1 className="text-[28px] font-extrabold tracking-[-1px] mb-1">Create your account.</h1>
                  <p className="text-[14px] text-[#666] mb-8">Start investing with intelligence.</p>
                </div>
              )}

              {error && (
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[8px] p-3 text-[13px] text-[#DC2626] font-medium mb-6">
                  {error}
                </div>
              )}

              <button 
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-[48px] border-[1.5px] border-[#E0E0E0] rounded-[10px] flex items-center justify-center gap-3 text-[15px] font-medium text-black transition-all hover:bg-[#F9F9F9] hover:border-black active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.27 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="h-[1px] flex-1 bg-[#E8E8E8]" />
                <span className="text-[13px] text-[#999] uppercase tracking-[1px] font-bold">or</span>
                <div className="h-[1px] flex-1 bg-[#E8E8E8]" />
              </div>

              <form onSubmit={handleAuth} className="space-y-3">
                {activeTab === "signup" && (
                  <input 
                    required
                    type="text"
                    placeholder="Full name"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full h-[48px] px-4 border-[1.5px] border-[#E0E0E0] rounded-[10px] text-[15px] outline-none transition-all focus:border-black placeholder:text-[#BBB]"
                  />
                )}
                <input 
                  required
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-[48px] px-4 border-[1.5px] border-[#E0E0E0] rounded-[10px] text-[15px] outline-none transition-all focus:border-black placeholder:text-[#BBB]"
                />
                <input 
                  required
                  type="password"
                  placeholder={activeTab === "signup" ? "Password (min 8 characters)" : "Password"}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-[48px] px-4 border-[1.5px] border-[#E0E0E0] rounded-[10px] text-[15px] outline-none transition-all focus:border-black placeholder:text-[#BBB]"
                />
                
                {activeTab === "signin" && (
                  <div className="text-right">
                    <button type="button" className="text-[13px] text-[#666] font-medium hover:text-black hover:underline transition-colors mt-1">
                      Forgot password?
                    </button>
                  </div>
                )}

                {activeTab === "signup" && (
                  <p className="text-[12px] text-[#999] leading-relaxed py-2">
                    By signing up you agree to our <Link href="#" className="text-black font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-black font-bold hover:underline">Privacy Policy.</Link>
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-[48px] bg-black text-white rounded-[10px] text-[15px] font-bold transition-all hover:bg-[#222] hover:-translate-y-0.5 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    activeTab === "signin" ? "Sign in →" : "Create account →"
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
