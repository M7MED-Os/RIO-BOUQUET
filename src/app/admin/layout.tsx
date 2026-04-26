import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Flower2, LayoutDashboard, PlusCircle, Ticket, ClipboardList, Settings } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import AdminMobileMenu from '@/components/AdminMobileMenu'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-zinc-50" dir="rtl">
      {user && (
        <nav className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                  <div className="flex flex-col text-right">
                    <span className="text-xl font-black text-zinc-900 tracking-tight leading-none">RIO BOUQUET</span>
                    <span className="text-[10px] font-bold text-rose-500 text-left tracking-[0.2em] mt-1">ADMIN</span>
                  </div>
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-rose-100 transition-transform group-hover:scale-105">
                    <img src="/logo.jpg" alt="Logo" className="object-cover h-full w-full" />
                  </div>
                </Link>
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Product
                  </Link>
                  <Link
                    href="/admin/coupons"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Ticket className="h-4 w-4" />
                    Coupons
                  </Link>
                  <Link
                    href="/admin/orders"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Orders
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-zinc-400 sm:inline-block truncate max-w-[200px]">
                  {user.email}
                </span>
                <LogoutButton />
                <AdminMobileMenu />
              </div>
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  )
}
