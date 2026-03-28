import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface MarketStatus {
  is_open: boolean
  is_pre_market: boolean
  is_post_market: boolean
  status: 'open' | 'pre_market' | 'post_market' | 'closed'
  current_time_ist: string
  next_open: string | null
  day: string
}

export default function MarketStatusBadge() {
  const [status, setStatus] = useState<MarketStatus | null>(null)
  const [countdown, setCountdown] = useState('')

  const fetchStatus = async () => {
    try {
      const data = await api.getMarketStatus()
      setStatus(data)
    } catch (e) {
      console.log('Market status fetch failed')
    }
  }

  // Countdown timer to next open
  useEffect(() => {
    if (!status?.next_open) return
    
    const interval = setInterval(() => {
      const now = new Date()
      const next = new Date(status.next_open!)
      const diff = next.getTime() - now.getTime()
      
      if (diff <= 0) {
        setCountdown('Opening soon')
        fetchStatus()
        return
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setCountdown(
        `${hours.toString().padStart(2,'0')}:` +
        `${minutes.toString().padStart(2,'0')}:` +
        `${seconds.toString().padStart(2,'0')}`
      )
    }, 1000)
    
    return () => clearInterval(interval)
  }, [status?.next_open])

  // Fetch on mount + every 60 seconds
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!status) return null

  const configs = {
    open: {
      dot: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      text: '#15803D',
      label: 'Market Open',
      sub: 'Live prices updating',
      pulse: true
    },
    pre_market: {
      dot: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      text: '#B45309',
      label: 'Pre-Market',
      sub: 'Opens at 9:15 AM IST',
      pulse: false
    },
    post_market: {
      dot: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      label: 'Post-Market',
      sub: 'Showing last traded prices',
      pulse: false
    },
    closed: {
      dot: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#B91C1C',
      label: 'Market Closed',
      sub: countdown ? `Opens in ${countdown}` : 'NSE & BSE closed',
      pulse: false
    }
  }

  const config = configs[status.status] || configs.closed

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '10px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: '12px',
      padding: '10px 16px',
    }}>
      {/* Pulsing dot */}
      <div style={{ position: 'relative', width: 10, height: 10 }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: config.dot,
        }}/>
        {config.pulse && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: 10, height: 10,
            borderRadius: '50%',
            background: config.dot,
            animation: 'marketPulse 1.5s infinite',
            opacity: 0.6
          }}/>
        )}
      </div>

      {/* Text */}
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 700,
          color: config.text,
          lineHeight: 1.2
        }}>
          {config.label}
        </div>
        <div style={{
          fontSize: 11,
          color: config.text,
          opacity: 0.7,
          marginTop: 2
        }}>
          {config.sub}
        </div>
      </div>

      {/* Time */}
      <div style={{
        fontSize: 12,
        color: config.text,
        opacity: 0.6,
        borderLeft: `1px solid ${config.border}`,
        paddingLeft: 10,
        fontVariantNumeric: 'tabular-nums'
      }}>
        {status.current_time_ist}
      </div>
    </div>
  )
}
