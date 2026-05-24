import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RankingTransparenciaLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b h-16 bg-background" />

      {/* Hero skeleton */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-4">
          <Skeleton className="h-10 w-3/4 mx-auto bg-primary-foreground/20" />
          <Skeleton className="h-5 w-1/2 mx-auto bg-primary-foreground/20" />
        </div>
      </div>

      {/* Cards de puntaje skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-12 w-16" />
                  <Skeleton className="h-5 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tabla skeleton */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-7 w-48 mb-6" />
          <div className="rounded-lg border overflow-hidden">
            {/* Header row */}
            <div className="flex gap-4 p-3 border-b bg-muted/50">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {/* Data rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3 border-b last:border-0">
                {Array.from({ length: 9 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
