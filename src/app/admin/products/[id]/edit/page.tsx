'use client'

import { useState, useEffect } from 'react'
import { updateProduct } from '@/app/admin/actions'
import MultiImageUploader from '@/components/MultiImageUploader'
import { ArrowLeft, Save, Flower2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'

export default function EditProductPage() {
  const params = useParams()
  const id = params?.id as string
  const [product, setProduct] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (data) {
        setProduct(data)
        setImages(data.images || (data.image_url ? [data.image_url] : []))
      }
      setFetching(false)
    }
    fetchProduct()
  }, [id, supabase])

  if (fetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center">
        <p className="text-zinc-500">لم يتم العثور على المنتج</p>
        <Link href="/admin/dashboard" className="text-sm font-bold text-rose-600 hover:underline">
          العودة للقائمة
        </Link>
      </div>
    )
  }

  const updateWithId = updateProduct.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للقائمة
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Flower2 className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">تعديل المنتج</h1>
            <p className="text-sm text-zinc-500">{product.name}</p>
          </div>
        </div>
      </div>

      <form action={updateWithId} onSubmit={() => setLoading(true)} className="space-y-6">
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-zinc-200 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">اسم المنتج <span className="text-rose-500">*</span></label>
            <input
              name="name"
              required
              defaultValue={product.name}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">الوصف (اختياري)</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={product.description ?? ''}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">التصنيف (اختياري)</label>
            <input
              name="category"
              defaultValue={product.category ?? ''}
              placeholder="مثال: بوكيهات، هدايا..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">السعر بالجنيه (اختياري)</label>
            <div className="relative">
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product.price ?? ''}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-16 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">EGP</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">صور المنتج <span className="text-zinc-400 font-normal">(حتى 6 صور)</span></label>
            <MultiImageUploader onImagesChange={setImages} defaultImages={images} />
            <input type="hidden" name="images_json" value={JSON.stringify(images)} />
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-100 transition hover:bg-amber-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              <Save className="h-5 w-5" />
              {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
