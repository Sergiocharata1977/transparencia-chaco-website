import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProveedoresEstadoLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <div className="bg-primary py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Skeleton className="h-10 w-3/4 mx-auto bg-primary-foreground/20" />
            <Skeleton className="h-5 w-2/3 mx-auto bg-primary-foreground/20" />
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
