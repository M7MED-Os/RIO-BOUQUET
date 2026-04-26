import { createClient } from '@/lib/supabase/server'
import { ClipboardList, ExternalLink } from 'lucide-react'
import OrderStatusSelect from '@/components/OrderStatusSelect'
import OrdersFilter from '@/components/OrdersFilter'
import DeleteOrderButton from '@/components/DeleteOrderButton'
import RefreshButton from '@/components/RefreshButton'
import Link from 'next/link'

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ q?: string, status?: string }> }) {
  const { q = '', status = '' } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  // Fetch a reasonable batch for admin (e.g., 2000 orders)
  let { data: orders } = await query.limit(2000)

  if (q && orders) {
    const searchLower = q.toLowerCase()
    orders = orders.filter(order => 
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.product_name?.toLowerCase().includes(searchLower) ||
      order.id.toLowerCase().startsWith(searchLower) ||
      order.id.split('-')[0].toLowerCase().includes(searchLower)
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
            <ClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">إدارة الطلبات</h1>
            <p className="text-sm text-zinc-500">متابعة الفواتير وتحديث حالة الطلبات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton />
          <OrdersFilter initialQ={q} initialStatus={status} />
        </div>
      </div>

      {/* Orders List */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">رقم الفاتورة</th>
                <th className="px-6 py-4 min-w-[200px]">المنتج / العميل</th>
                <th className="px-6 py-4 whitespace-nowrap">الكوبون</th>
                <th className="px-6 py-4 whitespace-nowrap">السعر النهائي</th>
                <th className="px-6 py-4 whitespace-nowrap">التاريخ</th>
                <th className="px-6 py-4 whitespace-nowrap min-w-[150px]">تحديث الحالة</th>
                <th className="px-6 py-4 whitespace-nowrap text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders && orders.length > 0 ? orders.map(order => {
                const shortId = order.id.split('-')[0].toUpperCase()
                return (
                  <tr key={order.id} className="hover:bg-zinc-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-zinc-600">
                      <span dir="ltr">#{shortId}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {order.product_name}
                      <span className="block text-xs text-zinc-400 font-normal mt-0.5">العميل: <span className="font-bold text-zinc-600">{order.customer_name || 'غير مسجل'}</span></span>
                    </td>
                    <td className="px-6 py-4">
                      {order.coupon_code ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                          {order.coupon_code} (-{order.discount_percentage}%)
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-black text-rose-600">
                      {Number(order.final_price).toFixed(2)} ج.م
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect orderId={order.id} initialStatus={order.status} />
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/invoice/${order.id}`} 
                          target="_blank"
                          title="عرض الفاتورة"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <DeleteOrderButton orderId={order.id} />
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-zinc-500">لا توجد طلبات تطابق بحثك</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
