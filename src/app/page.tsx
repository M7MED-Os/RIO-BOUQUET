import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import WhatsAppButton from '@/components/WhatsAppButton'
import { Flower2, MapPin, Phone, Star, Truck, ShieldCheck, HeartHandshake } from 'lucide-react'

import SearchFilter from '@/components/SearchFilter'
import MobileMenu from '@/components/MobileMenu'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { q, category } = await searchParams

  let query = supabase.from('products').select('*').order('created_at', { ascending: false })

  if (q && typeof q === 'string') {
    query = query.ilike('name', `%${q}%`)
  }
  if (category && typeof category === 'string') {
    query = query.eq('category', category)
  }

  const { data: products } = await query

  // Get distinct categories
  const { data: allProducts } = await supabase.from('products').select('category').not('category', 'is', null)
  const categories = Array.from(new Set(allProducts?.map(p => p.category).filter(Boolean) as string[]))

  return (
    <div className="min-h-screen bg-[#fffbfc]" dir="rtl">

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo - First Child = Right in RTL */}
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

          {/* Navigation - Second Child = Left in RTL */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-bold text-zinc-600">
              <li><a href="#products" className="hover:text-rose-600 transition-colors">منتجاتنا</a></li>
              <li><a href="#features" className="hover:text-rose-600 transition-colors">لماذا نحن</a></li>
              <li><a href="#contact" className="hover:text-rose-600 transition-colors">اتصل بنا</a></li>
            </ul>
          </nav>
          <MobileMenu />
        </div>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-rose-50 via-pink-50 to-white py-24 text-center">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-pink-200/40 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4">
            <span className="inline-block rounded-full bg-rose-100 px-4 py-1.5 text-sm font-bold text-rose-600 mb-6 shadow-sm">
              🌸 الجودة الأولى في مصر
            </span>
            <h1 className="text-5xl font-extrabold leading-tight text-zinc-900 sm:text-6xl">
              أجمل الزهور<br />
              <span className="text-rose-600">لكل مناسباتكم</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-500 leading-relaxed">
              نقدم لكم تشكيلة واسعة من الورود الطبيعية والبوكيهات المصممة يدوياً لتناسب ذوقكم الرفيع
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 hover:-translate-y-0.5"
              >
                تصفح المنتجات 🌺
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-rose-200 px-8 py-4 text-base font-bold text-rose-600 transition hover:bg-rose-50 hover:-translate-y-0.5"
              >
                تواصل معنا
              </a>
            </div>
          </div>
        </section>

        {/* ===== WHY US (FEATURES) ===== */}
        <section id="features" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-zinc-900 sm:text-4xl">لماذا تختار RIO BOUQUET؟</h2>
              <div className="mt-4 mx-auto h-1.5 w-20 rounded-full bg-rose-600" />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: Truck,
                  title: 'توصيل سريع وآمن',
                  desc: 'نضمن وصول زهوركم طازجة وبأسرع وقت لجميع مناطق القاهرة والجيزة.',
                  color: 'bg-blue-50 text-blue-600',
                },
                {
                  icon: ShieldCheck,
                  title: 'جودة مضمونة 100%',
                  desc: 'نختار كل زهرة بعناية فائقة من أفضل المشاتل لنضمن لكم التميز والجمال.',
                  color: 'bg-green-50 text-green-600',
                },
                {
                  icon: HeartHandshake,
                  title: 'تنسيق يدوي احترافي',
                  desc: 'بوكيهاتنا مصممة بكل حب بأيدي خبراء تنسيق الزهور لتناسب جميع مناسباتكم.',
                  color: 'bg-rose-50 text-rose-600',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center"
                >
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-xl font-black text-zinc-900">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
                  {/* Decorative number */}
                  <span className="absolute -bottom-4 -right-4 text-8xl font-black text-zinc-50 opacity-[0.03] select-none">
                    0{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRODUCTS GRID ===== */}
        <section id="products" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-extrabold text-zinc-900">أحدث المنتجات</h2>
            <p className="mt-3 text-zinc-500">اختر من أجمل تشكيلاتنا</p>
          </div>

          <SearchFilter categories={categories} currentCategory={typeof category === 'string' ? category : undefined} currentQuery={typeof q === 'string' ? q : undefined} />

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-md hover:shadow-xl border border-rose-50 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Card Image */}
                  <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-rose-50">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Flower2 className="h-16 w-16 text-rose-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5 text-right">
                    <div className="flex items-center justify-end gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 leading-snug">
                      <Link href={`/products/${product.id}`} className="hover:text-rose-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    {product.description && (
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-auto pt-5">
                      {product.price && (
                        <div className="text-xl font-black text-rose-600 mb-4">
                          {Number(product.price).toFixed(2)} ج.م
                        </div>
                      )}
                      <div className="flex gap-2">
                        <WhatsAppButton product={product} className="flex-[2] h-11 rounded-xl text-xs" />
                        <Link
                          href={`/products/${product.id}`}
                          className="flex flex-1 items-center justify-center h-11 rounded-xl border-2 border-rose-100 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          المعاينة
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 mb-6">
                <Flower2 className="h-12 w-12 text-rose-200" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-700">قريباً...</h3>
              <p className="mt-2 text-zinc-500">يتم إضافة منتجات جديدة، تابعونا!</p>
            </div>
          )}
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer id="contact" className="bg-[#111] text-zinc-400 pt-20 pb-10" dir="rtl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">

            {/* Column 1: Brand */}
            <div className="lg:col-span-2 text-right">
              <Link href="/" className="flex items-center gap-4 mb-6 group">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-rose-100/20 shadow-xl transition-transform group-hover:rotate-3">
                  <Image
                    src="/logo.jpg"
                    alt="RIO BOUQUET Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white tracking-tight leading-none">RIO BOUQUET</span>
                  <span className="text-[10px] font-bold text-rose-500 tracking-[0.3em] mt-1">RIHAM MOHAMED</span>
                </div>
              </Link>
              <p className="text-lg leading-relaxed text-zinc-400 max-w-md">
                وجهتكم الأولى لأجمل تنسيقات الزهور الطبيعية في مصر. نصمم كل بوكيه ليكون ذكرى لا تُنسى، مع خدمة توصيل سريعة لجميع أنحاء القاهرة.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="text-right">
              <h4 className="text-lg font-bold text-white mb-8 border-r-4 border-rose-600 pr-4">روابط سريعة</h4>
              <ul className="space-y-4">
                <li><a href="#products" className="hover:text-rose-500 transition-colors">منتجاتنا</a></li>
                <li><a href="#features" className="hover:text-rose-500 transition-colors">لماذا نحن</a></li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="text-right">
              <h4 className="text-lg font-bold text-white mb-8 border-r-4 border-rose-600 pr-4">تواصل معنا</h4>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-rose-500">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">العنوان</p>
                    <p className="mt-0.5 text-zinc-500">القاهرة، مصر</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <a href="https://api.whatsapp.com/send?phone=201124417693" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">واتساب</p>
                    <p className="mt-0.5 text-zinc-500" dir="ltr">011 24417693</p>
                  </div>
                </a>

                {/* Facebook */}
                <a href="https://www.facebook.com/profile.php?id=61578862020094" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-blue-500 group-hover:bg-[#1877F2] group-hover:text-white transition-all">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">فيسبوك</p>
                    <p className="mt-0.5 text-zinc-500">تابعونا على صفحتنا</p>
                  </div>
                </a>

                {/* Instagram */}
                <a href="https://www.instagram.com/rio_bouquet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-pink-500 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-white">إنستجرام</p>
                    <p className="mt-0.5 text-zinc-500">شاهد أجمل اللقطات</p>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-20 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} RIO BOUQUET. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
