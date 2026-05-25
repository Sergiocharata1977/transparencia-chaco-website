"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Newspaper } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Ciudad } from "@/lib/firebase/ciudades"
import { getCiudadesActivas } from "@/lib/firebase/ciudades"
import type { Publicacion } from "@/lib/firebase/publicaciones"
import { getPublicaciones } from "@/lib/firebase/publicaciones"

const CATEGORIAS = [
  { value: "todas", label: "Todas las categorías" },
  { value: "obras", label: "Obras" },
  { value: "transparencia", label: "Transparencia" },
  { value: "reportes", label: "Reportes" },
  { value: "salud", label: "Salud" },
  { value: "seguridad", label: "Seguridad" },
  { value: "general", label: "General" },
]

function formatDate(iso?: string): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function PublicacionCard({ pub }: { pub: Publicacion }) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-slate-200">
        {pub.imagen ? (
          <Image
            src={pub.imagen}
            alt={pub.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <Newspaper className="h-12 w-12 text-slate-300" />
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <Badge variant="secondary" className="capitalize">
            {pub.categoria}
          </Badge>
        </div>
        <p className="font-semibold leading-snug">{pub.titulo}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">{pub.extracto}</p>
        <p className="mt-auto text-xs text-muted-foreground">
          {pub.municipio}
          {pub.publishedAt ? ` · ${formatDate(pub.publishedAt)}` : ""}
        </p>
        <Link href={`/publicaciones/${pub.id}`}>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            Leer noticia
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border bg-white">
      <div className="h-48 w-full bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-24 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-200" />
        <div className="h-9 w-full rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function PublicacionesPage() {
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)

  const [municipioSel, setMunicipioSel] = useState("todos")
  const [categoriaSel, setCategoriaSel] = useState("todas")

  // Load ciudades once
  useEffect(() => {
    getCiudadesActivas().then(setCiudades).catch(() => setCiudades([]))
  }, [])

  // Load publicaciones when municipio filter changes
  useEffect(() => {
    setLoading(true)
    const slug = municipioSel === "todos" ? undefined : municipioSel
    getPublicaciones(slug)
      .then((data) => {
        setPublicaciones(data)
        setLoading(false)
      })
      .catch(() => {
        setPublicaciones([])
        setLoading(false)
      })
  }, [municipioSel])

  // Client-side category filter
  const filtered =
    categoriaSel === "todas"
      ? publicaciones
      : publicaciones.filter((p) => p.categoria === categoriaSel)

  function handleLimpiar() {
    setMunicipioSel("todos")
    setCategoriaSel("todas")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-balance md:text-5xl">
              Noticias del Observatorio
            </h1>
            <p className="text-lg text-slate-300">
              Informes, análisis y seguimiento de la transparencia municipal en el sudoeste chaqueño
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
              <Select value={municipioSel} onValueChange={setMunicipioSel}>
                <SelectTrigger>
                  <SelectValue placeholder="Municipio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los municipios</SelectItem>
                  {ciudades.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoriaSel} onValueChange={setCategoriaSel}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleLimpiar} className="bg-transparent">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Newspaper className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">
                  Aun no hay noticias publicadas
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Proba cambiando los filtros o volviendo mas tarde.
                </p>
                <Button variant="outline" onClick={handleLimpiar} className="bg-transparent">
                  Ver todas las noticias
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((pub) => (
                  <PublicacionCard key={pub.id} pub={pub} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
