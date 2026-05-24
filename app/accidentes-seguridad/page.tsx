"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Car,
  HelpCircle,
  MapPin,
  Shield,
  Zap,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAccidentes } from "@/lib/firebase/reportes"
import type { AccidenteSubtipo, MunicipioSlug, ReporteAccidente } from "@/types/reportes"

// ─── helpers ────────────────────────────────────────────────────────────────

function truncar(texto: string, max = 150): string {
  if (!texto) return ""
  return texto.length > max ? texto.slice(0, max) + "..." : texto
}

function formatFecha(iso?: string): string {
  if (!iso) return ""
  const [year, month, day] = iso.split("-")
  return `${day}/${month}/${year}`
}

const SUBTIPO_LABEL: Record<AccidenteSubtipo, string> = {
  "transito": "Accidente de tránsito",
  "robo-domiciliario": "Robo domiciliario",
  "robo-comercio": "Robo a comercio",
  "hurto": "Hurto",
  "moto-robada": "Moto robada",
  "vandalismo": "Vandalismo",
  "zona-peligrosa": "Zona peligrosa",
  "falta-iluminacion": "Falta de iluminación",
  "otro": "Otro",
}

const SUBTIPO_ICONO: Record<AccidenteSubtipo, React.ReactNode> = {
  "transito": <Car className="h-3.5 w-3.5" />,
  "robo-domiciliario": <Shield className="h-3.5 w-3.5" />,
  "robo-comercio": <Shield className="h-3.5 w-3.5" />,
  "hurto": <Shield className="h-3.5 w-3.5" />,
  "moto-robada": <Shield className="h-3.5 w-3.5" />,
  "vandalismo": <AlertTriangle className="h-3.5 w-3.5" />,
  "zona-peligrosa": <MapPin className="h-3.5 w-3.5" />,
  "falta-iluminacion": <Zap className="h-3.5 w-3.5" />,
  "otro": <HelpCircle className="h-3.5 w-3.5" />,
}

const GRAVEDAD_STYLE: Record<string, string> = {
  alta: "bg-red-100 text-red-800 border-red-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baja: "bg-green-100 text-green-800 border-green-200",
}

const GRAVEDAD_LABEL: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
}

const NIVEL_VERIFICACION_LABEL: Record<number, string> = {
  1: "Sin verificar",
  2: "Verificación básica",
  3: "Verificado",
  4: "Verificado con evidencia",
  5: "Verificación completa",
}

const MUNICIPIOS: { slug: MunicipioSlug; label: string }[] = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

const SUBTIPOS: { value: AccidenteSubtipo; label: string }[] = [
  { value: "transito", label: "Accidente de tránsito" },
  { value: "robo-domiciliario", label: "Robo domiciliario" },
  { value: "robo-comercio", label: "Robo a comercio" },
  { value: "hurto", label: "Hurto" },
  { value: "moto-robada", label: "Moto robada" },
  { value: "vandalismo", label: "Vandalismo" },
  { value: "zona-peligrosa", label: "Zona peligrosa" },
  { value: "falta-iluminacion", label: "Falta de iluminación" },
  { value: "otro", label: "Otro" },
]

// ─── component ──────────────────────────────────────────────────────────────

export default function AccidentesSeguridadPage() {
  const [municipioSlug, setMunicipioSlug] = useState<MunicipioSlug | undefined>()
  const [subtipo, setSubtipo] = useState<AccidenteSubtipo | undefined>()
  const [accidentes, setAccidentes] = useState<ReporteAccidente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAccidentes(municipioSlug).then((data) => {
      const filtered = subtipo ? data.filter((a) => a.subtipo === subtipo) : data
      setAccidentes(filtered as ReporteAccidente[])
      setLoading(false)
    })
  }, [municipioSlug, subtipo])

  // Stats
  const totalReportes = accidentes.length
  const porMunicipio = MUNICIPIOS.map((m) => ({
    label: m.label,
    count: accidentes.filter((a) => a.municipioSlug === m.slug).length,
  }))
  const subtipoCounts = SUBTIPOS.map((s) => ({
    label: s.label,
    value: s.value,
    count: accidentes.filter((a) => a.subtipo === s.value).length,
  }))
  const subtipoPrincipal = subtipoCounts.reduce(
    (prev, curr) => (curr.count > prev.count ? curr : prev),
    subtipoCounts[0],
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Seguridad y Accidentes
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Reportes ciudadanos anonimizados sobre hechos de inseguridad en el territorio.
            </p>
          </div>
        </div>
      </section>

      {/* Banner legal obligatorio */}
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900 leading-relaxed">
              <strong>Aviso legal:</strong> Los reportes publicados son anónimos y han sido revisados por el equipo
              editorial. No se publican nombres de personas, datos personales ni acusaciones individuales. Esta sección
              registra hechos georreferenciados con fines de análisis ciudadano.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <section className="bg-muted/30 py-8 mt-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
            Resumen de reportes ciudadanos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-3xl font-bold text-primary">{totalReportes}</p>
                <p className="text-xs text-muted-foreground mt-1">Total de reportes</p>
              </CardContent>
            </Card>
            {porMunicipio.map((m) => (
              <Card key={m.label}>
                <CardContent className="pt-4 pb-4">
                  <p className="text-3xl font-bold text-primary">{m.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </CardContent>
              </Card>
            ))}
            {subtipoPrincipal && subtipoPrincipal.count > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-4 pb-4">
                  <p className="text-3xl font-bold text-primary">{subtipoPrincipal.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Más frecuente: {subtipoPrincipal.label}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-xs">
            <Select
              value={municipioSlug ?? "todos"}
              onValueChange={(v) =>
                setMunicipioSlug(v === "todos" ? undefined : (v as MunicipioSlug))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los municipios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los municipios</SelectItem>
                {MUNICIPIOS.map((m) => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 max-w-xs">
            <Select
              value={subtipo ?? "todos"}
              onValueChange={(v) =>
                setSubtipo(v === "todos" ? undefined : (v as AccidenteSubtipo))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los subtipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {SUBTIPOS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="py-8 container mx-auto px-4">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : accidentes.length === 0 ? (
          <div className="text-center py-20">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No se encontraron reportes con los filtros seleccionados.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Probá cambiando el municipio o el tipo de hecho reportado.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {accidentes.map((reporte) => (
              <Card key={reporte.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  {/* Subtipo + gravedad */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      {SUBTIPO_ICONO[reporte.subtipo]}
                      {SUBTIPO_LABEL[reporte.subtipo]}
                    </Badge>
                    {reporte.gravedad && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          GRAVEDAD_STYLE[reporte.gravedad] ?? ""
                        }`}
                      >
                        {GRAVEDAD_LABEL[reporte.gravedad]}
                      </span>
                    )}
                    {reporte.huboDenunciaPolicial === "si" && (
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                        Con denuncia policial
                      </Badge>
                    )}
                  </div>

                  {/* Municipio y ubicación */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {reporte.municipio}
                      {reporte.ubicacionTexto ? ` — ${reporte.ubicacionTexto}` : ""}
                    </span>
                  </div>

                  {/* Fecha del hecho */}
                  {reporte.fechaHechoISO && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hecho reportado el {formatFecha(reporte.fechaHechoISO)}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex flex-col flex-1 pt-0">
                  {/* Descripción truncada */}
                  <p className="text-sm text-foreground leading-relaxed flex-1">
                    {truncar(reporte.descripcion)}
                  </p>

                  {/* Nivel de verificación */}
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                    Verificación: {NIVEL_VERIFICACION_LABEL[reporte.nivelVerificacion] ?? "Sin verificar"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Nota al pie */}
        <div className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            ¿Tenés información sobre un hecho presunto?{" "}
            <Link href="/cargar-reporte" className="text-primary font-medium hover:underline">
              Cargar Reporte
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
