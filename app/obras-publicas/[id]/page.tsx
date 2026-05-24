"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, CheckCircle, FileText } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getObraById } from "@/lib/firebase/obras"
import type { ObraEstado, ObraPublica } from "@/types/obras"

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

function formatFecha(iso?: string): string {
  if (!iso) return "No informada"
  try {
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
  } catch {
    return iso
  }
}

const NIVELES_VERIFICACION: { nivel: number; descripcion: string }[] = [
  { nivel: 1, descripcion: "Reporte ciudadano sin verificar" },
  { nivel: 2, descripcion: "Con foto o documento adjunto" },
  { nivel: 3, descripcion: "Confirmado por múltiples fuentes" },
  { nivel: 4, descripcion: "Confirmado por documento oficial" },
  { nivel: 5, descripcion: "Respondido oficialmente" },
]

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm">{value ?? "No informado"}</dd>
    </div>
  )
}

export default function ObraDetallePage() {
  const params = useParams()
  const [obra, setObra] = useState<ObraPublica | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getObraById(String(params.id)).then((data) => {
      setObra(data)
      setLoading(false)
    })
  }, [params.id])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/obras-publicas" className="hover:text-foreground transition-colors">
            Obras Públicas
          </Link>
          {obra && (
            <>
              <span>/</span>
              <span className="text-foreground truncate max-w-xs">{obra.nombre}</span>
            </>
          )}
        </nav>

        {/* Estado de carga */}
        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Obra no encontrada */}
        {!loading && obra === null && (
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Obra no encontrada</h2>
              <p className="text-muted-foreground mb-6 text-sm">
                No encontramos la obra que buscás. Puede que haya sido removida o que el enlace sea incorrecto.
              </p>
              <Link href="/obras-publicas">
                <Button variant="outline">Volver a Obras Públicas</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Ficha de obra */}
        {!loading && obra !== null && (
          <div className="space-y-8">
            {/* Header */}
            <section>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${colorEstado(obra.estado)}`}>
                  {labelEstado(obra.estado)}
                </span>
                {obra.pedidoInformeAsociado && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Pedido de info enviado
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">{obra.nombre}</h1>
              <p className="text-lg text-muted-foreground">
                {obra.municipio} &middot; {labelTipo(obra.tipo)}
              </p>
              {obra.descripcion && (
                <p className="mt-3 text-muted-foreground leading-relaxed">{obra.descripcion}</p>
              )}
            </section>

            {/* Grid de cards informativas */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Identificación */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Identificación</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Campo label="Municipio" value={obra.municipio} />
                    <Campo label="Tipo de obra" value={labelTipo(obra.tipo)} />
                    <Campo label="Ubicación" value={obra.ubicacionTexto || undefined} />
                    <Campo label="Fuente de información" value={obra.fuenteInformacion} />
                    <Campo label="Nivel de verificación" value={`Nivel ${obra.nivelVerificacion}/5`} />
                  </dl>
                </CardContent>
              </Card>

              {/* Ejecución */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ejecución</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Campo label="Origen de fondos" value={labelOrigen(obra.origenFondos)} />
                    <Campo label="Forma de ejecución" value={labelEjecucion(obra.ejecucion)} />
                    <Campo label="Responsable informado" value={obra.responsableInformado} />
                    <Campo label="Contratista" value={obra.contratista} />
                  </dl>
                </CardContent>
              </Card>

              {/* Estado y avance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estado y avance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="space-y-3">
                    <Campo label="Estado actual" value={labelEstado(obra.estado)} />
                    <Campo label="Fecha de anuncio" value={formatFecha(obra.fechaAnuncioISO)} />
                    <Campo label="Fecha de inicio" value={formatFecha(obra.fechaInicioISO)} />
                    <Campo label="Fin prometido" value={formatFecha(obra.fechaFinISO)} />
                  </dl>
                  {obra.avancePorcentaje != null && obra.avancePorcentaje > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Avance</span>
                        <span>{obra.avancePorcentaje}%</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-primary/20">
                        <div
                          className="h-3 rounded-full bg-primary transition-all"
                          style={{ width: `${obra.avancePorcentaje}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Presupuesto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Presupuesto</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <Campo
                      label="Presupuesto informado"
                      value={obra.presupuestoInformado ?? "No informado"}
                    />
                  </dl>
                </CardContent>
              </Card>
            </div>

            {/* Pedido de información */}
            {obra.pedidoInformeAsociado && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Pedido de Información enviado</h3>
                      <p className="text-sm text-blue-700">
                        Se ha enviado un pedido formal de acceso a la información pública al organismo responsable
                        de esta obra. Aguardamos respuesta oficial.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Niveles de verificación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nivel de verificación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta obra tiene <strong>Nivel {obra.nivelVerificacion}/5</strong>. A continuación se explica qué
                  significa cada nivel:
                </p>
                <ol className="space-y-2">
                  {NIVELES_VERIFICACION.map(({ nivel, descripcion }) => (
                    <li
                      key={nivel}
                      className={`flex items-start gap-3 text-sm p-2 rounded-lg ${
                        nivel === obra.nivelVerificacion ? "bg-primary/10 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          nivel === obra.nivelVerificacion
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {nivel}
                      </span>
                      <span>{descripcion}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Botón volver */}
            <div className="pb-4">
              <Link href="/obras-publicas">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Obras Públicas
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
