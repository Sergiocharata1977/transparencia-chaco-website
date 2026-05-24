"use client"

import { useMemo, useState, useEffect } from "react"
import { Building2, FileText, MapPin, DollarSign, Calendar, AlertCircle } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getProveedores } from "@/lib/firebase/transparencia"
import type { ContratacionTipo, CumplimientoEstado, ProveedorEstado, SemaforoColor } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIPO_LABEL: Record<ContratacionTipo, string> = {
  licitacion: "Licitación pública",
  "contratacion-directa": "Contratación directa",
  concurso: "Concurso de precios",
  convenio: "Convenio",
  desconocido: "Tipo no informado",
}

const CIUDADES = [
  { slug: "charata", label: "Charata" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
  { slug: "general-pinedo", label: "General Pinedo" },
  { slug: "villa-angela", label: "Villa Ángela" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "quitilipi", label: "Quitilipi" },
]

const TIPOS_CONTRATACION: { value: ContratacionTipo; label: string }[] = [
  { value: "licitacion", label: "Licitación pública" },
  { value: "contratacion-directa", label: "Contratación directa" },
  { value: "concurso", label: "Concurso de precios" },
  { value: "convenio", label: "Convenio" },
  { value: "desconocido", label: "Tipo no informado" },
]

function getSemaforoClasses(semaforo?: SemaforoColor): { bg: string; label: string } {
  switch (semaforo) {
    case "verde":
      return { bg: "bg-green-100 text-green-800", label: "Buena documentación" }
    case "amarillo":
      return { bg: "bg-yellow-100 text-yellow-800", label: "Documentación incompleta" }
    case "rojo":
      return { bg: "bg-red-100 text-red-800", label: "Sin información suficiente" }
    default:
      return { bg: "bg-gray-100 text-gray-600", label: "Sin evaluar" }
  }
}

const CUMPLIMIENTO_LABEL: Record<CumplimientoEstado, string> = {
  "sin-evaluar": "Sin evaluar",
  "en-ejecucion": "En ejecución",
  cumplido: "Cumplido",
  observado: "Observado",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProveedorCard({ proveedor }: { proveedor: ProveedorEstado }) {
  const semaforo = getSemaforoClasses(proveedor.semaforo)
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold leading-snug">
          {proveedor.nombre}
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 mt-1">
          <Badge variant="secondary">{proveedor.rubro}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm flex-1">
        {/* Ciudad + Organismo */}
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            {proveedor.ciudad} — {proveedor.organismoContratante}
          </span>
        </div>

        {/* Tipo contratación */}
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{TIPO_LABEL[proveedor.tipoContratacion]}</span>
        </div>

        {/* Monto */}
        <div className="flex items-start gap-1.5 text-muted-foreground">
          <DollarSign className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{proveedor.monto ?? "No informado"}</span>
        </div>

        {/* Período */}
        {proveedor.periodo && (
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>{proveedor.periodo}</span>
          </div>
        )}

        {/* Fuente documental */}
        {proveedor.fuenteDocumental && (
          <p className="text-xs text-muted-foreground mt-1 italic border-t pt-2">
            Fuente: {proveedor.fuenteDocumental}
          </p>
        )}

        {/* Semáforo + Cumplimiento al pie */}
        <div className="mt-auto pt-3 flex flex-col gap-1.5">
          <span
            className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${semaforo.bg}`}
          >
            {semaforo.label}
          </span>
          <p className="text-xs text-muted-foreground">
            {CUMPLIMIENTO_LABEL[proveedor.estadoCumplimiento]}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function CardsSkeleton() {
  return (
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
            <Skeleton className="h-6 w-1/3 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProveedoresEstadoPage() {
  const [ciudadSlug, setCiudadSlug] = useState<string | undefined>()
  const [tipoContratacion, setTipoContratacion] = useState<string | undefined>()
  const [proveedores, setProveedores] = useState<ProveedorEstado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProveedores(ciudadSlug).then((data) => {
      const filtered = tipoContratacion
        ? data.filter((p) => p.tipoContratacion === tipoContratacion)
        : data
      setProveedores(filtered)
      setLoading(false)
    })
  }, [ciudadSlug, tipoContratacion])

  // Ranking de concentración: contar cuántos contratos tiene cada proveedor
  const rankingConcentracion = useMemo(() => {
    const conteo: Record<string, number> = {}
    proveedores.forEach((p) => {
      conteo[p.nombre] = (conteo[p.nombre] ?? 0) + 1
    })
    return Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [proveedores])

  // Estadísticas derivadas
  const statsPorTipo = useMemo(() => {
    const conteo: Partial<Record<ContratacionTipo, number>> = {}
    proveedores.forEach((p) => {
      conteo[p.tipoContratacion] = (conteo[p.tipoContratacion] ?? 0) + 1
    })
    return conteo
  }, [proveedores])

  const statsPorCiudad = useMemo(() => {
    const conteo: Record<string, number> = {}
    proveedores.forEach((p) => {
      conteo[p.ciudad] = (conteo[p.ciudad] ?? 0) + 1
    })
    return Object.entries(conteo).sort((a, b) => b[1] - a[1])
  }, [proveedores])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Proveedores y Contratistas del Estado
            </h1>
            <p className="text-lg text-primary-foreground/90 text-balance">
              Registro de empresas y personas que contratan con organismos públicos municipales.
              Fomentamos la transparencia en el uso de los recursos del Estado.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Nota legal institucional ─────────────────────────────────── */}
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Registramos contrataciones identificadas mediante pedidos de información, resoluciones y
            documentos oficiales. Este registro no implica irregularidad: es una herramienta de
            control ciudadano.
          </p>
        </div>
      </div>

      {/* ── 3. Estadísticas ─────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-8 mt-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-4">Resumen del registro</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Total */}
            <div className="bg-background rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold">{loading ? "—" : proveedores.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Proveedores registrados</p>
            </div>

            {/* Por tipo */}
            {(Object.entries(statsPorTipo) as [ContratacionTipo, number][]).map(([tipo, count]) => (
              <div key={tipo} className="bg-background rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{TIPO_LABEL[tipo]}</p>
              </div>
            ))}

            {/* Por ciudad (top 3) */}
            {statsPorCiudad.slice(0, 3).map(([ciudad, count]) => (
              <div key={ciudad} className="bg-background rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{ciudad}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Filtros ──────────────────────────────────────────────────── */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Select ciudad */}
            <div className="flex-1">
              <Select
                value={ciudadSlug ?? "todos"}
                onValueChange={(v) => setCiudadSlug(v === "todos" ? undefined : v)}
              >
                <SelectTrigger>
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

            {/* Select tipo contratación */}
            <div className="flex-1">
              <Select
                value={tipoContratacion ?? "todos"}
                onValueChange={(v) =>
                  setTipoContratacion(v === "todos" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_CONTRATACION.map((t) => (
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

      {/* ── 5. Grid de cards ────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <CardsSkeleton />
          ) : proveedores.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Sin resultados para los filtros aplicados</p>
              <p className="text-sm mt-1">Probá con otra ciudad o tipo de contratación.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {proveedores.map((p) => (
                <ProveedorCard key={p.id} proveedor={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. Accordion ranking concentración ──────────────────────────── */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="ranking">
              <AccordionTrigger className="text-base font-semibold">
                Empresas con más contrataciones registradas
              </AccordionTrigger>
              <AccordionContent>
                {rankingConcentracion.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No hay datos disponibles.</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead className="text-right">Contrataciones identificadas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rankingConcentracion.map(([nombre, count]) => (
                          <TableRow key={nombre}>
                            <TableCell className="font-medium">{nombre}</TableCell>
                            <TableCell className="text-right">{count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Mayor cantidad de contrataciones no implica irregularidad. Este indicador
                      mide concentración de información disponible.
                    </p>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ── 7. Pie de sección ───────────────────────────────────────────── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-muted/30 rounded-xl p-6 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              ¿Sos proveedor mencionado y querés enviar una aclaración? Contactanos en{" "}
              <a
                href="mailto:transparencia@transparenciachaco.org"
                className="text-primary hover:underline font-medium"
              >
                transparencia@transparenciachaco.org
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
