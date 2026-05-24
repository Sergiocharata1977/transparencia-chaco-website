"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { MapPin, Search, FileText } from "lucide-react"
import { useState } from "react"

const municipiosData = [
  {
    id: 1,
    nombre: "Charata",
    estado: "cumple",
    region: "Sudoeste",
    intendente: "Jorge Capitanich",
    poblacion: "30.000",
    ultimaActualizacion: "15 de Marzo, 2024",
    descripcion: "Municipio principal del sudoeste chaqueño",
  },
  {
    id: 2,
    nombre: "Presidencia Roque Sáenz Peña",
    estado: "parcial",
    region: "Centro",
    intendente: "Manuel Gómez",
    poblacion: "95.000",
    ultimaActualizacion: "28 de Febrero, 2024",
    descripcion: "Capital departamental y segunda ciudad más importante",
  },
  {
    id: 3,
    nombre: "General Pinedo",
    estado: "no-cumple",
    region: "Sudoeste",
    intendente: "Ricardo Fernández",
    poblacion: "12.000",
    ultimaActualizacion: "10 de Febrero, 2024",
    descripcion: "Municipio agrícola del sudoeste chaqueño",
  },
  {
    id: 4,
    nombre: "Villa Ángela",
    estado: "parcial",
    region: "Centro",
    intendente: "María González",
    poblacion: "42.000",
    ultimaActualizacion: "5 de Marzo, 2024",
    descripcion: "Importante centro comercial de la región",
  },
  {
    id: 5,
    nombre: "Las Breñas",
    estado: "cumple",
    region: "Sudoeste",
    intendente: "Carlos Martínez",
    poblacion: "25.000",
    ultimaActualizacion: "20 de Marzo, 2024",
    descripcion: "Centro agroindustrial del sudoeste",
  },
  {
    id: 6,
    nombre: "Quitilipi",
    estado: "no-cumple",
    region: "Centro",
    intendente: "Ana Rodríguez",
    poblacion: "18.000",
    ultimaActualizacion: "1 de Marzo, 2024",
    descripcion: "Municipio con fuerte actividad agropecuaria",
  },
]

export default function MunicipiosPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [filtroRegion, setFiltroRegion] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState<string>("")

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Municipios Monitoreados</h1>
            <p className="text-lg text-primary-foreground/90">
              Seguimiento del cumplimiento de las obligaciones de transparencia en el sudoeste chaqueño
            </p>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-3xl">{estadisticas.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Cumple</CardDescription>
                <CardTitle className="text-3xl text-green-600">{estadisticas.cumple}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Parcial</CardDescription>
                <CardTitle className="text-3xl text-amber-600">{estadisticas.parcial}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>No Cumple</CardDescription>
                <CardTitle className="text-3xl text-destructive">{estadisticas.noCumple}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem value="parcial">Cumplimiento parcial</SelectItem>
                  <SelectItem value="no-cumple">No cumple</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroRegion} onValueChange={setFiltroRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las regiones</SelectItem>
                  <SelectItem value="Sudoeste">Sudoeste</SelectItem>
                  <SelectItem value="Centro">Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(filtroEstado !== "todos" || filtroRegion !== "todos" || busqueda !== "") && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Filtros activos:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroEstado("todos")
                    setFiltroRegion("todos")
                    setBusqueda("")
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lista de Municipios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {municipiosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No se encontraron municipios que coincidan con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {municipiosFiltrados.map((municipio) => (
                  <Card key={municipio.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{municipio.nombre}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{municipio.region}</span>
                          </div>
                        </div>
                        {municipio.estado === "cumple" && (
                          <Badge variant="default" className="bg-green-600">
                            Cumple
                          </Badge>
                        )}
                        {municipio.estado === "parcial" && (
                          <Badge variant="secondary" className="bg-amber-600 text-white">
                            Parcial
                          </Badge>
                        )}
                        {municipio.estado === "no-cumple" && <Badge variant="destructive">No Cumple</Badge>}
                      </div>
                      <CardDescription>{municipio.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Intendente:</span>
                          <span className="font-medium">{municipio.intendente}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Población aprox:</span>
                          <span className="font-medium">{municipio.poblacion} hab.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Última actualización:</span>
                          <span className="font-medium">{municipio.ultimaActualizacion}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/municipios/${municipio.nombre.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex-1"
                        >
                          <Button variant="default" size="sm" className="w-full">
                            Ver Detalles
                          </Button>
                        </Link>
                        <Link href={`/publicaciones?municipio=${municipio.nombre}`}>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>¿Qué significa cada estado?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="default" className="bg-green-600 mt-1">
                      Cumple
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      El municipio publica regularmente información sobre su gestión, presupuesto y rendición de cuentas
                      conforme al Art. 67 de la Ley Orgánica de Municipios.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="bg-amber-600 text-white mt-1">
                      Parcial
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      El municipio publica información de manera irregular o incompleta. Algunos datos están disponibles
                      pero no se cumple totalmente con las obligaciones legales.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="mt-1">
                      No Cumple
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      El municipio no publica información sobre su gestión o la información disponible es muy limitada e
                      insuficiente para ejercer control ciudadano.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
