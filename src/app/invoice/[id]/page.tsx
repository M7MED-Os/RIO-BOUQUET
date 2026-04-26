import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, MessageCircle, Wallet, ArrowLeft, Building2, User, MapPin } from 'lucide-react'
import PrintInvoiceButton from '@/components/PrintInvoiceButton'
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

  // Try to get product description for the invoice
  let productDescription = ""
  if (order) {
    const { data: product } = await supabase
      .from('products')
      .select('description')
      .eq('name', order.product_name)
      .maybeSingle()

    if (product?.description) {
      const words = product.description.split(/\s+/)
      productDescription = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '')
    }
  }

  if (!order) notFound()

  const shortId = order.id.split('-')[0].toUpperCase()
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '201124417693'
  const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://rio-bouquet.com'

  const whatsappMessage = encodeURIComponent(
    `أهلاً ريو بوكيه،\n` +
    `قمت بإنشاء الفاتورة رقم: #${shortId}\n` +
    `المنتج: ${order.product_name}\n` +
    `المبلغ المطلوب: ${order.final_price} ج.م\n\n` +
    `رابط الفاتورة المعتمدة:\n${domain}/invoice/${order.id}`
  )
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${whatsappMessage}`

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 print:bg-white" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: A4;
            margin: 0 !important;
          }
          body { 
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #invoice-document {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 15mm !important;
            position: relative !important;
          }
          .print-header-bar {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 210mm !important;
            height: 5mm !important;
            background-color: #e11d48 !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}} />
      
      {/* =========================================
          WEB UI: Header, Content, Footer
         ========================================= */}
      <div className="flex-1 flex flex-col print:hidden">
        {/* Site Header */}
        <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
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

            {/* Action Bar */}
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-zinc-200">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl w-full sm:w-auto justify-center sm:justify-start">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="font-bold text-sm">تم تسجيل طلبكم بنجاح</p>
              </div>
              <PrintInvoiceButton />
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

                {/* Important Instructions - Styled with Red/Pink tones */}
                <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl mb-8 shadow-sm">
                  <div className="flex items-center gap-3 text-red-600 mb-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="font-black text-lg">لإتمام الطلب:</p>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-700 font-medium">
                    يرجى أولاً تحميل نسخة الفاتورة (PDF) عبر الزر الموجود بالأعلى، ثم إتمام عملية الدفع عبر إحدى الطرق الموضحة بالأسفل، وإرسال نسخة الفاتورة مع إيصال التحويل عبر الواتساب لتأكيد طلبكم وبدء التجهيز.
                  </p>
                </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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

                {/* CTA */}
                <div className="flex flex-col gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 sm:h-14 text-sm sm:text-base font-bold text-white transition hover:bg-[#20ba5a] shadow-lg shadow-green-200 text-center"
                  >
                    <MessageCircle className="h-6 w-6" />
                    أرسل الفاتورة عبر واتساب للتأكيد
                  </a>
                  <p className="text-center text-xs text-zinc-400 font-medium">
                    بمجرد إرسالك للرسالة سيقوم فريقنا بمراجعة الدفع وتأكيد الحجز فوراً
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Site Footer */}
        <footer className="border-t border-zinc-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} RIO BOUQUET. جميع الحقوق محفوظة.
            </p>
          </div>
        </footer>
      </div>

      {/* =========================================
          PRINT ONLY: True A4 PDF Invoice
         ========================================= */}
      <div className="hidden print:block w-[210mm] min-h-[297mm] bg-white mx-auto relative p-8 print:p-10" id="invoice-document">

        {/* Decorative Top Border - Root fix with print-header-bar class */}
        <div className="print-header-bar hidden print:block bg-rose-600" />

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-8 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-zinc-100">
              <Image src="/logo.jpg" alt="RIO BOUQUET Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">RIO BOUQUET</h1>
              <p className="text-sm text-zinc-500 font-medium">لتنسيق أروع الزهور والهدايا</p>
            </div>
          </div>

          <div className="text-left">
            <h2 className="text-4xl font-black text-zinc-200 uppercase tracking-widest mb-2">Invoice</h2>
            <div className="flex gap-8 text-sm justify-end">
              <div className="text-right">
                <p className="text-zinc-400 font-medium mb-1">رقم الفاتورة</p>
                <p className="font-bold text-zinc-900" dir="ltr">#{shortId}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 font-medium mb-1">تاريخ الإصدار</p>
                <p className="font-bold text-zinc-900">{new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer & Billing Info */}
        <div className="flex justify-between gap-8 mb-10 bg-zinc-50 rounded-2xl p-6">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">فاتورة إلى (العميل)</h3>
            <p className="text-lg font-bold text-zinc-900 mb-1">{order.customer_name || 'عميل غير مسجل'}</p>
            <p className="text-sm text-zinc-600 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              {order.customer_address || 'عنوان التوصيل غير مسجل'}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">تفاصيل الدفع والتواصل</h3>
            <p className="text-sm text-zinc-900 font-bold mb-1">الواتساب: 01124417693</p>
            <p className="text-sm text-zinc-600">الدفع عبر إنستا باي أو المحافظ الإلكترونية المعتمدة أدناه.</p>
          </div>
        </div>

        {/* Payment Instructions Note - Red/Bold for PDF */}
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-5 mb-8">
          <p className="text-base font-black text-red-600 mb-2">لإتمام الطلب:</p>
          <p className="text-sm text-zinc-700 leading-relaxed font-medium">
            يرجى إتمام عملية الدفع عبر إحدى الطرق الموضحة بالأسفل، ثم إرسال نسخة من هذه الفاتورة مع إيصال التحويل عبر الواتساب لتأكيد الحجز وبدء التجهيز.
          </p>
        </div>

        {/* Invoice Table */}
        <div className="mb-10">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-zinc-900">
                <th className="py-3 px-2 text-sm font-bold text-zinc-900 w-full">تفاصيل الطلب</th>
                <th className="py-3 px-2 text-sm font-bold text-zinc-900 whitespace-nowrap">السعر الأساسي</th>
                <th className="py-3 px-2 text-sm font-bold text-zinc-900 whitespace-nowrap text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-4 px-2">
                  <p className="font-bold text-zinc-900 text-lg">{order.product_name}</p>
                  {productDescription && <p className="text-sm text-zinc-500 mt-1">{productDescription}</p>}
                </td>
                <td className="py-4 px-2 font-bold text-zinc-700 whitespace-nowrap">{Number(order.product_price).toFixed(2)} ج.م</td>
                <td className="py-4 px-2 font-black text-zinc-900 whitespace-nowrap text-left">{Number(order.product_price).toFixed(2)} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex items-start gap-8 mb-12">

          {/* Payment Instructions */}
          <div className="w-1/2 p-5 bg-rose-50/50 rounded-xl border border-rose-100">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-rose-600" />
              بيانات الدفع الإلكتروني
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-rose-100 pb-2">
                <p className="text-zinc-500 font-bold">إنستا باي:</p>
                <CopyableText text="riobouquet@instapay" label="عنوان إنستا باي" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <p className="text-zinc-500 font-bold">المحفظة:</p>
                <CopyableText text="01124417693" label="رقم المحفظة" />
              </div>
            </div>
          </div>

          {/* Calculations */}
          <div className="w-1/2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-zinc-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{Number(order.product_price).toFixed(2)} ج.م</span>
              </div>

              {order.discount_percentage > 0 && (
                <div className="flex justify-between items-center text-rose-600 pb-3 border-b border-zinc-100">
                  <span>خصم الكوبون ({order.coupon_code}):</span>
                  <span className="font-bold">-{order.discount_percentage}%</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-zinc-900">المبلغ الإجمالي المطلـوب:</span>
                <span className="text-2xl font-black text-rose-600">{Number(order.final_price).toFixed(2)} <span className="text-sm text-zinc-500 font-bold">ج.م</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-zinc-200 pt-6 absolute bottom-10 left-10 right-10 text-center">
          <p className="text-sm font-bold text-zinc-900 mb-2">شكراً لاختيارك ريو بوكيه!</p>
          {/* <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl inline-block max-w-[80%] mx-auto">
            <p className="text-xs leading-relaxed text-zinc-600">
              <span className="font-bold text-zinc-800">ملحوظة هامة:</span> يرجى إتمام عملية الدفع وإرسال صورة الفاتورة مع إيصال الدفع أو الرقم المحول منه عبر الواتساب لتأكيد الاستلام وبدء التجهيز.
            </p>
          </div> */}
          <p className="text-[10px] text-zinc-400 mt-4">تعتبر هذه الفاتورة رسمية ومعتمدة من متجر RIO BOUQUET.</p>
        </div>

      </div>
    </div>
  )
}
