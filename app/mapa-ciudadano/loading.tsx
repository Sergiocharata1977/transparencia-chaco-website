export default function MapaCiudadanoLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/20 animate-pulse mx-auto" />
            <div className="h-10 w-64 bg-primary-foreground/20 animate-pulse rounded mx-auto" />
            <div className="h-5 w-80 bg-primary-foreground/20 animate-pulse rounded mx-auto" />
          </div>
        </div>
      </div>
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-xs mb-6">
            <div className="h-4 w-32 bg-muted animate-pulse rounded mb-2" />
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
          </div>
          <div className="h-[500px] bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  )
}
