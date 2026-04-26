'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Flower2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-white px-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -top-20 -right-20 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-20 -left-20 h-80 w-80 rounded-full bg-pink-200/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl bg-white p-10 shadow-2xl shadow-rose-100 border border-rose-100">
          {/* Logo */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-rose-100 shadow-xl">
              <img src="/logo.jpg" alt="Logo" className="object-cover h-full w-full" />
            </div>
            <h1 className="mt-4 text-2xl font-black text-zinc-900 leading-tight">RIO BOUQUET</h1>
            <p className="mt-1 text-sm text-zinc-500 font-bold tracking-widest text-rose-500">ADMIN LOGIN</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2" dir="ltr">
              <label className="block text-right text-sm font-semibold text-zinc-700">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2" dir="ltr">
              <label className="block text-right text-sm font-semibold text-zinc-700">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 text-right">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-rose-600 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-zinc-400 hover:text-rose-600 transition-colors">
              ← العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
