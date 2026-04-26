'use client'

import { Printer } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PrintInvoiceButton() {
  const [isPrinting, setIsPrinting] = useState(false)

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false)
    }

    window.addEventListener('afterprint', handleAfterPrint)
    return () => window.removeEventListener('afterprint', handleAfterPrint)
  }, [])

  const handlePrint = () => {
    if (isPrinting) return
    
    setIsPrinting(true)
    
    // Using a small delay ensures the browser UI can update before the blocking print call
    // This often fixes the "hanging" issue on mobile browsers
    setTimeout(() => {
      try {
        window.print()
      } catch (error) {
        console.error('Print failed:', error)
        setIsPrinting(false)
      }
      
      // Fallback: reset state if afterprint didn't fire (some browsers don't support it well)
      setTimeout(() => setIsPrinting(false), 3000)
    }, 500)
  }

  return (
    <button 
      onClick={handlePrint} 
      disabled={isPrinting}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all no-print shadow-sm active:scale-95 ${
        isPrinting 
          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' 
          : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
      }`}
    >
      <Printer className={`h-4 w-4 ${isPrinting ? 'animate-pulse' : ''}`} />
      {isPrinting ? 'جاري التحضير...' : 'تحميل كـ PDF'}
    </button>
  )
}

