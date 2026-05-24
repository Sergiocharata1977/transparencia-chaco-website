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
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Municipios Monitoreados</h1>
            <p className="text-lg text-primary-foreground/90">Seguimiento del cumplimiento de la rendición de cuentas en los municipios del sudoeste chaqueño</p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-primary mb-1">{estadisticas.total}</div><div className="text-sm text-muted-foreground">Total Municipios</div></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-green-600 mb-1">{estadisticas.cumple}</div><div className="text-sm text-muted-foreground">Cumplen</div></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-amber-600 mb-1">{estadisticas.parcial}</div><div className="text-sm text-muted-foreground">Parcial</div></CardContent></Card>
            <Card><CardContent className="p-6 text-center"><div className="text-3xl font-bold text-destructive mb-1">{estadisticas.noCumple}</div><div className="text-sm text-muted-foreground">No Cumplen</div></CardContent></Card>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar municipio..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger><SelectValue placeholder="Estado de cumplimiento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="cumple">Cumple</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="no-cumple">No cumple</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroRegion} onValueChange={setFiltroRegion}>
                <SelectTrigger><SelectValue placeholder="Región" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las regiones</SelectItem>
                  {regiones.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {municipiosFiltrados.map((municipio) => (
                <Card key={municipio.slug} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl">{municipio.nombre}</CardTitle>
                      {municipio.estado === "cumple" && <Badge variant="default" className="bg-green-600">Cumple</Badge>}
                      {municipio.estado === "parcial" && <Badge variant="secondary" className="bg-amber-600 text-white">Parcial</Badge>}
                      {municipio.estado === "no-cumple" && <Badge variant="destructive">No Cumple</Badge>}
                    </div>
                    <CardDescription className="text-sm">{municipio.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{municipio.region}, {municipio.provincia}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="h-4 w-4" />Última actualización: {municipio.ultimaActualizacion}</div>
                    <Link href={`/municipios/${municipio.slug}`}><Button variant="outline" className="w-full bg-transparent">Ver Perfil Completo</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
