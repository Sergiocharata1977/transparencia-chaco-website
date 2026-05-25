export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/20 animate-pulse">
      <div className="h-14 bg-slate-900" />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header skeleton */}
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-5 bg-muted rounded w-1/2" />

        {/* 4 stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-5 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-200 rounded w-3/4" />
            </div>
          ))}
        </div>

        {/* Section 1 */}
        <div className="space-y-3 pt-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 pt-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-white p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
