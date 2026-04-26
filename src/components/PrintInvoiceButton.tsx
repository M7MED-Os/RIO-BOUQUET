'use client'

import { Printer } from 'lucide-react'

export default function PrintInvoiceButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-200 transition-colors no-print"
    >
      <Printer className="h-4 w-4" />
      تحميل كـ PDF
    </button>
  )
}
