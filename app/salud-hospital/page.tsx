"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  Heart,
  HelpCircle,
  Package,
  ShieldAlert,
  Truck,
  UserX,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getReportesSalud } from "@/lib/firebase/reportes"
import type { MunicipioSlug, ReporteSalud, SaludTipo } from "@/types/reportes"

// ---- helpers ----------------------------------------------------------------

const MUNICIPIOS: { slug: MunicipioSlug; label: string }[] = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

const TIPOS_PROBLEMA: { value: SaludTipo; label: string }[] = [
  { value: "falta-medicos", label: "Falta de médicos" },
  { value: "falta-insumos", label: "Falta de insumos" },
  { value: "demoras", label: "Demoras en atención" },
  { value: "derivaciones", label: "Derivaciones" },
  { value: "ambulancia", label: "Ambulancia" },
  { value: "guardia-saturada", label: "Guardia saturada" },
  { value: "infraestructura", label: "Infraestructura" },
  { value: "turnos", label: "Turnos" },
  { value: "atencion", label: "Atención" },
  { value: "otro", label: "Otro" },
]

function tipoLabel(tipo: SaludTipo): string {
  return TIPOS_PROBLEMA.find((t) => t.value === tipo)?.label ?? tipo
}

function TipoIcon({ tipo, className }: { tipo: SaludTipo; className?: string }) {
  const props = { className: className ?? "h-6 w-6" }
  switch (tipo) {
    case "falta-medicos":
      return <UserX {...props} />
    case "falta-insumos":
      return <Package {...props} />
    case "demoras":
      return <Clock {...props} />
    case "derivaciones":
      return <ArrowRight {...props} />
    case "ambulancia":
      return <Truck {...props} />
    case "guardia-saturada":
      return <AlertTriangle {...props} />
    case "infraestructura":
      return <Building2 {...props} />
    case "turnos":
      return <Calendar {...props} />
    case "atencion":
      return <Heart {...props} />
    default:
      return <HelpCircle {...props} />
  }
}

function truncar(texto: string, max = 120): string {
  if (texto.length <= max) return texto
  return texto.slice(0, max).trimEnd() + "..."
}

function formatFecha(iso?: string): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  } catch {
    return iso
  }
}

function nivelVerificacionLabel(nivel: number): string {
  const labels: Record<number, string> = {
    1: "Recibido",
    2: "En revisión",
    3: "Verificado parcialmente",
    4: "Verificado",
    5: "Verificado completamente",
  }
  return labels[nivel] ?? `Nivel ${nivel}`
}

// ---- stats helpers ----------------------------------------------------------

function topTipos(reportes: ReporteSalud[], n = 4): { tipo: SaludTipo; count: number }[] {
  const counts: Partial<Record<SaludTipo, number>> = {}
  for (const r of reportes) {
    counts[r.tipoProblema] = (counts[r.tipoProblema] ?? 0) + 1
  }
  return (Object.entries(counts) as [SaludTipo, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([tipo, count]) => ({ tipo, count }))
}

function countByMunicipio(reportes: ReporteSalud[]): { municipio: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const r of reportes) {
    counts[r.municipio] = (counts[r.municipio] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([municipio, count]) => ({ municipio, count }))
}

// ---- page -------------------------------------------------------------------

export default function SaludHospitalPage() {
  const [municipioSlug, setMunicipioSlug] = useState<string | undefined>()
  const [tipoProblema, setTipoProblema] = useState<SaludTipo | undefined>()
  const [reportes, setReportes] = useState<ReporteSalud[]>([])
  const [todosReportes, setTodosReportes] = useState<ReporteSalud[]>([])
  const [loading, setLoading] = useState(true)

  // Load all reports once for stats; filtered list re-derives from them
  useEffect(() => {
    getReportesSalud().then((data) => {
      setTodosReportes(data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    getReportesSalud(municipioSlug).then((data) => {
      const filtered = tipoProblema ? data.filter((r) => r.tipoProblema === tipoProblema) : data
      setReportes(filtered)
      setLoading(false)
    })
  }, [municipioSlug, tipoProblema])

  const topTiposData = topTipos(todosReportes)
  const porMunicipio = countByMunicipio(todosReportes)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Salud Pública y Hospital</h1>
            <p className="text-lg text-primary-foreground/90">
              Reclamos ciudadanos sobre el sistema de salud local. Información anonimizada y verificada.
            </p>
          </div>
        </div>
      </section>

      {/* Banner de privacidad médica */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 max-w-4xl mx-auto">
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 leading-relaxed">
              <strong>Privacidad médica garantizada.</strong> No se publican diagnósticos, historias clínicas ni datos
              personales de pacientes. Los reclamos son anónimos. Esta información sirve para identificar problemas
              sistémicos en el servicio de salud pública, no para identificar personas.
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6">Resumen de reclamos</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Total */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de reclamos registrados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{todosReportes.length}</p>
              </CardContent>
            </Card>

            {/* Tipos más frecuentes */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tipos de problema más frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                {topTiposData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                ) : (
                  <ul className="space-y-1">
                    {topTiposData.map(({ tipo, count }) => (
                      <li key={tipo} className="flex justify-between text-sm">
                        <span>{tipoLabel(tipo)}</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Por municipio */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Desglose por municipio</CardTitle>
              </CardHeader>
              <CardContent>
                {porMunicipio.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos</p>
                ) : (
                  <ul className="space-y-1">
                    {porMunicipio.map(({ municipio, count }) => (
                      <li key={municipio} className="flex justify-between text-sm">
                        <span>{municipio}</span>
                        <span className="font-semibold">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            {/* Filtro municipio */}
            <div className="flex-1">
              <Select
                value={municipioSlug ?? "todos"}
                onValueChange={(v) => setMunicipioSlug(v === "todos" ? undefined : v)}
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

            {/* Filtro tipo de problema */}
            <div className="flex-1">
              <Select
                value={tipoProblema ?? "todos"}
                onValueChange={(v) => setTipoProblema(v === "todos" ? undefined : (v as SaludTipo))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_PROBLEMA.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Listado de reclamos */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : reportes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No se encontraron reclamos con los filtros seleccionados.</p>
              <p className="text-sm mt-2">Probá cambiando el municipio o el tipo de problema.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {reportes.map((reporte) => (
                <Card key={reporte.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-primary">
                        <TipoIcon tipo={reporte.tipoProblema} className="h-5 w-5" />
                      </span>
                      <CardTitle className="text-base leading-tight">
                        {tipoLabel(reporte.tipoProblema)}
                      </CardTitle>
                    </div>

                    {/* Hospital / centro de salud */}
                    {reporte.hospital && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        {reporte.hospital}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 flex-1">
                    {/* Municipio + fecha */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{reporte.municipio}</span>
                      {reporte.fechaHechoISO && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatFecha(reporte.fechaHechoISO)}
                        </span>
                      )}
                    </div>

                    {/* Descripción truncada — NUNCA diagnósticos ni datos personales */}
                    {reporte.descripcion && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Según reporte: {truncar(reporte.descripcion)}
                      </p>
                    )}

                    {/* Badges de estado */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                      {reporte.hizoReclamoFormal === true && (
                        <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                          Con reclamo formal
                        </Badge>
                      )}
                      {reporte.recibioRespuesta === true && (
                        <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-xs">
                          Recibió respuesta
                        </Badge>
                      )}
                    </div>

                    {/* Nivel de verificación */}
                    <p className="text-xs text-muted-foreground">
                      Verificación: {nivelVerificacionLabel(reporte.nivelVerificacion)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nota al pie — CTA para cargar reporte */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Tuviste un problema con el sistema de salud?{" "}
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
