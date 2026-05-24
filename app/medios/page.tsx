"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Newspaper } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getMedios } from "@/lib/firebase/transparencia"
import type { Medio, SemaforoColor } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIPO_LABELS: Record<string, string> = {
  radio: "Radio",
  "portal-web": "Portal web",
  "canal-tv": "Canal TV",
  streaming: "Streaming",
  grafica: "Gráfica",
  "red-social": "Red social",
  otro: "Otro",
}

function getSemaforoConfig(semaforo?: SemaforoColor): {
  className: string
  label: string
} {
  switch (semaforo) {
    case "verde":
      return { className: "bg-green-100 text-green-800", label: "Alta transparencia" }
    case "amarillo":
      return { className: "bg-yellow-100 text-yellow-800", label: "Información incompleta" }
    case "rojo":
      return { className: "bg-red-100 text-red-800", label: "Baja transparencia" }
    default:
      return { className: "bg-gray-100 text-gray-600", label: "Sin datos suficientes" }
  }
}

function getPautaLabel(recibePautaOficial?: boolean): string {
  if (recibePautaOficial === true) return "Sí"
  if (recibePautaOficial === false) return "No"
  return "Sin datos"
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------

function MedioCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
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
  )
}

// ---------------------------------------------------------------------------
// Ciudad slugs disponibles
// ---------------------------------------------------------------------------

const CIUDADES: { slug: string; label: string }[] = [
  { slug: "charata", label: "Charata" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
  { slug: "general-pinedo", label: "General Pinedo" },
  { slug: "villa-angela", label: "Villa Ángela" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "quitilipi", label: "Quitilipi" },
  { slug: "corzuela", label: "Corzuela" },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MediosPage() {
  const [ciudadSlug, setCiudadSlug] = useState<string | undefined>()
  const [medios, setMedios] = useState<Medio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMedios(ciudadSlug).then((data) => {
      setMedios(data)
      setLoading(false)
    })
  }, [ciudadSlug])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Newspaper className="h-12 w-12 text-primary-foreground/80" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Observatorio de Medios, Pauta Oficial y Transparencia Informativa
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Registramos medios de comunicación locales, su vínculo económico con el Estado y su
              cobertura de temas de interés público.
            </p>
          </div>
        </div>
      </section>

      {/* Banner institucional */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-blue-900 text-sm md:text-base text-center font-medium">
            La pauta oficial no es ilegal. Ocultarla debilita la confianza pública. Medimos datos,
            no perseguimos opiniones.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="container mx-auto px-4 pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Filtrar por ciudad:</span>
          <Select
            value={ciudadSlug ?? "todos"}
            onValueChange={(val) => setCiudadSlug(val === "todos" ? undefined : val)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todas las ciudades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas las ciudades</SelectItem>
              {CIUDADES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de medios */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MedioCardSkeleton key={i} />
            ))}
          </div>
        ) : medios.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No se encontraron medios para los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {medios.map((medio) => {
              const semConfig = getSemaforoConfig(medio.semaforo)
              return (
                <Card key={medio.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold leading-tight">
                        {medio.nombre}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {TIPO_LABELS[medio.tipo] ?? medio.tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{medio.ciudadPrincipal}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 flex-1">
                    {/* Semáforo */}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold w-fit ${semConfig.className}`}
                    >
                      {semConfig.label}
                    </span>

                    {/* Índice */}
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Índice transparencia: </span>
                      {medio.indiceTransparencia !== undefined
                        ? `${medio.indiceTransparencia}/100`
                        : "Sin evaluar"}
                    </p>

                    {/* Pauta */}
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Recibe pauta oficial: </span>
                      {getPautaLabel(medio.recibePautaOficial)}
                    </p>

                    {/* Botón */}
                    <div className="mt-auto pt-2">
                      <Link href={`/medios/${medio.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver ficha completa
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Nota legal en footer */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-gray-50 rounded border p-4 text-sm text-muted-foreground text-center">
          Este observatorio publica datos de interés público con base en fuentes documentales y
          pedidos de información. Todo medio mencionado puede solicitar corrección o derecho a
          respuesta.
        </div>
      </div>

      <Footer />
    </div>
  )
}
