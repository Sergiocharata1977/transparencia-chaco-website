"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CheckCircle2, XCircle, Award, TrendingUp } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getRankingMunicipios } from "@/lib/firebase/transparencia"
import type { RankingMunicipio, CriteriosRanking } from "@/types/transparencia"
import { PESOS_RANKING } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function colorPuntaje(p: number) {
  if (p >= 70)
    return {
      card: "bg-green-50 border-green-200 text-green-800",
      badge: "bg-green-100 text-green-800",
    }
  if (p >= 40)
    return {
      card: "bg-yellow-50 border-yellow-200 text-yellow-800",
      badge: "bg-yellow-100 text-yellow-800",
    }
  return {
    card: "bg-red-50 border-red-200 text-red-800",
    badge: "bg-red-100 text-red-800",
  }
}

const CRITERIO_LABELS: Record<keyof CriteriosRanking, string> = {
  publicaListadoObras: "Publica Obras",
  publicaPresupuesto: "Presupuesto",
  publicaContratistas: "Contratistas",
  publicaAvanceFisico: "Avance Físico",
  publicaFechas: "Fechas",
  publicaDocumentos: "Documentos",
  respondePedidos: "Responde",
}

const CRITERIO_DESCRIPCION: Record<keyof CriteriosRanking, string> = {
  publicaListadoObras: "Publica listado de obras públicas",
  publicaPresupuesto: "Publica presupuesto ejecutado",
  publicaContratistas: "Informa contratistas adjudicados",
  publicaAvanceFisico: "Informa avance físico de obras",
  publicaFechas: "Publica fechas de inicio y fin",
  publicaDocumentos: "Publica documentos de licitación",
  respondePedidos: "Responde pedidos de información",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RankingTransparenciaPage() {
  const [ranking, setRanking] = useState<RankingMunicipio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRankingMunicipios().then((data) => {
      setRanking(data)
      setLoading(false)
    })
  }, [])

  const chartData = ranking.map((r) => ({
    name: r.municipio.split(" ")[0],
    puntaje: r.puntajeTotal,
  }))

  const criterioKeys = Object.keys(CRITERIO_LABELS) as (keyof CriteriosRanking)[]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <Award className="h-12 w-12 text-primary-foreground/80" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Índice de Transparencia Municipal
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Medimos 7 criterios objetivos. Puntaje de 0 a 100.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Cards de puntaje                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse h-36" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {ranking.map((r, idx) => {
                const colors = colorPuntaje(r.puntajeTotal)
                return (
                  <Card
                    key={r.municipioSlug}
                    className={`border-2 ${colors.card} relative`}
                  >
                    {idx === 0 && (
                      <div className="absolute top-3 right-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    <CardHeader className="pb-1">
                      <CardTitle className="text-sm font-medium leading-tight">
                        {r.municipio}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-4xl font-bold">{r.puntajeTotal}</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}
                      >
                        {r.puntajeTotal >= 70
                          ? "Alto"
                          : r.puntajeTotal >= 40
                          ? "Medio"
                          : "Bajo"}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Gráfico comparativo                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Comparación por municipio</h2>
          {loading ? (
            <div className="h-[280px] bg-muted animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value} pts`, "Puntaje"]}
                />
                <Bar dataKey="puntaje" fill="#2563eb" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Tabla de criterios                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Detalle por criterio</h2>
          {loading ? (
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Municipio</TableHead>
                  {criterioKeys.map((k) => (
                    <TableHead key={k} className="text-center">
                      {CRITERIO_LABELS[k]}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((r) => {
                  const colors = colorPuntaje(r.puntajeTotal)
                  return (
                    <TableRow key={r.municipioSlug}>
                      <TableCell className="font-medium">{r.municipio}</TableCell>
                      {criterioKeys.map((k) => (
                        <TableCell key={k} className="text-center">
                          {r.criterios[k] ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        <Badge className={`border-transparent ${colors.badge}`}>
                          {r.puntajeTotal} pts
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Panel de criterios y pesos                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Criterios evaluados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criterioKeys.map((k) => (
              <Card key={k} className="border">
                <CardContent className="flex items-center justify-between py-4">
                  <span className="text-sm font-medium">{CRITERIO_DESCRIPCION[k]}</span>
                  <span className="ml-4 shrink-0 text-sm font-bold text-primary">
                    {PESOS_RANKING[k]} puntos
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Estadísticas secundarias                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Estadísticas por municipio</h2>
          {loading ? (
            <div className="h-48 bg-muted animate-pulse rounded-lg" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ranking.map((r) => (
                <Card key={r.municipioSlug} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{r.municipio}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Obras registradas</span>
                      <span className="font-semibold">{r.obrasRegistradas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Obras paralizadas</span>
                      <span className="font-semibold text-red-600">{r.obrasParalizadas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pedidos sin respuesta</span>
                      <span className="font-semibold text-yellow-700">{r.pedidosSinRespuesta}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Nota al pie                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            Este índice refleja los datos cargados en el observatorio. Los municipios pueden mejorar
            su puntaje publicando información proactivamente.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
