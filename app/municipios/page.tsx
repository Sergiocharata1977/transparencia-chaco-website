"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, MapPin, Search } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getMunicipios } from "@/lib/firebase/public-site"
import type { Municipio } from "@/types/site"

const estadoBadge = {
  cumple: "bg-green-600",
  parcial: "bg-amber-600 text-white",
  "no-cumple": "",
} as const

export default function MunicipiosPage() {
  const [municipiosData, setMunicipiosData] = useState<Municipio[]>([])
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [filtroRegion, setFiltroRegion] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    void (async () => {
      setMunicipiosData(await getMunicipios())
    })()
  }, [])

  const municipiosFiltrados = municipiosData.filter((municipio) => {
    const coincideBusqueda = busqueda === "" || municipio.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === "todos" || municipio.estado === filtroEstado
    const coincideRegion = filtroRegion === "todos" || municipio.region === filtroRegion
    return coincideBusqueda && coincideEstado && coincideRegion
  })

  const estadisticas = {
    total: municipiosData.length,
    cumple: municipiosData.filter((m) => m.estado === "cumple").length,
    parcial: municipiosData.filter((m) => m.estado === "parcial").length,
    noCumple: municipiosData.filter((m) => m.estado === "no-cumple").length,
  }

  const regiones = Array.from(new Set(municipiosData.map((m) => m.region)))

  return (
    <div className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Estado actual</p>
            <h1 className="mt-3 text-balance text-4xl font-black tracking-tight md:text-5xl">
              Municipios Monitoreados
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Seguimiento del cumplimiento de la rendicion de cuentas en los municipios del sudoeste chaqueno.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-cyan-950/10 bg-white pb-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["Total municipios", estadisticas.total],
              ["Cumplen", estadisticas.cumple],
              ["Parcial", estadisticas.parcial],
              ["No cumplen", estadisticas.noCumple],
            ].map(([label, value]) => (
              <Card key={label} className="border-cyan-950/10 bg-[#8f98a3] text-white shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="mb-1 text-3xl font-black tabular-nums text-[#00e0bd]">{value}</div>
                  <div className="text-xs font-bold">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-cyan-950/10 bg-[#eef7f8] py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar municipio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de cumplimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="cumple">Cumple</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="no-cumple">No cumple</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroRegion} onValueChange={setFiltroRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las regiones</SelectItem>
                {regiones.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="bg-[#eef2f4] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-6xl">
            {municipiosFiltrados.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {municipiosFiltrados.map((municipio) => (
                  <Card key={municipio.slug} className="border-cyan-950/10 bg-white shadow-sm transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <CardTitle className="text-xl">{municipio.nombre}</CardTitle>
                        {municipio.estado === "cumple" && <Badge className={estadoBadge.cumple}>Cumple</Badge>}
                        {municipio.estado === "parcial" && (
                          <Badge variant="secondary" className={estadoBadge.parcial}>
                            Parcial
                          </Badge>
                        )}
                        {municipio.estado === "no-cumple" && <Badge variant="destructive">No cumple</Badge>}
                      </div>
                      <CardDescription className="text-sm">{municipio.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {municipio.region}, {municipio.provincia}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Ultima actualizacion: {municipio.ultimaActualizacion}
                      </div>
                      <Link href={`/municipios/${municipio.slug}`}>
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver perfil completo
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-cyan-950/10 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-sm font-semibold text-slate-700">No hay municipios cargados para mostrar.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cuando se publiquen datos reales desde el panel, apareceran en este monitoreo.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
