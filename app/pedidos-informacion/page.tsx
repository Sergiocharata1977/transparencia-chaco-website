"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPedidosInformacion } from "@/lib/firebase/transparencia"
import type { PedidoEstado, PedidoInformacion } from "@/types/transparencia"

function estadoBadge(estado: PedidoEstado) {
  switch (estado) {
    case "respondido-completo":
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
          Respondido completo
        </span>
      )
    case "respondido-parcial":
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
          Respondido parcial
        </span>
      )
    case "sin-respuesta":
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
          Sin respuesta
        </span>
      )
    case "vencido":
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
          Vencido
        </span>
      )
    case "en-plazo":
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
          En plazo
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
          {estado}
        </span>
      )
  }
}

function formatFecha(fechaISO: string): string {
  if (!fechaISO) return "-"
  try {
    const [year, month, day] = fechaISO.split("-")
    return `${day}/${month}/${year}`
  } catch {
    return fechaISO
  }
}

export default function PedidosInformacionPage() {
  const [municipioSlug, setMunicipioSlug] = useState<string | undefined>()
  const [estado, setEstado] = useState<PedidoEstado | undefined>()
  const [pedidos, setPedidos] = useState<PedidoInformacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPedidosInformacion(municipioSlug).then((data) => {
      const filtered = estado ? data.filter((p) => p.estado === estado) : data
      setPedidos(filtered)
      setLoading(false)
    })
  }, [municipioSlug, estado])

  const conteos = {
    respondidoCompleto: pedidos.filter((p) => p.estado === "respondido-completo").length,
    respondidoParcial: pedidos.filter((p) => p.estado === "respondido-parcial").length,
    sinRespuesta: pedidos.filter((p) => p.estado === "sin-respuesta" || p.estado === "vencido").length,
    enPlazo: pedidos.filter((p) => p.estado === "en-plazo").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Pedidos de Acceso a la Información Pública
            </h1>
            <p className="text-lg text-primary-foreground/90">
              Registramos todos los pedidos enviados a municipios y organismos públicos. Monitoreo
              según Ley 27.275 y normativa provincial del Chaco.
            </p>
          </div>
        </div>
      </section>

      {/* Semáforo de estados */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6 text-center">Estado de los pedidos</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Verde */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-sm font-medium text-green-800">
                    Respondido completo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">{conteos.respondidoCompleto}</p>
                <p className="text-xs text-green-600 mt-1">pedidos</p>
              </CardContent>
            </Card>

            {/* Amarilla */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-sm font-medium text-yellow-800">
                    Respondido parcial
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-700">{conteos.respondidoParcial}</p>
                <p className="text-xs text-yellow-600 mt-1">pedidos</p>
              </CardContent>
            </Card>

            {/* Roja */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-sm font-medium text-red-800">
                    Sin respuesta / Vencido
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-700">{conteos.sinRespuesta}</p>
                <p className="text-xs text-red-600 mt-1">pedidos</p>
              </CardContent>
            </Card>

            {/* Gris */}
            <Card className="border-gray-200 bg-gray-50">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <CardTitle className="text-sm font-medium text-gray-700">En plazo</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-600">{conteos.enPlazo}</p>
                <p className="text-xs text-gray-500 mt-1">pedidos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-56">
              <Select
                value={municipioSlug ?? "todos"}
                onValueChange={(v) => setMunicipioSlug(v === "todos" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los municipios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los municipios</SelectItem>
                  <SelectItem value="charata">Charata</SelectItem>
                  <SelectItem value="las-brenas">Las Breñas</SelectItem>
                  <SelectItem value="corzuela">Corzuela</SelectItem>
                  <SelectItem value="presidencia-roque-saenz-pena">
                    Presidencia Roque Sáenz Peña
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={estado ?? "todos"}
                onValueChange={(v) =>
                  setEstado(v === "todos" ? undefined : (v as PedidoEstado))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="en-plazo">En plazo</SelectItem>
                  <SelectItem value="respondido-completo">Respondido completo</SelectItem>
                  <SelectItem value="respondido-parcial">Respondido parcial</SelectItem>
                  <SelectItem value="sin-respuesta">Sin respuesta</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : `Mostrando ${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
      </section>

      {/* Listado */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Cargando pedidos...</div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          ) : (
            <>
              {/* Tabla — visible en md+ */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Organismo</TableHead>
                      <TableHead>Tema</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Respuesta disponible</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatFecha(pedido.fechaISO)}
                        </TableCell>
                        <TableCell className="text-sm">{pedido.municipio}</TableCell>
                        <TableCell className="text-sm">{pedido.organismo}</TableCell>
                        <TableCell className="text-sm max-w-xs truncate">{pedido.tema}</TableCell>
                        <TableCell>{estadoBadge(pedido.estado)}</TableCell>
                        <TableCell>
                          {pedido.respuestaResumen ? (
                            <span className="text-sm font-medium text-green-700">Sí</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Pendiente</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Cards — visible en mobile */}
              <div className="md:hidden space-y-4">
                {pedidos.map((pedido) => (
                  <Card key={pedido.id}>
                    <CardContent className="pt-4 space-y-2">
                      <p className="font-semibold text-sm">{pedido.tema}</p>
                      <p className="text-sm text-muted-foreground">
                        {pedido.municipio} &mdash; {pedido.organismo}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatFecha(pedido.fechaISO)}
                        </span>
                        {estadoBadge(pedido.estado)}
                      </div>
                      {pedido.respuestaResumen && (
                        <p className="text-xs font-medium text-green-700">Respuesta disponible</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Nota institucional */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-muted/30 rounded-xl p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              El derecho de acceso a la información pública está reconocido en la{" "}
              <strong>Ley Nacional 27.275</strong>. Todo ciudadano puede solicitar información a
              cualquier organismo del Estado. Los plazos legales de respuesta son de{" "}
              <strong>30 días hábiles</strong>.
            </p>
            <div className="mt-4">
              <a
                href="#"
                className="text-sm font-medium text-primary hover:underline"
              >
                Descargar modelo de pedido de información
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
