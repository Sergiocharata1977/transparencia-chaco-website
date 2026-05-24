import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { MapPin, User, Users, Calendar, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function MunicipioDetallePage({ params }: { params: { slug: string } }) {
  // Datos de ejemplo - en producción vendrían de una base de datos
  const municipio = {
    nombre: "Charata",
    estado: "cumple",
    region: "Sudoeste",
    intendente: "Jorge Capitanich",
    poblacion: "30.000",
    ultimaActualizacion: "15 de Marzo, 2024",
    descripcion: "Charata es el municipio principal del sudoeste chaqueño, conocido por su producción agropecuaria.",
  }

  const ordenanzas = [
    {
      numero: "1234/2023",
      titulo: "Presupuesto Municipal 2024",
      fecha: "15 de Diciembre, 2023",
      estado: "Publicada",
    },
    {
      numero: "1100/2023",
      titulo: "Rendición de Cuentas Anual",
      fecha: "20 de Noviembre, 2023",
      estado: "Publicada",
    },
    {
      numero: "980/2023",
      titulo: "Plan de Obras Públicas 2024",
      fecha: "10 de Octubre, 2023",
      estado: "Publicada",
    },
  ]

  const indicadores = [
    {
      titulo: "Presupuesto publicado",
      cumple: true,
      descripcion: "Presupuesto anual 2024 disponible en el portal municipal",
    },
    {
      titulo: "Ejecución presupuestaria",
      cumple: true,
      descripcion: "Informes trimestrales actualizados hasta marzo 2024",
    },
    {
      titulo: "Ordenanzas municipales",
      cumple: true,
      descripcion: "Todas las ordenanzas 2023-2024 publicadas",
    },
    {
      titulo: "Nómina de personal",
      cumple: true,
      descripcion: "Lista actualizada de empleados municipales disponible",
    },
    {
      titulo: "Licitaciones y contratos",
      cumple: true,
      descripcion: "Portal de contrataciones actualizado regularmente",
    },
    {
      titulo: "Actas del Concejo",
      cumple: true,
      descripcion: "Actas de sesiones publicadas dentro de los 10 días",
    },
  ]

  const publicaciones = [
    {
      titulo: "Informe de Rendición de Cuentas - Charata",
      fecha: "15 de Marzo, 2024",
      categoria: "Informe Municipal",
    },
    {
      titulo: "Análisis del presupuesto 2024",
      fecha: "28 de Febrero, 2024",
      categoria: "Análisis",
    },
    {
      titulo: "Obras públicas en ejecución",
      fecha: "10 de Febrero, 2024",
      categoria: "Seguimiento",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/municipios"
              className="text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4 inline-block"
            >
              ← Volver a Municipios
            </Link>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{municipio.nombre}</h1>
                <div className="flex items-center gap-4 text-primary-foreground/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{municipio.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{municipio.poblacion} hab.</span>
                  </div>
                </div>
              </div>
              {municipio.estado === "cumple" && (
                <Badge variant="default" className="bg-green-600 text-lg py-2 px-4">
                  Cumple
                </Badge>
              )}
              {municipio.estado === "parcial" && (
                <Badge variant="secondary" className="bg-amber-600 text-white text-lg py-2 px-4">
                  Parcial
                </Badge>
              )}
              {municipio.estado === "no-cumple" && (
                <Badge variant="destructive" className="text-lg py-2 px-4">
                  No Cumple
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Información general */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Autoridades</CardTitle>
                </div>
                <CardDescription>Intendente: {municipio.intendente}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Última Actualización</CardTitle>
                </div>
                <CardDescription>{municipio.ultimaActualizacion}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Contenido principal con tabs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="indicadores" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
                <TabsTrigger value="ordenanzas">Ordenanzas</TabsTrigger>
                <TabsTrigger value="publicaciones">Publicaciones</TabsTrigger>
              </TabsList>

              <TabsContent value="indicadores" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cumplimiento del Art. 67 - Ley Orgánica de Municipios</CardTitle>
                    <CardDescription>
                      Estado de cumplimiento de las obligaciones de transparencia y rendición de cuentas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {indicadores.map((indicador, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          {indicador.cumple ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{indicador.titulo}</h4>
                            <p className="text-sm text-muted-foreground">{indicador.descripcion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ordenanzas" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ordenanzas Relevantes</CardTitle>
                    <CardDescription>Normativa municipal relacionada con transparencia y gestión</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ordenanzas.map((ordenanza, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-semibold">Ordenanza {ordenanza.numero}</span>
                              </div>
                              <h4 className="font-medium mb-1">{ordenanza.titulo}</h4>
                              <p className="text-sm text-muted-foreground">{ordenanza.fecha}</p>
                            </div>
                            <Badge variant="outline">{ordenanza.estado}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publicaciones" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Publicaciones sobre {municipio.nombre}</CardTitle>
                    <CardDescription>Informes, análisis y seguimiento de la gestión municipal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {publicaciones.map((pub, index) => (
                        <div key={index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <h4 className="font-medium mb-1">{pub.titulo}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {pub.fecha} • {pub.categoria}
                          </p>
                          <Link href="/publicaciones">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              Leer más →
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <Link href={`/publicaciones?municipio=${municipio.nombre}`}>
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver todas las publicaciones
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">¿Tenés información sobre este municipio?</CardTitle>
                <CardDescription className="text-base">
                  Si tenés documentos, datos o información que pueda contribuir a mejorar la transparencia en{" "}
                  {municipio.nombre}, podés hacer una denuncia ciudadana.
                </CardDescription>
                <div className="pt-4">
                  <Link href="/denuncias">
                    <Button size="lg">Hacer una Denuncia</Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
