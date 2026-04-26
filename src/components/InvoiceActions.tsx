'use client'

import { Eye, Share2 } from 'lucide-react'
import { useState } from 'react'

interface InvoiceActionsProps {
  order: any
}

export default function InvoiceActions({ order }: InvoiceActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleView = () => {
    window.open(`/api/invoice?id=${order.id}`, '_blank')
  }

  const handleDownloadOrShare = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/invoice?id=${order.id}`)
      if (!response.ok) throw new Error('Failed to fetch invoice')

      const blob = await response.blob()
      const fileName = `RIO-BOUQUET-Invoice-${order.id.split('-')[0].toUpperCase()}.pdf`
      const file = new File([blob], fileName, { type: 'application/pdf' })

      // Try Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'فاتورة ريو بوكيه',
          text: `فاتورة الطلب رقم #${order.id.split('-')[0].toUpperCase()}`,
        })
      } else {
        // Fallback to Download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Share/Download failed:', error)
      // Final fallback
      window.open(`/api/invoice?id=${order.id}`, '_blank')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto no-print">
      <button
        onClick={handleView}
        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 shadow-lg shadow-zinc-200"
      >
        <Eye className="h-4 w-4" />
        عرض الفاتورة
      </button>

      <button
        onClick={handleDownloadOrShare}
        disabled={isProcessing}
        className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 shadow-lg shadow-rose-100 disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {isProcessing ? 'جاري التحضير...' : 'تحميل / مشاركة'}
      </button>
    </div>
  )
}


