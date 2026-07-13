"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Map, Recycle, Satellite, ShieldCheck } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calcularMetricasBasurales, getBasurales } from "@/lib/firebase/basurales"
import { CIUDADES_FALLBACK, getCiudadesActivas, type Ciudad } from "@/lib/firebase/ciudades"
import {
  BASURAL_ESTADO_VERIFICACION_LABELS,
  BASURAL_FUENTE_LABELS,
  type Basural,
  type BasuralEstadoVerificacion,
} from "@/types/basurales"

const MapaBasurales = dynamic(() => import("@/components/mapa/mapa-basurales"), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-lg border bg-slate-100 animate-pulse" />,
})

function formatArea(value: number): string {
  if (value >= 10000) return `${(value / 10000).toLocaleString("es-AR", { maximumFractionDigits: 1 })} ha`
  return `${Math.round(value).toLocaleString("es-AR")} m2`
}

function estadoBadge(estado: BasuralEstadoVerificacion) {
  if (estado === "verificado_foto" || estado === "verificado_campo") {
    return <Badge className="bg-red-100 text-red-800">{BASURAL_ESTADO_VERIFICACION_LABELS[estado]}</Badge>
  }
  if (estado === "erradicado") return <Badge className="bg-emerald-100 text-emerald-800">Erradicado</Badge>
  if (estado === "candidato") return <Badge className="bg-amber-100 text-amber-800">Candidato</Badge>
  return <Badge variant="secondary">Descartado</Badge>
}

export default function BasuralesPage() {
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [basurales, setBasurales] = useState<Basural[]>([])
  const [ciudadSlug, setCiudadSlug] = useState("todas")
  const [anio, setAnio] = useState("todos")
  const [estado, setEstado] = useState("todos")
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    void (async () => {
      setCargando(true)
      const [ciudadesData, basuralesData] = await Promise.all([getCiudadesActivas(), getBasurales()])
      setCiudades(ciudadesData)
      setBasurales(basuralesData)
      setCargando(false)
    })()
  }, [])

  const anios = useMemo(() => {
    const values = Array.from(new Set(
      basurales
        .map((basural) => Number(basural.fechaDeteccionISO.slice(0, 4)))
        .filter(Number.isFinite),
    )).sort((a, b) => b - a)
    return values.length > 0 ? values : [new Date().getFullYear()]
  }, [basurales])

  const basuralesFiltrados = useMemo(() => basurales
    .filter((basural) => ciudadSlug === "todas" || basural.ciudadSlug === ciudadSlug)
    .filter((basural) => anio === "todos" || Number(basural.fechaDeteccionISO.slice(0, 4)) === Number(anio))
    .filter((basural) => estado === "todos" || basural.estadoVerificacion === estado),
  [basurales, ciudadSlug, anio, estado])

  const metricas = useMemo(() => calcularMetricasBasurales(basuralesFiltrados), [basuralesFiltrados])

  return (
    <div className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />
      <section className="bg-[#005763] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Observatorio ambiental</p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight md:text-6xl">Basurales a Cielo Abierto</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cyan-50/85">
              Registro publico de sitios detectados con imagenes Sentinel-2 y verificados con evidencia antes de
              convertirse en reclamos y seguimiento ciudadano.
            </p>
          </div>
        </div>
      </section>
      <section className="border-b border-cyan-950/10 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-[1fr_220px_180px_220px] lg:items-end">
          <div>
            <h2 className="text-xl font-black">Sitios publicados</h2>
            <p className="mt-1 text-sm text-muted-foreground">El mapa muestra solo registros marcados como publicos por el observatorio.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Municipio</label>
            <Select value={ciudadSlug} onValueChange={setCiudadSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos</SelectItem>
                {ciudades.map((ciudad) => <SelectItem key={ciudad.slug} value={ciudad.slug}>{ciudad.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Anio</label>
            <Select value={anio} onValueChange={setAnio}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {anios.map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Estado</label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="candidato">Candidato</SelectItem>
                <SelectItem value="verificado_foto">Verificado con foto</SelectItem>
                <SelectItem value="verificado_campo">Verificado en campo</SelectItem>
                <SelectItem value="erradicado">Erradicado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-cyan-950/10 shadow-sm"><CardContent className="p-5"><Map className="mb-3 h-6 w-6 text-[#08707b]" /><p className="text-3xl font-black">{metricas.total}</p><p className="text-sm text-muted-foreground">Registros publicados</p></CardContent></Card>
          <Card className="border-cyan-950/10 shadow-sm"><CardContent className="p-5"><ShieldCheck className="mb-3 h-6 w-6 text-red-700" /><p className="text-3xl font-black text-red-700">{metricas.verificados}</p><p className="text-sm text-muted-foreground">Verificados</p></CardContent></Card>
          <Card className="border-cyan-950/10 shadow-sm"><CardContent className="p-5"><Recycle className="mb-3 h-6 w-6 text-emerald-700" /><p className="text-3xl font-black text-emerald-700">{metricas.erradicados}</p><p className="text-sm text-muted-foreground">Erradicados</p></CardContent></Card>
          <Card className="border-cyan-950/10 shadow-sm"><CardContent className="p-5"><Satellite className="mb-3 h-6 w-6 text-[#08707b]" /><p className="text-3xl font-black">{formatArea(metricas.areaTotalM2)}</p><p className="text-sm text-muted-foreground">Area registrada</p></CardContent></Card>
        </div>
      </section>
      <section className="bg-[#eef7f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center gap-3"><Map className="h-6 w-6 text-[#08707b]" /><h2 className="text-2xl font-black">Mapa de basurales relevados</h2></div>
          <MapaBasurales basurales={basuralesFiltrados} />
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[0.9fr_1.4fr]">
          <div>
            <h2 className="text-2xl font-black">Como detectamos</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>1. El satelite propone candidatos por indices espectrales: vegetacion baja, suelo desnudo y ausencia de agua.</p>
              <p>2. Vecinos y observatorio verifican con foto, campo o evidencia documental antes de publicar.</p>
              <p>3. Los casos verificados pueden convertirse en reclamo y seguimiento de erradicacion municipal.</p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Metodologia inspirada en el trabajo publico de{" "}
              <a className="font-medium text-[#08707b] underline" href="https://fractalargentina.org/" target="_blank" rel="noreferrer">Fractal</a>,
              adaptada a infraestructura TypeScript y verificacion ciudadana.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-cyan-950/10 bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-[#f7fafb] text-left"><tr><th className="px-4 py-3 font-semibold">Sitio</th><th className="px-4 py-3 font-semibold">Ciudad</th><th className="px-4 py-3 font-semibold">Area</th><th className="px-4 py-3 font-semibold">Fuente</th><th className="px-4 py-3 font-semibold">Estado</th><th className="px-4 py-3 font-semibold">Fecha</th></tr></thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Cargando registros...</td></tr>
                ) : basuralesFiltrados.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Todavia no hay basurales publicados para este filtro.</td></tr>
                ) : basuralesFiltrados.map((basural) => (
                  <tr key={basural.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{basural.nombre || basural.ubicacionTexto || "Sitio relevado"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{basural.ciudadNombre}</td>
                    <td className="px-4 py-3">{formatArea(basural.areaM2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{BASURAL_FUENTE_LABELS[basural.fuente]}</td>
                    <td className="px-4 py-3">{estadoBadge(basural.estadoVerificacion)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{basural.fechaDeteccionISO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl px-4">
          <Link href="/cargar-reporte"><Button variant="outline" className="border-[#08707b] bg-white text-[#005763]">Aportar evidencia</Button></Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
