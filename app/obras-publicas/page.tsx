import { Suspense } from "react"

import { ObrasPublicasContent } from "./_content"

export default function ObrasPublicasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <ObrasPublicasContent />
    </Suspense>
  )
}
