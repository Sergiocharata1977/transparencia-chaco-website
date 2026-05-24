"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2 } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getObrasPublicas } from "@/lib/firebase/obras"
import type { ObraEstado, ObraFiltros, ObraPublica } from "@/types/obras"

function colorEstado(estado: ObraEstado): string {
  const map: Record<ObraEstado, string> = {
    finalizada: "bg-green-100 text-green-800",
    "en-ejecucion": "bg-yellow-100 text-yellow-800",
    iniciada: "bg-blue-100 text-blue-800",
    paralizada: "bg-red-100 text-red-800",
    anunciada: "bg-gray-100 text-gray-800",
    "sin-informacion": "bg-gray-100 text-gray-600",
  }
  return map[estado] ?? "bg-gray-100 text-gray-600"
}

function labelEstado(estado: ObraEstado): string {
  const map: Record<ObraEstado, string> = {
    finalizada: "Finalizada",
    "en-ejecucion": "En ejecución",
    iniciada: "Iniciada",
    paralizada: "Paralizada",
    anunciada: "Anunciada",
    "sin-informacion": "Sin información",
  }
  return map[estado] ?? estado
}

function labelTipo(tipo: ObraPublica["tipo"]): string {
  const map: Record<ObraPublica["tipo"], string> = {
    pavimento: "Pavimento",
    ripio: "Ripio",
    iluminacion: "Iluminación",
    cloacas: "Cloacas",
    "edificio-publico": "Edificio público",
    "obra-hidraulica": "Obra hidráulica",
    plaza: "Plaza",
    parque: "Parque",
    otro: "Otro",
  }
  return map[tipo] ?? tipo
}

function labelOrigen(origen: ObraPublica["origenFondos"]): string {
  const map: Record<ObraPublica["origenFondos"], string> = {
    municipal: "Fondos municipales",
    provincial: "Fondos provinciales",
    nacional: "Fondos nacionales",
    mixto: "Fondos mixtos",
    desconocido: "Origen desconocido",
  }
  return map[origen] ?? origen
}

function labelEjecucion(ejecucion: ObraPublica["ejecucion"]): string {
  const map: Record<ObraPublica["ejecucion"], string> = {
    "administracion-propia": "Administración propia",
    "empresa-contratista": "Empresa contratista",
    "ejecucion-provincial": "Ejecución provincial",
    "ejecucion-nacional": "Ejecución nacional",
    desconocido: "Desconocido",
  }
  return map[ejecucion] ?? ejecucion
}

const ESTADOS_FILTRO: { value: string; label: string }[] = [
  { value: "todos", label: "Todos los estados" },
  { value: "anunciada", label: "Anunciada" },
  { value: "iniciada", label: "Iniciada" },
  { value: "en-ejecucion", label: "En ejecución" },
  { value: "paralizada", label: "Paralizada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "sin-informacion", label: "Sin información" },
]

const TIPOS_FILTRO: { value: string; label: string }[] = [
  { value: "todos", label: "Todos los tipos" },
  { value: "pavimento", label: "Pavimento" },
  { value: "ripio", label: "Ripio" },
  { value: "iluminacion", label: "Iluminación" },
  { value: "cloacas", label: "Cloacas" },
  { value: "edificio-publico", label: "Edificio público" },
  { value: "plaza", label: "Plaza" },
  { value: "otro", label: "Otro" },
]

const MUNICIPIOS_FILTRO: { value: string; label: string }[] = [
  { value: "todos", label: "Todos los municipios" },
  { value: "charata", label: "Charata" },
  { value: "las-brenas", label: "Las Breñas" },
  { value: "corzuela", label: "Corzuela" },
  { value: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

export default function ObrasPublicasPage() {
  const [filtros, setFiltros] = useState<ObraFiltros>({})
  const [municipioSel, setMunicipioSel] = useState("todos")
  const [estadoSel, setEstadoSel] = useState("todos")
  const [tipoSel, setTipoSel] = useState("todos")
  const [obras, setObras] = useState<ObraPublica[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getObrasPublicas(filtros).then((data) => {
      setObras(data)
      setLoading(false)
    })
  }, [filtros])

  function handleMunicipio(value: string) {
    setMunicipioSel(value)
    setFiltros((prev) => ({
      ...prev,
      municipioSlug: value === "todos" ? undefined : (value as ObraFiltros["municipioSlug"]),
    }))
  }

  function handleEstado(value: string) {
    setEstadoSel(value)
    setFiltros((prev) => ({
      ...prev,
      estado: value === "todos" ? undefined : (value as ObraEstado),
    }))
  }

  function handleTipo(value: string) {
    setTipoSel(value)
    setFiltros((prev) => ({
      ...prev,
      tipo: value === "todos" ? undefined : (value as ObraPublica["tipo"]),
    }))
  }

  function handleLimpiar() {
    setMunicipioSel("todos")
    setEstadoSel("todos")
    setTipoSel("todos")
    setFiltros({})
  }

  // Client-side filtering for estado and tipo (Firebase query only filters by municipioSlug)
  const obrasFiltradas = obras.filter((o) => {
    const coincideEstado = estadoSel === "todos" || o.estado === estadoSel
    const coincideTipo = tipoSel === "todos" || o.tipo === tipoSel
    return coincideEstado && coincideTipo
  })

  const countByEstado = (estado: ObraEstado) => obrasFiltradas.filter((o) => o.estado === estado).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Obras Públicas</h1>
            <p className="text-lg text-primary-foreground/90">
              Seguimiento ciudadano de obras públicas en los municipios del sudoeste chaqueño. Consultá el estado,
              avance y financiamiento de cada obra.
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-muted/30 py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Select value={municipioSel} onValueChange={handleMunicipio}>
                <SelectTrigger>
                  <SelectValue placeholder="Municipio" />
                </SelectTrigger>
                <SelectContent>
                  {MUNICIPIOS_FILTRO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={estadoSel} onValueChange={handleEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_FILTRO.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tipoSel} onValueChange={handleTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de obra" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_FILTRO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
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
          <div className="max-w-6xl mx-auto">
            {/* Contador y desglose */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="text-lg font-semibold">
                {loading ? "Cargando..." : `${obrasFiltradas.length} obra${obrasFiltradas.length !== 1 ? "s" : ""} encontrada${obrasFiltradas.length !== 1 ? "s" : ""}`}
              </span>
              {!loading && obrasFiltradas.length > 0 && (
                <>
                  {countByEstado("finalizada") > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      {countByEstado("finalizada")} finalizada{countByEstado("finalizada") !== 1 ? "s" : ""}
                    </span>
                  )}
                  {(countByEstado("en-ejecucion") + countByEstado("iniciada")) > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                      {countByEstado("en-ejecucion") + countByEstado("iniciada")} en curso
                    </span>
                  )}
                  {countByEstado("paralizada") > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      {countByEstado("paralizada")} paralizada{countByEstado("paralizada") !== 1 ? "s" : ""}
                    </span>
                  )}
                  {countByEstado("anunciada") > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      {countByEstado("anunciada")} anunciada{countByEstado("anunciada") !== 1 ? "s" : ""}
                    </span>
                  )}
                  {countByEstado("sin-informacion") > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {countByEstado("sin-informacion")} sin info
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Grid de cards */}
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : obrasFiltradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron obras</h3>
                <p className="text-muted-foreground mb-6">
                  Probá cambiando los filtros o consultá todas las obras sin filtrar.
                </p>
                <Button variant="outline" onClick={handleLimpiar} className="bg-transparent">
                  Ver todas las obras
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {obrasFiltradas.map((obra) => (
                  <Card key={obra.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorEstado(obra.estado)}`}>
                          {labelEstado(obra.estado)}
                        </span>
                        {obra.pedidoInformeAsociado && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                            Pedido de info enviado
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base leading-snug">{obra.nombre}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 flex-1">
                      <p className="text-sm text-muted-foreground">
                        {obra.municipio} &middot; {labelTipo(obra.tipo)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {labelOrigen(obra.origenFondos)} &middot; {labelEjecucion(obra.ejecucion)}
                      </p>

                      {/* Barra de progreso */}
                      {obra.avancePorcentaje != null && obra.avancePorcentaje > 0 && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Avance</span>
                            <span>{obra.avancePorcentaje}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-primary/20">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${obra.avancePorcentaje}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Verificación: Nivel {obra.nivelVerificacion}/5
                      </p>

                      <div className="mt-auto pt-2">
                        <Link href={`/obras-publicas/${obra.id}`}>
                          <Button variant="outline" size="sm" className="w-full bg-transparent">
                            Ver ficha
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

      <Footer />
    </div>
  )
}
