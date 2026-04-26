'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateStoreSettings } from '@/app/actions/settings'
import { Settings, Save, Banknote } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const [codEnabled, setCodEnabled] = useState(true)
  const [codDepositRequired, setCodDepositRequired] = useState(false)
  const [depositPercentage, setDepositPercentage] = useState(50)
  const [policies, setPolicies] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('store_settings').select('*').single()
      if (data) {
        setCodEnabled(data.cod_enabled)
        setCodDepositRequired(data.cod_deposit_required)
        setDepositPercentage(data.deposit_percentage || 50)
        setPolicies(data.policies || '')
      }
      setFetching(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const result = await updateStoreSettings(codEnabled, codDepositRequired, policies, depositPercentage)
    if (result.success) {
      toast.success('تم حفظ الإعدادات بنجاح')
    } else {
      toast.error('حدث خطأ أثناء حفظ الإعدادات')
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Settings className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">إعدادات المتجر</h1>
          <p className="text-sm text-zinc-500">تحكم في طرق الدفع والخيارات المتاحة للعملاء</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Banknote className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">إعدادات الدفع عند الاستلام</h2>
          </div>

          <div className="space-y-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-rose-500"></div>
                <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:-translate-x-5"></div>
              </div>
              <div>
                <p className="font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">تفعيل الدفع عند الاستلام</p>
                <p className="text-sm text-zinc-500 mt-1">السماح للعملاء باختيار الدفع عند الاستلام كطريقة دفع.</p>
              </div>
            </label>

            {codEnabled && (
              <div className="pt-4 border-t border-zinc-100">
                <label className="flex items-start gap-4 cursor-pointer group mb-4">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={codDepositRequired}
                      onChange={(e) => setCodDepositRequired(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-zinc-200 transition-colors peer-checked:bg-rose-500"></div>
                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:-translate-x-5"></div>
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 group-hover:text-rose-600 transition-colors">اشتراط دفع عربون (مقدم)</p>
                    <p className="text-sm text-zinc-500 mt-1">عرض رسالة للعميل تطلب منه دفع عربون عبر تحويل بنكي/محفظة قبل البدء في تجهيز الطلب في حال اختياره الدفع عند الاستلام.</p>
                  </div>
                </label>

                {codDepositRequired && (
                  <div className="mr-14 mt-4">
                    <label className="block text-sm font-bold text-zinc-700 mb-2">نسبة العربون (%)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={depositPercentage}
                        onChange={(e) => setDepositPercentage(Number(e.target.value))}
                        className="w-24 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
                      />
                      <span className="text-sm font-bold text-zinc-500">% من إجمالي الطلب</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">سياسات المتجر</h2>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-zinc-700">الشروط والسياسات</label>
            <textarea
              value={policies}
              onChange={(e) => setPolicies(e.target.value)}
              placeholder="اكتب هنا شروط وسياسات المتجر (الاسترجاع، التوصيل، إلخ)..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all min-h-[150px]"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-8 py-3 font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>
    </div>
  )
}
