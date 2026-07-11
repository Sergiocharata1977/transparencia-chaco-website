"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Map, Route, TrendingUp } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { calcularMetricasCalles, getCallesMunicipio } from "@/lib/firebase/calles"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
import {
  CALLE_ESTADO_OBRA_LABELS,
  CALLE_ESTADO_SUPERFICIE_LABELS,
  type CalleMunicipio,
} from "@/types/calles"

const MapaCallesPavimento = dynamic(() => import("@/components/mapa/mapa-calles-pavimento"), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-lg border bg-slate-100 animate-pulse" />,
})

function formatMeters(value: number): string {
  return `${Math.round(value).toLocaleString("es-AR")} m`
}

function superficieBadge(estado: CalleMunicipio["estadoSuperficie"]) {
  if (estado === "asfaltada") return <Badge className="bg-emerald-100 text-emerald-800">Asfaltada</Badge>
  if (estado === "en_obra") return <Badge className="bg-amber-100 text-amber-800">En obra</Badge>
  if (estado === "sin_dato") return <Badge variant="secondary">Sin dato</Badge>
  return <Badge className="bg-slate-200 text-slate-800">{CALLE_ESTADO_SUPERFICIE_LABELS[estado]}</Badge>
}

export default function CallesPavimentoPage() {
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [calles, setCalles] = useState<CalleMunicipio[]>([])
  const [ciudadSlug, setCiudadSlug] = useState("todas")
  const [anio, setAnio] = useState("todos")
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    void (async () => {
      const municipioParam = new URLSearchParams(window.location.search).get("municipio")
      if (municipioParam) setCiudadSlug(municipioParam)
      setCargando(true)
      const [ciudadesData, callesData] = await Promise.all([
        getCiudadesActivas(),
        getCallesMunicipio(),
      ])
      setCiudades(ciudadesData)
      setCalles(callesData)
      setCargando(false)
    })()
  }, [])

  const anios = useMemo(() => {
    const values = Array.from(new Set(calles.map((calle) => calle.anioRelevamiento))).sort((a, b) => b - a)
    return values.length > 0 ? values : [new Date().getFullYear()]
  }, [calles])

  const callesFiltradas = useMemo(() => calles
    .filter((calle) => ciudadSlug === "todas" || calle.ciudadSlug === ciudadSlug)
    .filter((calle) => anio === "todos" || calle.anioRelevamiento === Number(anio)),
  [calles, ciudadSlug, anio])

  const metricas = useMemo(() => calcularMetricasCalles(callesFiltradas), [callesFiltradas])

  return (
    <div className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />

      <section className="bg-[#005763] py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Observatorio</p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight md:text-6xl">
              Calles y Pavimento
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cyan-50/85">
              Registro calle por calle para medir cuantas cuadras estan asfaltadas, cuantas no y como avanza la obra
              publica año a año.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-cyan-950/10 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-[1fr_220px_180px] md:items-end">
          <div>
            <h2 className="text-xl font-black">Estado del relevamiento</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filtra por municipio y año para comparar avance territorial.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Municipio</label>
            <Select value={ciudadSlug} onValueChange={setCiudadSlug}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos</SelectItem>
                {ciudades.map((ciudad) => (
                  <SelectItem key={ciudad.slug} value={ciudad.slug}>{ciudad.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Año</label>
            <Select value={anio} onValueChange={setAnio}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {anios.map((value) => (
                  <SelectItem key={value} value={String(value)}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-cyan-950/10 shadow-sm">
            <CardContent className="p-5">
              <Route className="mb-3 h-6 w-6 text-[#08707b]" />
              <p className="text-3xl font-black">{metricas.totalTramos}</p>
              <p className="text-sm text-muted-foreground">Tramos relevados</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-950/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-emerald-700">{metricas.asfaltadas}</p>
              <p className="text-sm text-muted-foreground">Tramos asfaltados</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatMeters(metricas.metrosAsfaltados)}</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-950/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-slate-700">{metricas.noAsfaltadas}</p>
              <p className="text-sm text-muted-foreground">No asfaltados</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatMeters(metricas.metrosNoAsfaltados)}</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-950/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-3xl font-black text-amber-700">{metricas.enObra}</p>
              <p className="text-sm text-muted-foreground">En obra</p>
              <p className="mt-2 text-xs text-muted-foreground">{formatMeters(metricas.metrosEnObra)}</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-950/10 shadow-sm">
            <CardContent className="p-5">
              <TrendingUp className="mb-3 h-6 w-6 text-[#08707b]" />
              <p className="text-3xl font-black">{metricas.porcentajeAsfaltado}%</p>
              <p className="text-sm text-muted-foreground">Metros asfaltados</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-[#eef7f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center gap-3">
            <Map className="h-6 w-6 text-[#08707b]" />
            <h2 className="text-2xl font-black">Mapa de calles relevadas</h2>
          </div>
          <MapaCallesPavimento calles={callesFiltradas} />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Detalle calle por calle</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Cada fila representa un tramo entre dos referencias.
              </p>
            </div>
            <Link href="/cargar-reporte">
              <Button variant="outline" className="border-[#08707b] bg-white text-[#005763]">
                Aportar evidencia
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-cyan-950/10 bg-white">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-[#f7fafb] text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Calle</th>
                  <th className="px-4 py-3 font-semibold">Ciudad</th>
                  <th className="px-4 py-3 font-semibold">Tramo</th>
                  <th className="px-4 py-3 font-semibold">Orientacion</th>
                  <th className="px-4 py-3 font-semibold">Superficie</th>
                  <th className="px-4 py-3 font-semibold">Obra</th>
                  <th className="px-4 py-3 font-semibold">Año</th>
                  <th className="px-4 py-3 font-semibold">Cuadras A/T</th>
                  <th className="px-4 py-3 font-semibold">Metros</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Cargando relevamiento...</td></tr>
                ) : callesFiltradas.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Todavia no hay calles publicadas para este filtro.</td></tr>
                ) : callesFiltradas.map((calle) => (
                  <tr key={calle.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{calle.nombreCalle}</td>
                    <td className="px-4 py-3 text-muted-foreground">{calle.ciudadNombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{calle.desde} - {calle.hasta}</td>
                    <td className="px-4 py-3 text-muted-foreground">{calle.orientacion || "-"}</td>
                    <td className="px-4 py-3">{superficieBadge(calle.estadoSuperficie)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {CALLE_ESTADO_OBRA_LABELS[calle.estadoObra]}
                      {calle.obraNombre ? <span className="block text-xs">{calle.obraNombre}</span> : null}
                    </td>
                    <td className="px-4 py-3">{calle.anioRelevamiento}</td>
                    <td className="px-4 py-3">{calle.cuadrasAsfaltadas ?? 0}/{calle.cuadrasTierra ?? 0}</td>
                    <td className="px-4 py-3">{calle.longitudMetros} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
