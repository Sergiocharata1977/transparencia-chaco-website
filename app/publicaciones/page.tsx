"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Search, Calendar, MapPin } from "lucide-react"
import { useState } from "react"

const publicacionesData = [
  {
    id: 1,
    titulo: "Informe de Rendición de Cuentas - Charata 2024",
    slug: "informe-rendicion-charata-2024",
    extracto:
      "Análisis completo del cumplimiento de las obligaciones de transparencia del municipio de Charata durante el primer trimestre de 2024.",
    fecha: "15 de Marzo, 2024",
    categoria: "Informe Municipal",
    municipio: "Charata",
    autor: "Equipo Transparencia Chaco",
    imagen: "/city-hall-report.jpg",
  },
  {
    id: 2,
    titulo: "Análisis del cumplimiento del Art. 67 en el sudoeste chaqueño",
    slug: "analisis-art67-sudoeste-chaco",
    extracto:
      "Estudio comparativo sobre el cumplimiento del Artículo 67 de la Ley Orgánica de Municipios en seis municipios de la región.",
    fecha: "28 de Febrero, 2024",
    categoria: "Marco Legal",
    municipio: "Varios",
    autor: "María González",
    imagen: "/legal-documents-argentina.jpg",
  },
  {
    id: 3,
    titulo: "Transparencia en el uso de fondos públicos municipales",
    slug: "transparencia-fondos-publicos",
    extracto:
      "Investigación sobre la publicación de información presupuestaria y su ejecución en municipios chaqueños.",
    fecha: "10 de Febrero, 2024",
    categoria: "Investigación",
    municipio: "Varios",
    autor: "Carlos Martínez",
    imagen: "/public-budget-transparency.jpg",
  },
  {
    id: 4,
    titulo: "Estado de obras públicas en General Pinedo",
    slug: "obras-publicas-general-pinedo",
    extracto: "Relevamiento de obras públicas anunciadas y su estado real de avance en el municipio de General Pinedo.",
    fecha: "5 de Febrero, 2024",
    categoria: "Seguimiento",
    municipio: "General Pinedo",
    autor: "Ana Rodríguez",
    imagen: "/public-construction-works.jpg",
  },
  {
    id: 5,
    titulo: "Portal de transparencia: mejores prácticas municipales",
    slug: "mejores-practicas-portales-transparencia",
    extracto: "Análisis de los portales de transparencia más efectivos y recomendaciones para municipios del Chaco.",
    fecha: "28 de Enero, 2024",
    categoria: "Análisis",
    municipio: "Varios",
    autor: "Equipo Transparencia Chaco",
    imagen: "/web-portal-transparency.jpg",
  },
  {
    id: 6,
    titulo: "Presupuesto participativo en Las Breñas",
    slug: "presupuesto-participativo-las-brenas",
    extracto:
      "Caso de éxito: cómo Las Breñas implementó un sistema de presupuesto participativo con amplia participación ciudadana.",
    fecha: "15 de Enero, 2024",
    categoria: "Caso de Éxito",
    municipio: "Las Breñas",
    autor: "Roberto Fernández",
    imagen: "/participatory-budget-meeting.jpg",
  },
]

export default function PublicacionesPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [filtroMunicipio, setFiltroMunicipio] = useState<string>("todos")
  const [busqueda, setBusqueda] = useState<string>("")

  const publicacionesFiltradas = publicacionesData.filter((pub) => {
    const coincideBusqueda =
      busqueda === "" ||
      pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      pub.extracto.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === "todas" || pub.categoria === filtroCategoria
    const coincideMunicipio = filtroMunicipio === "todos" || pub.municipio === filtroMunicipio

    return coincideBusqueda && coincideCategoria && coincideMunicipio
  })

  const categorias = Array.from(new Set(publicacionesData.map((p) => p.categoria)))
  const municipios = Array.from(new Set(publicacionesData.map((p) => p.municipio)))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Publicaciones e Informes</h1>
            <p className="text-lg text-primary-foreground/90">
              Informes, análisis y seguimiento de la transparencia municipal en el sudoeste chaqueño
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar publicaciones..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroMunicipio} onValueChange={setFiltroMunicipio}>
                <SelectTrigger>
                  <SelectValue placeholder="Municipio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los municipios</SelectItem>
                  {municipios.map((mun) => (
                    <SelectItem key={mun} value={mun}>
                      {mun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(filtroCategoria !== "todas" || filtroMunicipio !== "todos" || busqueda !== "") && (
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {publicacionesFiltradas.length} publicación(es) encontrada(s)
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroCategoria("todas")
                    setFiltroMunicipio("todos")
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

      {/* Publicación destacada */}
      {publicacionesFiltradas.length > 0 && filtroCategoria === "todas" && filtroMunicipio === "todos" && !busqueda && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Publicación Destacada</h2>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto">
                    <img
                      src={publicacionesData[0].imagen || "/placeholder.svg"}
                      alt={publicacionesData[0].titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge>{publicacionesData[0].categoria}</Badge>
                      {publicacionesData[0].municipio !== "Varios" && (
                        <Badge variant="outline">{publicacionesData[0].municipio}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-3">{publicacionesData[0].titulo}</CardTitle>
                    <CardDescription className="text-base mb-4">{publicacionesData[0].extracto}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{publicacionesData[0].fecha}</span>
                      </div>
                      <span>Por {publicacionesData[0].autor}</span>
                    </div>
                    <Link href={`/publicaciones/${publicacionesData[0].slug}`}>
                      <Button size="lg">Leer artículo completo</Button>
                    </Link>
                  </CardHeader>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Lista de publicaciones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {!busqueda && filtroCategoria === "todas" && filtroMunicipio === "todos" && (
              <h2 className="text-2xl font-bold mb-8">Todas las Publicaciones</h2>
            )}

            {publicacionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No se encontraron publicaciones que coincidan con los filtros seleccionados
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicacionesFiltradas.map((pub) => (
                  <Card key={pub.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pub.imagen || "/placeholder.svg"}
                        alt={pub.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="secondary">{pub.categoria}</Badge>
                        {pub.municipio !== "Varios" && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{pub.municipio}</span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2 line-clamp-2">{pub.titulo}</CardTitle>
                      <CardDescription className="line-clamp-3 mb-4 flex-1">{pub.extracto}</CardDescription>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Calendar className="h-3 w-3" />
                        <span>{pub.fecha}</span>
                      </div>
                      <Link href={`/publicaciones/${pub.slug}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Leer más
                        </Button>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Suscripción */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mantenete informado</h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Suscribite para recibir nuestras últimas publicaciones e informes sobre transparencia municipal
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input type="email" placeholder="tu@email.com" className="bg-white text-foreground border-white" />
              <Button variant="secondary" size="lg" className="whitespace-nowrap">
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
