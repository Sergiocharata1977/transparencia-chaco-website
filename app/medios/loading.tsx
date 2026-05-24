import { Skeleton } from "@/components/ui/skeleton"

export default function MediosLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b bg-background" />

      {/* Hero skeleton */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mx-auto mb-4 bg-primary-foreground/20" />
          <Skeleton className="h-5 w-full mx-auto bg-primary-foreground/20" />
          <Skeleton className="h-5 w-5/6 mx-auto mt-2 bg-primary-foreground/20" />
        </div>
      </div>

      {/* Banner institucional skeleton */}
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>

      {/* Filtros skeleton */}
      <div className="container mx-auto px-4 pb-6">
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Grid de cards skeleton */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-36 rounded-full" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
