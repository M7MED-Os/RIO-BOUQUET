import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Package, Edit, ExternalLink, Flower2, LayoutDashboard, Eye, Tag } from 'lucide-react'
import Image from 'next/image'
import DeleteProductButton from '@/components/DeleteProductButton'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const totalViews = products?.reduce((acc, p) => acc + (p.views_count || 0), 0) || 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Stats Summary */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-bold">إجمالي المنتجات</p>
            <p className="text-2xl font-black text-zinc-900">{products?.length || 0}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-bold">إجمالي المشاهدات</p>
            <p className="text-2xl font-black text-zinc-900">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <LayoutDashboard className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">قائمة المنتجات</h1>
            <p className="text-sm text-zinc-500">{products?.length ?? 0} منتج في المتجر</p>
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-wide font-semibold">
              <tr>
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">المشاهدات</th>
                <th className="px-6 py-4">تاريخ الإضافة</th>
                <th className="px-6 py-4 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="group hover:bg-rose-50/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-rose-50 border border-rose-100">
                          {product.image_url ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-5 w-5 text-rose-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{product.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 max-w-[200px]">
                            {product.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 border border-zinc-200">
                        <Tag className="h-3 w-3" />
                        {product.category || 'أخرى'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.price ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">
                          {Number(product.price).toFixed(2)} ج.م
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-600">
                      {product.views_count || 0}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {new Date(product.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/products/${product.id}`}
                          title="معاينة المنتج على الموقع"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          title="تعديل"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
                        <Flower2 className="h-8 w-8 text-rose-200" />
                      </div>
                      <p className="font-medium">لا توجد منتجات بعد</p>
                      <Link
                        href="/admin/products/new"
                        className="mt-1 text-sm font-bold text-rose-600 hover:underline"
                      >
                        أضف أول منتج الآن →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
