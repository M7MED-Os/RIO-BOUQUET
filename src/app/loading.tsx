import { Flower2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Skeleton */}
      <div className="mb-16 h-48 w-full animate-pulse rounded-3xl bg-zinc-100" />

      {/* Title Skeleton */}
      <div className="mb-12 flex flex-col items-center">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-zinc-100 mb-4" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-zinc-100" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col rounded-3xl border border-zinc-100 bg-white p-4 shadow-sm overflow-hidden">
            <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-zinc-50" />
            <div className="mt-6 space-y-3">
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-8 w-1/3 animate-pulse rounded-lg bg-zinc-100 pt-2" />
              <div className="flex gap-2 pt-4">
                <div className="h-12 flex-[2] animate-pulse rounded-xl bg-zinc-100" />
                <div className="h-12 flex-1 animate-pulse rounded-xl bg-zinc-50" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
