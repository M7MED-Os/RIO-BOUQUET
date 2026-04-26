'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { deleteOrder } from '@/app/actions/order'

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    const result = await deleteOrder(orderId)
    if (result.success) {
      setIsOpen(false)
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="حذف الطلب"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setIsOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-2">تأكيد حذف الطلب</h3>
              <p className="text-zinc-500 leading-relaxed px-4">
                هل أنت متأكد من حذف هذا الطلب نهائياً؟ سيتم إزالة كافة بيانات الفاتورة من النظام ولا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>

            <div className="flex flex-col gap-3 px-4">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full rounded-2xl bg-red-600 py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'جاري الحذف...' : 'نعم، احذف نهائياً'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="w-full rounded-2xl bg-zinc-100 py-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-200 active:scale-95"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
