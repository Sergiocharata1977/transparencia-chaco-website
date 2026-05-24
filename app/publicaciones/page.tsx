"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Search } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPublicaciones } from "@/lib/firebase/public-site"
import type { Publicacion } from "@/types/site"

export default function PublicacionesPage() {
  const [publicacionesData, setPublicacionesData] = useState<Publicacion[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    void (async () => {
      setPublicacionesData(await getPublicaciones())
    })()
  }, [])

  const publicacionesFiltradas = publicacionesData.filter((pub) => {
    const coincideBusqueda = busqueda === "" || pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) || pub.extracto.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === "todas" || pub.categoria === filtroCategoria
    const coincideMunicipio = filtroMunicipio === "todos" || pub.municipio === filtroMunicipio
    return coincideBusqueda && coincideCategoria && coincideMunicipio
  })

  const categorias = Array.from(new Set(publicacionesData.map((p) => p.categoria)))
  const municipios = Array.from(new Set(publicacionesData.map((p) => p.municipio)))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Publicaciones e Informes</h1>
            <p className="text-lg text-primary-foreground/90">Informes, análisis y seguimiento de la transparencia municipal en el sudoeste chaqueño</p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar publicaciones..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-10" />
              </div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filtroMunicipio} onValueChange={setFiltroMunicipio}>
                <SelectTrigger><SelectValue placeholder="Municipio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los municipios</SelectItem>
                  {municipios.map((municipio) => <SelectItem key={municipio} value={municipio}>{municipio}</SelectItem>)}
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
              {publicacionesFiltradas.map((pub) => (
                <Card key={pub.slug} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <img src={pub.imagen || "/placeholder.svg"} alt={pub.titulo} className="w-full h-48 object-cover" />
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary">{pub.categoria}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" /><span>{pub.fecha}</span></div>
                    </div>
                    <CardTitle className="text-xl leading-tight">{pub.titulo}</CardTitle>
                    <CardDescription className="leading-relaxed">{pub.extracto}</CardDescription>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground pt-2"><MapPin className="h-4 w-4" /><span>{pub.municipio}</span></div>
                    <Link href={`/publicaciones/${pub.slug}`}><Button variant="ghost" size="sm" className="p-0 h-auto mt-3">Leer artículo →</Button></Link>
                  </CardHeader>
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
