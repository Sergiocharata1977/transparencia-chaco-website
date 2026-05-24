"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ExternalLink, Globe, Mail, MessageSquare } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMedioById, getPautasByMedio } from "@/lib/firebase/transparencia"
import type { Medio, PautaOficial, SemaforoColor } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIPO_LABELS: Record<string, string> = {
  radio: "Radio",
  "portal-web": "Portal web",
  "canal-tv": "Canal TV",
  streaming: "Streaming",
  grafica: "Gráfica",
  "red-social": "Red social",
  otro: "Otro",
}

const ESTADO_LABELS: Record<string, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  "sin-verificar": "Sin verificar",
}

const VERIFICACION_LABELS: Record<string, string> = {
  "sin-verificar": "Sin verificar",
  "con-documento": "Con documento",
  confirmado: "Confirmado",
  observado: "Observado",
}

function getSemaforoConfig(semaforo?: SemaforoColor): {
  className: string
  label: string
} {
  switch (semaforo) {
    case "verde":
      return { className: "bg-green-100 text-green-800", label: "Alta transparencia" }
    case "amarillo":
      return { className: "bg-yellow-100 text-yellow-800", label: "Información incompleta" }
    case "rojo":
      return { className: "bg-red-100 text-red-800", label: "Baja transparencia" }
    default:
      return { className: "bg-gray-100 text-gray-600", label: "Sin datos suficientes" }
  }
}

const CRITERIOS_INDICE = [
  {
    num: 1,
    titulo: "Publicación de noticias de interés público",
    descripcion:
      "¿El medio publica regularmente información sobre gestión de gobierno, obras y servicios?",
  },
  {
    num: 2,
    titulo: "Cobertura de rendición de cuentas",
    descripcion:
      "¿Informa sobre presupuesto municipal, ejecución y auditorías de forma accesible?",
  },
  {
    num: 3,
    titulo: "Identificación del responsable editorial",
    descripcion:
      "¿El medio identifica públicamente a su director/a o responsable periodístico?",
  },
  {
    num: 4,
    titulo: "Acceso a fuentes oficiales y alternativas",
    descripcion:
      "¿La cobertura incluye tanto fuentes oficiales como voces ciudadanas o de oposición?",
  },
  {
    num: 5,
    titulo: "Publicación de correcciones",
    descripcion:
      "¿El medio tiene práctica documentada de publicar correcciones ante errores?",
  },
  {
    num: 6,
    titulo: "Transparencia sobre propiedad y financiamiento",
    descripcion:
      "¿Se conoce públicamente quién es el propietario y qué ingresos recibe del Estado?",
  },
  {
    num: 7,
    titulo: "Cobertura de denuncias ciudadanas",
    descripcion:
      "¿El medio da espacio a denuncias de irregularidades o reclamos de la comunidad?",
  },
  {
    num: 8,
    titulo: "Respeto a la privacidad en coberturas sensibles",
    descripcion:
      "¿Evita publicar datos personales de víctimas o involucrados en situaciones vulnerables?",
  },
  {
    num: 9,
    titulo: "Distinción entre información y opinión",
    descripcion:
      "¿El medio diferencia claramente noticias de columnas de opinión o contenido patrocinado?",
  },
  {
    num: 10,
    titulo: "Actualización y continuidad informativa",
    descripcion:
      "¿El medio mantiene publicación activa y consistente sin períodos prolongados de inactividad?",
  },
]

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function DetalleSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b bg-background" />
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4 max-w-5xl space-y-3">
          <Skeleton className="h-4 w-48 bg-primary-foreground/20" />
          <Skeleton className="h-10 w-80 bg-primary-foreground/20" />
          <Skeleton className="h-6 w-36 rounded-full bg-primary-foreground/20" />
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-5xl py-10 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MedioDetallePage() {
  const params = useParams()
  const [medio, setMedio] = useState<Medio | null>(null)
  const [pautas, setPautas] = useState<PautaOficial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = String(params.id)
    Promise.all([getMedioById(id), getPautasByMedio(id)]).then(([m, p]) => {
      setMedio(m)
      setPautas(p)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <DetalleSkeleton />

  if (!medio) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Medio no encontrado</h1>
            <p className="text-muted-foreground mb-6">
              El medio que buscás no existe o no está disponible.
            </p>
            <Link href="/medios">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Medios
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const semConfig = getSemaforoConfig(medio.semaforo)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / Header */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground">
                      Inicio
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/medios" className="text-primary-foreground/70 hover:text-primary-foreground">
                      Medios
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary-foreground font-medium">
                    {medio.nombre}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{medio.nombre}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    {TIPO_LABELS[medio.tipo] ?? medio.tipo}
                  </Badge>
                  <span className="text-primary-foreground/80 text-sm">{medio.ciudadPrincipal}</span>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shrink-0 ${semConfig.className}`}
              >
                {semConfig.label}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Información general */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Información del medio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Información del medio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{TIPO_LABELS[medio.tipo] ?? medio.tipo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ciudad</span>
                  <span className="font-medium">{medio.ciudadPrincipal}</span>
                </div>
                {medio.razonSocial && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Razón social</span>
                    <span className="font-medium">{medio.razonSocial}</span>
                  </div>
                )}
                {medio.sitioWeb && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sitio web</span>
                    <a
                      href={medio.sitioWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      Visitar
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {medio.contactoPublico && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contacto público</span>
                    <span className="font-medium">{medio.contactoPublico}</span>
                  </div>
                )}
                {medio.responsableInformado && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsable</span>
                    <span className="font-medium">{medio.responsableInformado}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Estado del medio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge
                    variant={
                      medio.estado === "activo"
                        ? "default"
                        : medio.estado === "inactivo"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {ESTADO_LABELS[medio.estado] ?? medio.estado}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recibe pauta oficial</span>
                  <span className="font-medium">
                    {medio.recibePautaOficial === true
                      ? "Sí"
                      : medio.recibePautaOficial === false
                        ? "No"
                        : "Sin datos"}
                  </span>
                </div>
                {medio.descripcion && (
                  <p className="text-muted-foreground pt-2 border-t">{medio.descripcion}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pauta oficial registrada */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold mb-4">Pauta oficial registrada</h2>
          {pautas.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Organismo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Fuente</TableHead>
                      <TableHead>Verificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pautas.map((pauta) => (
                      <TableRow key={pauta.id}>
                        <TableCell>{pauta.periodo}</TableCell>
                        <TableCell>{pauta.organismo}</TableCell>
                        <TableCell>{pauta.monto ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {pauta.fuenteDocumental ?? pauta.numeroDocumento ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pauta.estadoVerificacion === "confirmado"
                                ? "default"
                                : pauta.estadoVerificacion === "observado"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {VERIFICACION_LABELS[pauta.estadoVerificacion] ??
                              pauta.estadoVerificacion}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <p className="text-muted-foreground">
              No hay pauta oficial registrada para este medio.
            </p>
          )}
        </div>
      </section>

      {/* Índice de Transparencia Informativa */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-bold mb-4">Índice de Transparencia Informativa</h2>

          {medio.indiceTransparencia !== undefined ? (
            <div className="flex items-center gap-4 mb-6">
              <span
                className={`text-5xl font-extrabold ${
                  medio.semaforo === "verde"
                    ? "text-green-700"
                    : medio.semaforo === "amarillo"
                      ? "text-yellow-700"
                      : medio.semaforo === "rojo"
                        ? "text-red-700"
                        : "text-gray-500"
                }`}
              >
                {medio.indiceTransparencia}
                <span className="text-2xl font-semibold">/100</span>
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${semConfig.className}`}
              >
                {semConfig.label}
              </span>
            </div>
          ) : (
            <p className="text-muted-foreground mb-6">Este medio aún no fue evaluado.</p>
          )}

          <h3 className="font-semibold text-base mb-3 text-muted-foreground">
            Criterios de evaluación del índice (10 dimensiones):
          </h3>
          <div className="space-y-3">
            {CRITERIOS_INDICE.map((c) => (
              <div key={c.num} className="flex gap-3 p-4 rounded-lg bg-muted/40">
                <span className="text-primary font-bold text-sm w-6 shrink-0">{c.num}.</span>
                <div>
                  <p className="font-medium text-sm">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Derecho a respuesta */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Derecho a respuesta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Sos responsable de este medio y querés enviar una aclaración? Escribinos a{" "}
                <a
                  href="mailto:contacto@transparenciachaco.org"
                  className="text-primary hover:underline font-medium"
                >
                  contacto@transparenciachaco.org
                </a>
                . Revisamos cada solicitud y publicamos correcciones dentro de los 5 días hábiles.
              </p>
              <a href="mailto:contacto@transparenciachaco.org">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar aclaración
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Nota legal obligatoria */}
      <div className="container mx-auto px-4 max-w-5xl py-8">
        <div className="bg-gray-50 rounded border p-4 text-sm text-muted-foreground">
          Este observatorio publica datos de interés público con base en fuentes documentales y
          pedidos de información. Todo medio mencionado puede solicitar corrección o derecho a
          respuesta.
        </div>
      </div>

      {/* Botón volver */}
      <div className="container mx-auto px-4 max-w-5xl pb-10">
        <Link href="/medios">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Medios
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
