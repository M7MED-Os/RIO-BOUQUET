import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Ticket, LayoutDashboard, CheckCircle2, XCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function addCoupon(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const code = formData.get('code') as string
  const discount = parseInt(formData.get('discount') as string)
  const maxUses = formData.get('max_uses') as string
  const expiresAt = formData.get('expires_at') as string
  
  if (code && discount) {
    await supabase.from('coupons').insert({ 
      code, 
      discount_percentage: discount,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
    })
    revalidatePath('/admin/coupons')
  }
}

async function toggleCoupon(id: string, currentStatus: boolean) {
  'use server'
  const supabase = await createClient()
  await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin/coupons')
}

export default async function AdminCoupons() {
  const supabase = await createClient()
  const { data: coupons } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Ticket className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">كوبونات الخصم</h1>
            <p className="text-sm text-zinc-500">إدارة التخفيضات والعروض</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Coupon Form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">إضافة كوبون جديد</h2>
          <form action={addCoupon} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">كود الخصم</label>
              <input name="code" required placeholder="مثال: EID2026" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">نسبة الخصم (%)</label>
              <input name="discount" type="number" min="1" max="100" required placeholder="مثال: 15" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">الاستخدام (مرات)</label>
                <input name="max_uses" type="number" min="1" placeholder="مثال: 50" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">تاريخ الانتهاء</label>
                <input name="expires_at" type="date" className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 transition mt-2">إضافة الكوبون</button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-right">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">الكود</th>
                <th className="px-6 py-4">الخصم</th>
                <th className="px-6 py-4">الاستخدام</th>
                <th className="px-6 py-4">الانتهاء</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-left">تفعيل/إيقاف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {coupons && coupons.length > 0 ? coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 font-black text-rose-600 tracking-wider">{coupon.code}</td>
                  <td className="px-6 py-4 font-bold text-zinc-900">{coupon.discount_percentage}%</td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                    {coupon.current_uses} / {coupon.max_uses || 'بلا حدود'}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('ar-EG') : 'دائم'}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.is_active ? 
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700"><CheckCircle2 className="h-3 w-3"/> فعال</span> : 
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700"><XCircle className="h-3 w-3"/> متوقف</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-left">
                    <form action={toggleCoupon.bind(null, coupon.id, coupon.is_active)}>
                      <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${coupon.is_active ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}>
                        {coupon.is_active ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </form>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">لا توجد كوبونات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
