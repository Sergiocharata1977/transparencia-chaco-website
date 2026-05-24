"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, Calendar, CheckCircle, FileText, MapPin, User, Users, XCircle } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getMunicipioBySlug } from "@/lib/firebase/public-site"
import type { Municipio } from "@/types/site"

export default function MunicipioDetallePage({ params }: { params: { slug: string } }) {
  const [municipio, setMunicipio] = useState<Municipio | null>(null)

  useEffect(() => {
    void (async () => {
      setMunicipio(await getMunicipioBySlug(params.slug))
    })()
  }, [params.slug])

  if (!municipio) {
    return <div className="min-h-screen bg-background"><Navbar /><section className="py-24"><div className="container mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Municipio no encontrado</h1><Link href="/municipios"><Button>Volver a Municipios</Button></Link></div></section><Footer /></div>
  }

  const ordenanzas = municipio.ordenanzas ?? []
  const indicadores = municipio.indicadores ?? []
  const publicaciones = municipio.publicaciones ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Link href="/municipios" className="text-sm text-primary-foreground/80 hover:text-primary-foreground mb-4 inline-block">← Volver a Municipios</Link>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{municipio.nombre}</h1>
                <div className="flex items-center gap-4 text-primary-foreground/90">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /><span>{municipio.region}</span></div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>{municipio.poblacion} hab.</span></div>
                </div>
              </div>
              {municipio.estado === "cumple" && <Badge variant="default" className="bg-green-600 text-lg py-2 px-4">Cumple</Badge>}
              {municipio.estado === "parcial" && <Badge variant="secondary" className="bg-amber-600 text-white text-lg py-2 px-4">Parcial</Badge>}
              {municipio.estado === "no-cumple" && <Badge variant="destructive" className="text-lg py-2 px-4">No Cumple</Badge>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <Card><CardHeader><div className="flex items-center gap-2 mb-2"><User className="h-5 w-5 text-primary" /><CardTitle>Autoridades</CardTitle></div><CardDescription>Intendente: {municipio.intendente}</CardDescription></CardHeader></Card>
            <Card><CardHeader><div className="flex items-center gap-2 mb-2"><Calendar className="h-5 w-5 text-primary" /><CardTitle>Última Actualización</CardTitle></div><CardDescription>{municipio.ultimaActualizacion}</CardDescription></CardHeader></Card>
          </div>
        </div>
      </section>

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
                    <CardDescription>Estado de cumplimiento de las obligaciones de transparencia y rendición de cuentas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {indicadores.map((indicador) => (
                        <div key={indicador.titulo} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                          {indicador.cumple ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />}
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
                  <CardHeader><CardTitle>Ordenanzas Relevantes</CardTitle><CardDescription>Normativa municipal relacionada con transparencia y gestión</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ordenanzas.map((ordenanza) => (
                        <div key={`${ordenanza.numero}-${ordenanza.fecha}`} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><span className="font-semibold">Ordenanza {ordenanza.numero}</span></div>
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
                  <CardHeader><CardTitle>Publicaciones sobre {municipio.nombre}</CardTitle><CardDescription>Informes, análisis y seguimiento de la gestión municipal</CardDescription></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {publicaciones.map((pub) => (
                        <div key={`${pub.titulo}-${pub.fecha}`} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <h4 className="font-medium mb-1">{pub.titulo}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{pub.fecha} • {pub.categoria}</p>
                          <Link href={pub.slug ? `/publicaciones/${pub.slug}` : "/publicaciones"}><Button variant="ghost" size="sm" className="h-8 px-2">Leer más →</Button></Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4"><AlertCircle className="h-12 w-12 text-primary" /></div>
                <CardTitle className="text-2xl">¿Tenés información sobre este municipio?</CardTitle>
                <CardDescription className="text-base">Si tenés documentos, datos o información que pueda contribuir a mejorar la transparencia en {municipio.nombre}, podés hacer una denuncia ciudadana.</CardDescription>
                <div className="pt-4"><Link href="/denuncias"><Button size="lg">Hacer una Denuncia</Button></Link></div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
