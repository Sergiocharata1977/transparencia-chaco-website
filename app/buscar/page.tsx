"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, Building2, Newspaper, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getObrasPublicas } from "@/lib/firebase/obras"
import { getPublicaciones } from "@/lib/firebase/publicaciones"
import { getPedidosInformacion } from "@/lib/firebase/transparencia"
import type { ObraPublica } from "@/types/obras"
import type { Publicacion } from "@/lib/firebase/publicaciones"
import type { PedidoInformacion } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Compact result cards
// ---------------------------------------------------------------------------

function ObraCard({ obra }: { obra: ObraPublica }) {
  return (
    <Link
      href={`/obras-publicas/${obra.id}`}
      className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#08707b] hover:shadow-sm"
    >
      <span className="font-semibold text-slate-900 line-clamp-2">{obra.nombre}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {obra.municipio && <span>{obra.municipio}</span>}
        {obra.tipo && (
          <Badge variant="secondary" className="capitalize text-xs">
            {obra.tipo}
          </Badge>
        )}
        {obra.estado && (
          <Badge variant="outline" className="text-xs">
            {obra.estado}
          </Badge>
        )}
      </div>
      {obra.descripcion && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{obra.descripcion}</p>
      )}
    </Link>
  )
}

function NoticiaCard({ publicacion }: { publicacion: Publicacion }) {
  return (
    <Link
      href={`/publicaciones/${publicacion.id}`}
      className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#08707b] hover:shadow-sm"
    >
      <span className="font-semibold text-slate-900 line-clamp-2">{publicacion.titulo}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {publicacion.municipio && <span>{publicacion.municipio}</span>}
        {publicacion.categoria && (
          <Badge variant="secondary" className="capitalize text-xs">
            {publicacion.categoria}
          </Badge>
        )}
      </div>
      {publicacion.extracto && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{publicacion.extracto}</p>
      )}
    </Link>
  )
}

function PedidoCard({ pedido }: { pedido: PedidoInformacion }) {
  return (
    <Link
      href={`/pedidos-informacion/${pedido.id}`}
      className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-[#08707b] hover:shadow-sm"
    >
      <span className="font-semibold text-slate-900 line-clamp-2">{pedido.tema}</span>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {pedido.municipio && <span>{pedido.municipio}</span>}
        {pedido.organismo && <span>{pedido.organismo}</span>}
        {pedido.estado && (
          <Badge variant="outline" className="text-xs">
            {pedido.estado}
          </Badge>
        )}
      </div>
      {pedido.textoPedido && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{pedido.textoPedido}</p>
      )}
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Section skeleton
// ---------------------------------------------------------------------------

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-slate-800">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main content (uses useSearchParams — must be inside Suspense)
// ---------------------------------------------------------------------------

function BuscarContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""

  const [obras, setObras] = useState<ObraPublica[]>([])
  const [noticias, setNoticias] = useState<Publicacion[]>([])
  const [pedidos, setPedidos] = useState<PedidoInformacion[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setSearched(false)
      setObras([])
      setNoticias([])
      setPedidos([])
      return
    }

    setLoading(true)
    setSearched(false)

    const q = query.toLowerCase().trim()

    Promise.allSettled([
      getObrasPublicas(),
      getPublicaciones(),
      getPedidosInformacion(),
    ]).then(([obrasResult, noticiasResult, pedidosResult]) => {
      const allObras = obrasResult.status === "fulfilled" ? obrasResult.value : []
      const allNoticias = noticiasResult.status === "fulfilled" ? noticiasResult.value : []
      const allPedidos = pedidosResult.status === "fulfilled" ? pedidosResult.value : []

      setObras(
        allObras.filter(
          (item) =>
            item.nombre?.toLowerCase().includes(q) ||
            item.descripcion?.toLowerCase().includes(q) ||
            item.municipio?.toLowerCase().includes(q),
        ),
      )

      setNoticias(
        allNoticias.filter(
          (item) =>
            item.titulo?.toLowerCase().includes(q) ||
            (item.extracto ?? "").toLowerCase().includes(q) ||
            item.municipio?.toLowerCase().includes(q),
        ),
      )

      setPedidos(
        allPedidos.filter(
          (item) =>
            item.tema?.toLowerCase().includes(q) ||
            (item.textoPedido ?? "").toLowerCase().includes(q) ||
            item.municipio?.toLowerCase().includes(q) ||
            item.organismo?.toLowerCase().includes(q),
        ),
      )

      setLoading(false)
      setSearched(true)
    })
  }, [query])

  const totalResults = obras.length + noticias.length + pedidos.length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-[#08707b]" />
            <h1 className="text-2xl font-black text-slate-950">
              {query ? (
                <>
                  Resultados para:{" "}
                  <span className="text-[#08707b]">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                "Buscador"
              )}
            </h1>
          </div>
          {searched && !loading && (
            <p className="text-sm text-muted-foreground">
              {totalResults === 0
                ? `No se encontraron resultados para "${query}"`
                : `${totalResults} resultado${totalResults !== 1 ? "s" : ""} encontrado${totalResults !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {/* No query */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground gap-3">
            <Search className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">Ingresá un término para buscar</p>
            <p className="text-sm">Podés buscar obras públicas, noticias y pedidos de información</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-10">
            <SectionSkeleton title="Obras públicas" />
            <SectionSkeleton title="Noticias" />
            <SectionSkeleton title="Pedidos de información" />
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <div className="flex flex-col gap-10">
            {/* Obras */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-[#08707b]" />
                <h2 className="text-lg font-bold text-slate-800">
                  Obras públicas{" "}
                  <span className="text-muted-foreground font-normal">({obras.length})</span>
                </h2>
              </div>
              {obras.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {obras.map((obra) => (
                    <ObraCard key={obra.id} obra={obra} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 px-1">
                  Sin resultados en esta categoría
                </p>
              )}
            </section>

            {/* Noticias */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="h-5 w-5 text-[#08707b]" />
                <h2 className="text-lg font-bold text-slate-800">
                  Noticias{" "}
                  <span className="text-muted-foreground font-normal">({noticias.length})</span>
                </h2>
              </div>
              {noticias.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {noticias.map((n) => (
                    <NoticiaCard key={n.id} publicacion={n} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 px-1">
                  Sin resultados en esta categoría
                </p>
              )}
            </section>

            {/* Pedidos */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-[#08707b]" />
                <h2 className="text-lg font-bold text-slate-800">
                  Pedidos de información{" "}
                  <span className="text-muted-foreground font-normal">({pedidos.length})</span>
                </h2>
              </div>
              {pedidos.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pedidos.map((p) => (
                    <PedidoCard key={p.id} pedido={p} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 px-1">
                  Sin resultados en esta categoría
                </p>
              )}
            </section>

            {/* Zero results */}
            {totalResults === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                <p className="text-base font-medium">
                  No se encontraron resultados para &ldquo;{query}&rdquo;
                </p>
                <p className="text-sm">Intentá con otros términos o revisá la ortografía</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page export — wraps BuscarContent in Suspense (required for useSearchParams)
// ---------------------------------------------------------------------------

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-[#08707b] border-t-transparent animate-spin" />
        </div>
      }
    >
      <BuscarContent />
    </Suspense>
  )
}
