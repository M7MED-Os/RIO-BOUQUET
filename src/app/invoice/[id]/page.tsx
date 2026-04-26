import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Wallet, ArrowLeft, Building2, User, MapPin } from 'lucide-react'
import InvoiceActions from '@/components/InvoiceActions'
import CopyableText from '@/components/CopyableText'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `فاتورة طلب #${id.split('-')[0]} - RIO BOUQUET` }
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: settings } = await supabase
    .from('store_settings')
    .select('*')
    .single()

  const codDepositRequired = settings?.cod_deposit_required || false;
  const depositPercentage = settings?.deposit_percentage || 50;
  const depositAmount = (order.final_price * depositPercentage) / 100;

  const shortId = order.id.split('-')[0].toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50" dir="rtl">

      {/* Site Header */}
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md no-print">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex flex-col text-right">
              <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">RIO BOUQUET</span>
              <span className="text-[10px] font-bold text-rose-500 text-left tracking-[0.2em] mt-1">RIHAM MOHAMED</span>
            </div>
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-rose-100 transition-transform group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="RIO BOUQUET Logo"
                fill
                className="object-cover"
              />
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-rose-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> العودة للمتجر
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

          {/* New Action Bar with 3 Buttons */}
          <div className="mb-6 flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 no-print">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-6 py-3 rounded-2xl w-full justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="font-bold">تم تسجيل الطلب بنجاح!</p>
            </div>
            <InvoiceActions order={order} />
          </div>

          {/* Web Invoice Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-rose-100/50 border border-rose-50">
            <div className="bg-rose-600 px-6 py-5 sm:px-8 sm:py-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-rose-100 text-sm font-medium mb-1">فاتورة إلكترونية</p>
                <h1 className="text-2xl font-black" dir="ltr">#{shortId}</h1>
              </div>
              <div className="sm:text-left">
                <p className="text-rose-100 text-sm font-medium mb-1">تاريخ الإصدار</p>
                <p className="font-bold">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Customer Details */}
              <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">بيانات العميل</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">الاسم</p>
                    <p className="font-bold text-zinc-900">{order.customer_name || 'غير مسجل'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">العنوان</p>
                    <p className="font-bold text-zinc-900">{order.customer_address || 'غير مسجل'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Instruction Reminder */}
              {order.payment_method === 'الدفع عند الاستلام' && !codDepositRequired ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl">
                  <p className="text-green-700 font-bold text-sm leading-relaxed text-center">
                    سيتم تجهيز طلبك قريباً. الدفع سيكون عند استلام الطلب. يرجى إرسال هذه الفاتورة على الواتساب لتأكيد طلبك
                  </p>
                </div>
              ) : order.payment_method === 'الدفع عند الاستلام' && codDepositRequired ? (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <p className="text-rose-600 font-bold text-sm leading-relaxed text-center">
                    يرجى دفع مقدم بنسبة {depositPercentage}% ({Number(depositAmount).toFixed(2)} ج.م) عبر طرق الدفع الموضحة بالأسفل لتأكيد الحجز والبدء في تجهيز طلبك. يرجى إرسال الفاتورة مع إيصال الدفع على الواتساب
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <p className="text-rose-600 font-bold text-sm leading-relaxed text-center">
                    لإتمام الطلب يرجى دفع إجمالي المبلغ وإرسال إيصال الدفع (سكرين شوت) مع هذه الفاتورة على الواتساب للبدء في تجهيز طلبك فوراً
                  </p>
                </div>
              )}

              {/* Order Details */}
              <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">تفاصيل الطلب</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-base">
                  <span className="text-zinc-600 font-medium">{order.product_name}</span>
                  <span className="font-bold text-zinc-900">{Number(order.product_price).toFixed(2)} ج.م</span>
                </div>

                {order.discount_percentage > 0 && (
                  <div className="flex justify-between items-center text-rose-600">
                    <span className="font-medium">كوبون خصم ({order.coupon_code})</span>
                    <span className="font-bold">-{order.discount_percentage}%</span>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-xl font-bold text-zinc-900">الإجمالي المطلوب</span>
                  <span className="text-3xl font-black text-rose-600">{Number(order.final_price).toFixed(2)} <span className="text-lg font-bold text-zinc-400">ج.م</span></span>
                </div>
              </div>

              {/* Payment Methods */}
              <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">طرق الدفع المتاحة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-zinc-200 p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <p className="font-black text-zinc-900">إنستا باي (InstaPay)</p>
                  <div className="mt-2">
                    <CopyableText text="riobouquet@instapay" label="عنوان إنستا باي" />
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200 p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <p className="font-black text-zinc-900">محفظة إلكترونية</p>
                  <div className="mt-2">
                    <CopyableText text="01124417693" label="رقم المحفظة" />
                  </div>
                </div>
              </div>
              {/* Store Policies */}
              {settings?.policies && (
                <div className="mt-8 rounded-2xl bg-zinc-50 border border-zinc-200 p-6 no-print">
                  <h3 className="text-sm font-black text-zinc-900 mb-3">سياسات المتجر:</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line font-medium">
                    {settings.policies}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 no-print">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} RIO BOUQUET. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}

