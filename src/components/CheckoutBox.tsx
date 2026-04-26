'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Tag, Ticket, CheckCircle2, MessageCircle, XCircle } from 'lucide-react'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CheckoutBox({ product }: { product: Product }) {
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const applyCoupon = async () => {
    if (!couponCode) return
    setLoading(true)

    const { data } = await supabase
      .from('coupons')
      .select('discount_percentage, max_uses, current_uses, expires_at')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (data) {
      const isExpired = data.expires_at && new Date(data.expires_at) < new Date()
      const isLimitReached = data.max_uses && data.current_uses >= data.max_uses
      
      if (isExpired || isLimitReached) {
        setDiscount(0)
        toast.error('هذا الكوبون منتهي الصلاحية أو تم استخدامه بالكامل')
      } else {
        setDiscount(data.discount_percentage)
        toast.success(`تم تفعيل خصم ${data.discount_percentage}% بنجاح!`)
      }
    } else {
      setDiscount(0)
      toast.error('كود الخصم غير صحيح أو منتهي')
    }
    setLoading(false)
  }

  const finalPrice = product.price ? product.price - (product.price * discount / 100) : null
  
  const handleOrder = async () => {
    if (!customerName.trim() || !customerAddress.trim()) {
      toast.error('برجاء إدخال الاسم والعنوان لإتمام الطلب')
      return
    }

    setLoading(true)
    try {
      const result = await createOrder(product, couponCode, discount, customerName.trim(), customerAddress.trim())
      if (result.success && result.orderId) {
        toast.success('تم تسجيل طلبكم بنجاح! جاري تحويلكم للفاتورة...')
        router.push(`/invoice/${result.orderId}`)
      } else {
        toast.error(result.error || 'حدث خطأ أثناء إنشاء الطلب')
        setLoading(false)
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-3">
          {product.price ? (
            <>
              <div className="flex flex-col">
                <span className="text-5xl font-black text-rose-600">
                  {Number(finalPrice).toFixed(2)}
                </span>
                {((product.original_price && product.original_price > product.price) || discount > 0) && (
                  <span className="text-sm line-through text-zinc-300 font-bold">
                    {Number(product.original_price || product.price).toFixed(2)} ج.م
                  </span>
                )}
              </div>
              <span className="text-xl font-semibold text-zinc-400">ج.م</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-zinc-400">السعر عند التواصل</span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock !== null ? (
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className={`text-xs font-bold ${product.stock > 5 ? 'text-zinc-500' : product.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
              {product.stock > 0 ? `متوفر في المخزون: ${product.stock}` : 'غير متوفر حالياً'}
            </span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-zinc-500">متوفر في المخزون</span>
          </div>
        )}
      </div>

      <div className="h-px bg-rose-100" />

      {/* Customer Details */}
      {product.price && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">الاسم <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="الاسم بالكامل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">عنوان التوصيل <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="المدينة، المنطقة، الشارع، رقم العمارة"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>
        </div>
      )}

      {/* Coupon Input */}
      {product.price && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 space-y-3">
          <label className="block text-sm font-bold text-zinc-700 mb-1">
            كوبون الخصم <span className="text-zinc-400 font-normal">(اختياري)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="أدخل الكود هنا..."
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-center uppercase tracking-widest outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all placeholder:tracking-normal placeholder:text-right"
            />
            <button
              onClick={applyCoupon}
              disabled={loading || !couponCode}
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? '...' : 'تطبيق'}
            </button>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="space-y-3 pt-4 border-t border-rose-100 mt-6">
        <button 
          onClick={handleOrder} 
          disabled={loading || product.stock === 0 || !!(product.price && (!customerName.trim() || !customerAddress.trim()))}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 h-14 text-lg font-bold text-white transition hover:bg-rose-700 hover:-translate-y-0.5 shadow-lg shadow-rose-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:bg-zinc-400 disabled:shadow-none"
        >
          {loading ? 'جاري التحضير...' : product.stock === 0 ? 'نفذت الكمية' : 'تأكيد الطلب وإصدار الفاتورة'}
        </button>
        <p className="text-center text-xs text-zinc-400">
          سيتم إنشاء فاتورة إلكترونية لطلبك مع خيارات الدفع المتاحة
        </p>
      </div>
    </div>
  )
}
