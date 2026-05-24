"use client"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

const MapaCiudadano = dynamic(
  () => import("@/components/mapa/mapa-ciudadano"),
  {
    ssr: false,
    loading: () => <div className="h-[500px] bg-muted animate-pulse rounded-xl" />,
  }
)

const MUNICIPIOS = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

export default function MapaCiudadanoPage() {
  const [municipioSlug, setMunicipioSlug] = useState<string>("")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <MapPin className="h-10 w-10 text-primary-foreground/80" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Mapa Ciudadano</h1>
            <p className="text-lg text-primary-foreground/90">
              Visualizá obras, reportes y accidentes en el territorio.
            </p>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Selector de municipio */}
          <div className="max-w-xs mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Filtrar por municipio
            </label>
            <Select
              value={municipioSlug}
              onValueChange={val => setMunicipioSlug(val === "todos" ? "" : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los municipios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los municipios</SelectItem>
                {MUNICIPIOS.map(m => (
                  <SelectItem key={m.slug} value={m.slug}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mapa */}
          <MapaCiudadano municipioSlug={municipioSlug || undefined} />

          {/* Nota informativa */}
          <p className="mt-4 text-xs text-muted-foreground">
            Solo se muestran en el mapa los registros que tienen coordenadas cargadas.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
