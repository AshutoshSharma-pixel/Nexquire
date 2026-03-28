'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FundsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/dashboard')
  }, [])
  return null
}
