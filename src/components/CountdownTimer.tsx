'use client'

import { useEffect, useState } from 'react'

export default function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null)

  useEffect(() => {
    const target = new Date(endDate).getTime()

    const update = () => {
      const now = new Date().getTime()
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
      <span>ينتهي في:</span>
      <div className="flex items-center gap-0.5" dir="ltr">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  )
}
