"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, LayoutGrid, List } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getObrasPublicas } from "@/lib/firebase/obras"
import type { ObraEstado, ObraPublica } from "@/types/obras"

// ─── helpers ───────────────────────────────────────────────────────────────

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

// ─── constants ──────────────────────────────────────────────────────────────

const ESTADOS_FILTRO = [
  { value: "todos", label: "Todos los estados" },
  { value: "anunciada", label: "Anunciada" },
  { value: "iniciada", label: "Iniciada" },
  { value: "en-ejecucion", label: "En ejecución" },
  { value: "paralizada", label: "Paralizada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "sin-informacion", label: "Sin información" },
]

const TIPOS_FILTRO = [
  { value: "todos", label: "Todos los tipos" },
  { value: "pavimento", label: "Pavimento" },
  { value: "ripio", label: "Ripio" },
  { value: "iluminacion", label: "Iluminación" },
  { value: "cloacas", label: "Cloacas" },
  { value: "edificio-publico", label: "Edificio público" },
  { value: "plaza", label: "Plaza" },
  { value: "otro", label: "Otro" },
]

const MUNICIPIOS_FILTRO = [
  { value: "todos", label: "Todos los municipios" },
  { value: "charata", label: "Charata" },
  { value: "las-brenas", label: "Las Breñas" },
  { value: "corzuela", label: "Corzuela" },
  { value: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

const ORDEN_OPCIONES = [
  { value: "reciente", label: "Más reciente" },
  { value: "municipio", label: "Por municipio (A-Z)" },
  { value: "estado", label: "Por estado" },
]

const PAGE_SIZE = 12

// ─── component ──────────────────────────────────────────────────────────────

export function ObrasPublicasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read initial values from URL
  const municipioParam = searchParams.get("municipio") ?? "todos"
  const tipoParam = searchParams.get("tipo") ?? "todos"
  const estadoParam = searchParams.get("estado") ?? "todos"
  const ordenParam = searchParams.get("orden") ?? "reciente"
  const paginaParam = Number(searchParams.get("pagina") ?? "1")

  const [obras, setObras] = useState<ObraPublica[]>([])
  const [loading, setLoading] = useState(true)
  const [vistaLista, setVistaLista] = useState(false)

  // Fetch all obras once (filter client-side via useMemo — no re-fetch per filter change)
  useEffect(() => {
    setLoading(true)
    getObrasPublicas().then((data) => {
      setObras(data)
      setLoading(false)
    })
  }, [])

  // ── URL helpers ──────────────────────────────────────────────────────────

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(overrides)) {
      if (v === "todos" || v === "reciente" || (k === "pagina" && v === "1")) {
        params.delete(k)
      } else {
        params.set(k, v)
      }
    }
    const qs = params.toString()
    return `/obras-publicas${qs ? `?${qs}` : ""}`
  }

  function navigate(overrides: Record<string, string>) {
    router.push(buildUrl(overrides))
  }

  function handleMunicipio(value: string) { navigate({ municipio: value, pagina: "1" }) }
  function handleEstado(value: string)    { navigate({ estado: value, pagina: "1" }) }
  function handleTipo(value: string)      { navigate({ tipo: value, pagina: "1" }) }
  function handleOrden(value: string)     { navigate({ orden: value, pagina: "1" }) }
  function handleLimpiar()                { router.push("/obras-publicas") }

  // ── Derived: filtered + sorted ────────────────────────────────────────────

  const obrasFiltradas = useMemo(() => {
    let result = obras.filter((o) => {
      const coincideMunicipio = municipioParam === "todos" || o.municipioSlug === municipioParam
      const coincideEstado    = estadoParam    === "todos" || o.estado          === estadoParam
      const coincideTipo      = tipoParam      === "todos" || o.tipo            === tipoParam
      return coincideMunicipio && coincideEstado && coincideTipo
    })

    if (ordenParam === "municipio") {
      result = [...result].sort((a, b) => a.municipio.localeCompare(b.municipio, "es"))
    } else if (ordenParam === "estado") {
      const estadoOrder: Record<ObraEstado, number> = {
        "en-ejecucion": 0,
        iniciada: 1,
        finalizada: 2,
        anunciada: 3,
        paralizada: 4,
        "sin-informacion": 5,
      }
      result = [...result].sort((a, b) => (estadoOrder[a.estado] ?? 99) - (estadoOrder[b.estado] ?? 99))
    }
    return result
  }, [obras, municipioParam, estadoParam, tipoParam, ordenParam])

  // ── Pagination ───────────────────────────────────────────────────────────

  const totalPaginas  = Math.max(1, Math.ceil(obrasFiltradas.length / PAGE_SIZE))
  const paginaActual  = Math.min(Math.max(1, paginaParam), totalPaginas)
  const offset        = (paginaActual - 1) * PAGE_SIZE
  const obrasPagina   = obrasFiltradas.slice(offset, offset + PAGE_SIZE)

  function irPagina(p: number) {
    navigate({ pagina: String(p) })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  const countByEstado = (estado: ObraEstado) => obrasFiltradas.filter((o) => o.estado === estado).length

  // ── Render ───────────────────────────────────────────────────────────────

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
              <Select value={municipioParam} onValueChange={handleMunicipio}>
                <SelectTrigger>
                  <SelectValue placeholder="Municipio" />
                </SelectTrigger>
                <SelectContent>
                  {MUNICIPIOS_FILTRO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={estadoParam} onValueChange={handleEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_FILTRO.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tipoParam} onValueChange={handleTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de obra" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_FILTRO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
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

            {/* Toolbar: contador + orden + toggle vista */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Contador + badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-semibold">
                  {loading
                    ? "Cargando..."
                    : `${obrasFiltradas.length} obra${obrasFiltradas.length !== 1 ? "s" : ""} encontrada${obrasFiltradas.length !== 1 ? "s" : ""}`}
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

              {/* Orden + toggle vista */}
              <div className="flex items-center gap-2">
                <Select value={ordenParam} onValueChange={handleOrden}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDEN_OPCIONES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={vistaLista ? "outline" : "default"}
                  size="icon"
                  onClick={() => setVistaLista(false)}
                  title="Vista grilla"
                  className={vistaLista ? "bg-transparent" : ""}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={vistaLista ? "default" : "outline"}
                  size="icon"
                  onClick={() => setVistaLista(true)}
                  title="Vista lista"
                  className={vistaLista ? "" : "bg-transparent"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Contenido */}
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
            ) : vistaLista ? (
              /* ── Vista lista (tabla) ── */
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Nombre</th>
                      <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Municipio</th>
                      <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium">Estado</th>
                      <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Avance</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {obrasPagina.map((obra, idx) => (
                      <tr
                        key={obra.id}
                        className={`border-t ${idx % 2 === 0 ? "" : "bg-muted/20"} hover:bg-muted/40 transition-colors`}
                      >
                        <td className="px-4 py-3 font-medium max-w-xs truncate">{obra.nombre}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{obra.municipio}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{labelTipo(obra.tipo)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorEstado(obra.estado)}`}>
                            {labelEstado(obra.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {obra.avancePorcentaje != null ? (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-24 rounded-full bg-primary/20">
                                <div
                                  className="h-2 rounded-full bg-primary transition-all"
                                  style={{ width: `${obra.avancePorcentaje}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{obra.avancePorcentaje}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/obras-publicas/${obra.id}`}>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Ver ficha
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── Vista grilla (cards) ── */
              <div className="grid md:grid-cols-3 gap-6">
                {obrasPagina.map((obra) => (
                  <Card key={obra.id} className="hover:shadow-lg transition-shadow flex flex-col">
                    {/* Imagen / placeholder */}
                    <div className="h-32 rounded-t-xl bg-muted/50 flex items-center justify-center overflow-hidden">
                      {obra.fotos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={obra.fotos[0]}
                          alt={obra.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-10 w-10 text-muted-foreground/40" />
                      )}
                    </div>

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

            {/* Paginación */}
            {!loading && obrasFiltradas.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  variant="outline"
                  onClick={() => irPagina(paginaActual - 1)}
                  disabled={paginaActual <= 1}
                  className="bg-transparent"
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  variant="outline"
                  onClick={() => irPagina(paginaActual + 1)}
                  disabled={paginaActual >= totalPaginas}
                  className="bg-transparent"
                >
                  Siguiente
                </Button>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
