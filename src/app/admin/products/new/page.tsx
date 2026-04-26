'use client'

import { useState } from 'react'
import { createProduct } from '@/app/admin/actions'
import MultiImageUploader from '@/components/MultiImageUploader'
import { ArrowLeft, Save, Flower2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للقائمة
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
            <Flower2 className="h-5 w-5 text-rose-600" />
          </div>
          <h1 className="text-2xl font-black text-zinc-900">إضافة منتج جديد</h1>
        </div>
      </div>

      <form 
        action={async (formData) => {
          await createProduct(formData)
        }} 
        onSubmit={() => setLoading(true)} 
        className="space-y-6"
      >
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-zinc-200 space-y-6">

          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">
              اسم المنتج <span className="text-rose-500">*</span>
            </label>
            <input
              name="name"
              required
              placeholder="مثال: بوكيه ورد أحمر"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">الوصف (اختياري)</label>
            <textarea
              name="description"
              rows={4}
              placeholder="اكتب وصفاً للمنتج يجذب العملاء..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">
              التصنيف (اختياري)
            </label>
            <input
              name="category"
              placeholder="مثال: بوكيهات، هدايا..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <p className="text-xs text-zinc-400">اتركه فارغاً للتصنيف الافتراضي (أخرى)</p>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">السعر (اختياري)</label>
            <div className="relative">
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="مثال: 150"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 pr-16 text-sm text-right text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">EGP</span>
            </div>
            <p className="text-xs text-zinc-400">اتركه فارغاً إذا كنت لا تريد عرض السعر</p>
          </div>

          {/* Multi-image uploader */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700">
              صور المنتج <span className="text-zinc-400 font-normal">(حتى 6 صور)</span>
            </label>
            <MultiImageUploader onImagesChange={setImages} />
            <input type="hidden" name="images_json" value={JSON.stringify(images)} />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              <Save className="h-5 w-5" />
              {loading ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
