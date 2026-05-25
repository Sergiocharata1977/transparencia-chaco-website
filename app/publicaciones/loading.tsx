export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="animate-pulse bg-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 h-10 w-2/3 rounded bg-slate-700" />
            <div className="mx-auto h-5 w-1/2 rounded bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-10 rounded-md bg-slate-200" />
              <div className="h-10 rounded-md bg-slate-200" />
              <div className="h-10 rounded-md bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid animate-pulse gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border bg-white">
                  <div className="h-48 w-full bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-24 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-200" />
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-9 w-full rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
