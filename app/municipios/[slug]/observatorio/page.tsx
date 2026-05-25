"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Star,
  TrendingUp,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getObrasPublicas } from "@/lib/firebase/obras"
import { getPublicaciones } from "@/lib/firebase/publicaciones"
import { getReportes } from "@/lib/firebase/reportes"
import { getPedidosInformacion, getRankingMunicipios } from "@/lib/firebase/transparencia"
import type { ObraPublica } from "@/types/obras"
import type { Publicacion } from "@/lib/firebase/publicaciones"
import type { ReporteCiudadano } from "@/types/reportes"
import type { PedidoInformacion, RankingMunicipio } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NOMBRES_MUNICIPIO: Record<string, string> = {
  "charata": "Charata",
  "las-brenas": "Las Breñas",
  "corzuela": "Corzuela",
  "presidencia-roque-saenz-pena": "Presidencia Roque Sáenz Peña",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso?: string): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + "…"
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  color: string
}) {
  return (
    <Card className="text-center">
      <CardContent className="pt-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <p className="text-3xl font-bold text-slate-900">
          {value}
          {suffix && <span className="text-lg font-normal text-muted-foreground">{suffix}</span>}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-6 animate-pulse">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-slate-200" />
        </div>
        <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2" />
        <div className="h-4 bg-slate-200 rounded w-24 mx-auto" />
      </CardContent>
    </Card>
  )
}

function ObraCard({ obra }: { obra: ObraPublica }) {
  const estadoColors: Record<string, string> = {
    "en-ejecucion": "bg-blue-100 text-blue-700",
    "iniciada": "bg-blue-100 text-blue-700",
    "finalizada": "bg-green-100 text-green-700",
    "paralizada": "bg-red-100 text-red-700",
    "sin-informacion": "bg-slate-100 text-slate-600",
    "anunciada": "bg-amber-100 text-amber-700",
    "licitacion": "bg-purple-100 text-purple-700",
  }

  return (
    <div className="p-4 rounded-lg border bg-white hover:bg-muted/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 truncate">{obra.nombre}</h4>
          <p className="text-xs text-muted-foreground mt-1">{obra.ubicacionTexto}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="outline" className="text-xs capitalize">
            {obra.tipo.replace(/-/g, " ")}
          </Badge>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColors[obra.estado] ?? "bg-slate-100 text-slate-600"}`}
          >
            {obra.estado.replace(/-/g, " ")}
          </span>
        </div>
      </div>
    </div>
  )
}

function PublicacionCard({ pub }: { pub: Publicacion }) {
  const dateStr = formatDate(pub.publishedAt ?? pub.createdAt)
  return (
    <div className="p-4 rounded-lg border bg-white hover:bg-muted/30 transition-colors">
      <h4 className="font-medium text-slate-900 line-clamp-2">{pub.titulo}</h4>
      {pub.extracto && (
        <p className="text-sm text-muted-foreground mt-1">{truncate(pub.extracto, 100)}</p>
      )}
      {dateStr && <p className="text-xs text-muted-foreground mt-2">{dateStr}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

interface PageData {
  obras: ObraPublica[]
  reportes: ReporteCiudadano[]
  pedidos: PedidoInformacion[]
  ranking: RankingMunicipio | null
  publicaciones: Publicacion[]
}

export default function ObservatorioMunicipioPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const nombreMunicipio = NOMBRES_MUNICIPIO[slug]

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PageData>({
    obras: [],
    reportes: [],
    pedidos: [],
    ranking: null,
    publicaciones: [],
  })

  useEffect(() => {
    if (!nombreMunicipio) return

    void (async () => {
      const [obrasRes, reportesRes, pedidosRes, rankingRes, pubsRes] = await Promise.allSettled([
        getObrasPublicas({ municipioSlug: slug }),
        getReportes(slug),
        getPedidosInformacion(slug),
        getRankingMunicipios(),
        getPublicaciones(slug),
      ])

      const obras = obrasRes.status === "fulfilled" ? obrasRes.value : []
      const reportes = reportesRes.status === "fulfilled" ? reportesRes.value : []
      const pedidos = pedidosRes.status === "fulfilled" ? pedidosRes.value : []
      const todosRankings = rankingRes.status === "fulfilled" ? rankingRes.value : []
      const publicaciones = pubsRes.status === "fulfilled" ? pubsRes.value : []

      const ranking = todosRankings.find((r) => r.municipioSlug === slug) ?? null

      setData({ obras, reportes, pedidos, ranking, publicaciones })
      setLoading(false)
    })()
  }, [slug, nombreMunicipio])

  // Municipio no encontrado
  if (!nombreMunicipio) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Municipio no encontrado</h1>
            <p className="text-muted-foreground mb-8">
              El municipio <strong>{slug}</strong> no está en el sistema de observatorio.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const recentObras = data.obras.slice(0, 3)
  const recentPubs = data.publicaciones.slice(0, 3)
  const puntaje = data.ranking?.puntajeTotal ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
              <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
                <Home className="h-3.5 w-3.5" />
                Inicio
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href="/municipios" className="hover:text-white transition-colors">
                Municipios
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/municipios/${slug}`}
                className="hover:text-white transition-colors"
              >
                {nombreMunicipio}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Observatorio</span>
            </nav>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{nombreMunicipio}</h1>
                <p className="text-xl text-slate-300 mt-1">Observatorio de Transparencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="py-10 bg-slate-50 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  icon={Building2}
                  label="Obras registradas"
                  value={data.obras.length}
                  color="bg-blue-500"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Reportes ciudadanos"
                  value={data.reportes.length}
                  color="bg-amber-500"
                />
                <StatCard
                  icon={FileText}
                  label="Pedidos de información"
                  value={data.pedidos.length}
                  color="bg-purple-500"
                />
                <StatCard
                  icon={Star}
                  label="Puntaje de transparencia"
                  value={puntaje}
                  suffix="/100"
                  color="bg-green-600"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Obras recientes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Obras recientes
                </h2>
                <Link
                  href={`/obras-publicas?municipio=${slug}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ver todas →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-200 rounded-lg" />
                  ))}
                </div>
              ) : recentObras.length > 0 ? (
                <div className="space-y-3">
                  {recentObras.map((obra) => (
                    <ObraCard key={obra.id} obra={obra} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed text-center text-muted-foreground">
                  No hay obras registradas aún
                </div>
              )}
            </div>

            {/* Últimas noticias */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Últimas noticias
                </h2>
                <Link
                  href={`/publicaciones?municipio=${slug}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Ver todas →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-200 rounded-lg" />
                  ))}
                </div>
              ) : recentPubs.length > 0 ? (
                <div className="space-y-3">
                  {recentPubs.map((pub) => (
                    <PublicacionCard key={pub.id} pub={pub} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed text-center text-muted-foreground">
                  No hay noticias publicadas aún
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation links */}
      <section className="py-12 bg-slate-50 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Explorar más sobre {nombreMunicipio}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`/obras-publicas?municipio=${slug}`} className="group">
                <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      Ver todas las obras
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/pedidos-informacion" className="group">
                <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2 group-hover:bg-purple-200 transition-colors">
                      <ClipboardList className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      Pedidos de información
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/ranking-transparencia" className="group">
                <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      Ranking completo
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/cargar-reporte" className="group">
                <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
                      <MessageSquare className="h-5 w-5 text-amber-600" />
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight">
                      Cargar reporte
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
