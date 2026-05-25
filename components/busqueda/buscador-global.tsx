"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BuscadorGlobalProps {
  className?: string
}

export function BuscadorGlobal({ className }: BuscadorGlobalProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mobileOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [mobileOpen])

  function handleSearch() {
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`)
    setMobileOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch()
    if (e.key === "Escape") {
      setMobileOpen(false)
      setQuery("")
    }
  }

  return (
    <>
      {/* Desktop: compact search bar, hidden on mobile */}
      <div className={`hidden lg:flex items-center relative w-64 ${className ?? ""}`}>
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Buscar obras, pedidos, noticias..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 pl-8 pr-8 text-sm bg-slate-50 border-slate-200 focus-visible:ring-[#08707b]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 text-muted-foreground hover:text-slate-700"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Mobile: icon button that expands to full-width input */}
      <div className="flex lg:hidden items-center">
        {mobileOpen ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 w-48 pl-8 text-sm bg-slate-50 border-slate-200 focus-visible:ring-[#08707b]"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => { setMobileOpen(false); setQuery("") }}
              aria-label="Cerrar búsqueda"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir búsqueda"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  )
}
