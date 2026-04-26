import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Building2 } from 'lucide-react'

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const shortId = order.id.split('-')[0].toUpperCase()

  // Try to get product description
  let productDescription = ""
  const { data: product } = await supabase
    .from('products')
    .select('description')
    .eq('name', order.product_name)
    .maybeSingle()

  if (product?.description) {
    const words = product.description.split(/\s+/)
    productDescription = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '')
  }

  return (
    <div className="bg-white min-h-screen p-0 m-0" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
        body { font-family: system-ui, -apple-system, sans-serif; }
      `}} />
      
      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 1000);
        };
      `}} />

      <div className="w-[210mm] min-h-[297mm] bg-white mx-auto relative p-10 shadow-none">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#e11d48]" />

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-8 mb-8 mt-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-zinc-100">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900">RIO BOUQUET</h1>
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

        {/* Instructions */}
        <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-5 mb-8">
          <p className="text-base font-black text-red-600 mb-2">لإتمام الطلب:</p>
          <p className="text-sm text-zinc-700 leading-relaxed font-medium">
            يرجى إتمام عملية الدفع عبر إحدى الطرق الموضحة بالأسفل، ثم إرسال نسخة من هذه الفاتورة مع إيصال التحويل عبر الواتساب لتأكيد الحجز.
          </p>
        </div>

        {/* Invoice Table */}
        <div className="mb-10">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-zinc-900">
                <th className="py-3 px-2 text-sm font-bold text-zinc-900 w-full">تفاصيل الطلب</th>
                <th className="py-3 px-2 text-sm font-bold text-zinc-900 whitespace-nowrap">السعر</th>
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
          <div className="w-1/2 p-5 bg-rose-50/50 rounded-xl border border-rose-100">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-rose-600" />
              بيانات الدفع الإلكتروني
            </h4>
            <p className="text-sm text-zinc-600 mb-1 font-bold">إنستا باي: <span className="text-zinc-900">riobouquet@instapay</span></p>
            <p className="text-sm text-zinc-600 font-bold">المحفظة: <span className="text-zinc-900">01124417693</span></p>
          </div>

          <div className="w-1/2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-zinc-600">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{Number(order.product_price).toFixed(2)} ج.م</span>
              </div>
              {order.discount_percentage > 0 && (
                <div className="flex justify-between items-center text-rose-600 pb-3 border-b border-zinc-100">
                  <span>خصم الكوبون:</span>
                  <span className="font-bold">-{order.discount_percentage}%</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-bold text-zinc-900">المبلغ الإجمالي:</span>
                <span className="text-2xl font-black text-rose-600">{Number(order.final_price).toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 pt-6 absolute bottom-10 left-10 right-10 text-center">
          <p className="text-sm font-bold text-zinc-900 mb-2">شكراً لاختيارك ريو بوكيه!</p>
          <p className="text-[10px] text-zinc-400">تعتبر هذه الفاتورة رسمية ومعتمدة من متجر RIO BOUQUET.</p>
        </div>
      </div>
    </div>
  )
}
