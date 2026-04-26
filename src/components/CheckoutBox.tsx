'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Tag, Ticket, CheckCircle2, MessageCircle, XCircle, Banknote, CreditCard } from 'lucide-react'
import { createOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function CheckoutBox({ product }: { product: Product }) {
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('الدفع عند الاستلام')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({ cod_enabled: true, cod_deposit_required: false, deposit_percentage: 50 })
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('store_settings').select('*').single()
      if (data) {
        setSettings(data)
        if (!data.cod_enabled && paymentMethod === 'الدفع عند الاستلام') {
          setPaymentMethod('تحويل بنكي / محافظ إلكترونية')
        }
      }
    }
    fetchSettings()
  }, [])

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
      const result = await createOrder(
        product, 
        couponCode, 
        discount, 
        customerName.trim(), 
        customerAddress.trim(),
        customerPhone.trim(),
        paymentMethod
      )
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
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-rose-600">
                    {Number(finalPrice).toFixed(2)}
                  </span>
                  {((product.original_price && product.original_price > product.price) || discount > 0) && (
                    <span className="text-2xl line-through text-zinc-400 font-bold">
                      {Number(product.original_price || product.price).toFixed(2)}
                    </span>
                  )}
                </div>
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
            <label className="block text-sm font-bold text-zinc-700 mb-1">رقم التليفون <span className="text-rose-500">*</span></label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم الموبايل للتواصل"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-right"
              dir="ltr"
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
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">طريقة الدفع <span className="text-rose-500">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`relative flex rounded-xl border p-4 transition-all ${!settings.cod_enabled ? 'cursor-not-allowed opacity-60 bg-zinc-50 border-zinc-200' : paymentMethod === 'الدفع عند الاستلام' ? 'cursor-pointer border-rose-600 bg-rose-50/50 shadow-sm' : 'cursor-pointer border-zinc-200 hover:border-rose-200 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="الدفع عند الاستلام" checked={paymentMethod === 'الدفع عند الاستلام'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={!settings.cod_enabled} className="sr-only" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${!settings.cod_enabled ? 'bg-zinc-200 text-zinc-400' : paymentMethod === 'الدفع عند الاستلام' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${!settings.cod_enabled ? 'text-zinc-500 line-through' : paymentMethod === 'الدفع عند الاستلام' ? 'text-rose-900' : 'text-zinc-700'}`}>الدفع عند الاستلام</p>
                      {settings.cod_enabled && settings.cod_deposit_required && (
                        <p className="text-[10px] text-rose-600 font-black mt-1 bg-rose-100 px-1.5 py-0.5 rounded inline-block">
                          مطلوب مقدم {settings.deposit_percentage}% {finalPrice ? `(${Number((finalPrice * settings.deposit_percentage) / 100).toFixed(2)} ج.م)` : ''}
                        </p>
                      )}
                      {!settings.cod_enabled && <p className="text-[10px] text-zinc-500 font-bold mt-1">غير متاح حالياً</p>}
                    </div>
                  </div>
                  {paymentMethod === 'الدفع عند الاستلام' && <CheckCircle2 className="h-5 w-5 text-rose-600" />}
                </div>
              </label>
              
              <label className={`relative flex cursor-pointer rounded-xl border p-4 transition-all ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'border-rose-600 bg-rose-50/50 shadow-sm' : 'border-zinc-200 hover:border-rose-200 bg-white'}`}>
                <input type="radio" name="paymentMethod" value="تحويل بنكي / محافظ إلكترونية" checked={paymentMethod === 'تحويل بنكي / محافظ إلكترونية'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'تحويل بنكي / محافظ إلكترونية' ? 'text-rose-900' : 'text-zinc-700'}`}>دفع إلكتروني</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">إنستا باي / محافظ</p>
                    </div>
                  </div>
                  {paymentMethod === 'تحويل بنكي / محافظ إلكترونية' && <CheckCircle2 className="h-5 w-5 text-rose-600" />}
                </div>
              </label>
            </div>
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
          {discount > 0 && (
            <p className="text-sm font-bold text-emerald-600">
              تم تفعيل خصم {discount}%
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="space-y-3 pt-4 border-t border-rose-100 mt-6">
        {settings.policies && (
          <div className="mb-4 rounded-xl bg-zinc-50 border border-zinc-100 p-4">
            <h4 className="text-xs font-black text-zinc-900 mb-2">سياسات المتجر:</h4>
            <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-line font-medium">
              {settings.policies}
            </p>
          </div>
        )}
        <button 
          onClick={handleOrder} 
          disabled={loading || product.stock === 0 || !!(product.price && (!customerName.trim() || !customerAddress.trim() || !customerPhone.trim()))}
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
