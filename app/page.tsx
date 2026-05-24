"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, FileText, Users, Building2, MapPin, Shield, Heart, BarChart2, Newspaper, Briefcase } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMunicipios, getPublicaciones } from "@/lib/firebase/public-site"
import type { Municipio, Publicacion } from "@/types/site"

export default function HomePage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [ultimosInformes, setUltimosInformes] = useState<Publicacion[]>([])

  useEffect(() => {
    void (async () => {
      const [municipiosData, publicacionesData] = await Promise.all([getMunicipios(), getPublicaciones()])
      setMunicipios(municipiosData.slice(0, 3))
      setUltimosInformes(publicacionesData.slice(0, 3))
    })()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">La transparencia no es un favor, es una obligación</h2>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 text-pretty">
              Iniciativa comunitaria para que los gobiernos municipales rindan cuentas a la ciudadanía.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/municipios"><Button size="lg" variant="secondary" className="w-full sm:w-auto">Ver Municipios</Button></Link>
              <Link href="/rendicion"><Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">Rendición de Cuentas</Button></Link>
              <Link href="/denuncias"><Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">Denunciar Incumplimientos</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Una iniciativa ciudadana por la transparencia</h3>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Transparencia Chaco es una plataforma independiente que monitorea y documenta el cumplimiento de las obligaciones de rendición de cuentas de los municipios del sudoeste chaqueño, especialmente en lo que respecta al Artículo 67 de la Ley Orgánica de Municipios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Documentación</CardTitle>
                <CardDescription>Recopilamos y publicamos información sobre la gestión municipal para que esté al alcance de todos.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Seguimiento</CardTitle>
                <CardDescription>Monitoreamos el cumplimiento de las obligaciones legales de transparencia y rendición de cuentas.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Participación</CardTitle>
                <CardDescription>Facilitamos la participación ciudadana mediante herramientas de denuncia y consulta accesibles.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Municipios Monitoreados</h3>
            <p className="text-lg text-muted-foreground">Seguimiento del cumplimiento de la rendición de cuentas en municipios del sudoeste chaqueño</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {municipios.map((municipio) => (
              <Card key={municipio.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{municipio.nombre}</CardTitle>
                    {municipio.estado === "cumple" && <Badge variant="default" className="bg-green-600">Cumple</Badge>}
                    {municipio.estado === "parcial" && <Badge variant="secondary" className="bg-amber-600 text-white">Parcial</Badge>}
                    {municipio.estado === "no-cumple" && <Badge variant="destructive">No Cumple</Badge>}
                  </div>
                  <CardDescription className="text-sm">{municipio.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/municipios/${municipio.slug}`}><Button variant="outline" size="sm" className="w-full bg-transparent">Ver Detalles</Button></Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/municipios"><Button variant="outline" size="lg">Ver Todos los Municipios</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Últimas Publicaciones</h3>
            <p className="text-lg text-muted-foreground">Informes, análisis y seguimiento de la gestión municipal</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {ultimosInformes.map((informe) => (
              <Card key={informe.slug} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{informe.titulo}</CardTitle>
                      <CardDescription className="text-sm">{informe.fecha} • {informe.categoria}</CardDescription>
                    </div>
                    <Link href={`/publicaciones/${informe.slug}`}>
                      <Button variant="ghost" size="sm">Leer más</Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/publicaciones"><Button variant="outline" size="lg">Ver Todas las Publicaciones</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Tu voz importa</h3>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Denunciar no es acusar, es pedir explicaciones. Unite a nuestra iniciativa y ayudanos a construir una cultura de transparencia en Chaco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/denuncias"><Button size="lg" variant="secondary" className="w-full sm:w-auto">Hacer una Denuncia</Button></Link>
              <Link href="/sumate"><Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">Sumate al Proyecto</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Módulos del Observatorio</h2>
            <p className="text-muted-foreground text-lg">Herramientas para el control ciudadano del Estado</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/obras-publicas">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <Building2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Obras Públicas</h3>
                  <p className="text-sm text-muted-foreground">Seguimiento de obras por municipio, estado y ejecutor</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/mapa-ciudadano">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Mapa Ciudadano</h3>
                  <p className="text-sm text-muted-foreground">Visualizá obras y reportes en el mapa interactivo</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/accidentes-seguridad">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Seguridad y Accidentes</h3>
                  <p className="text-sm text-muted-foreground">Reportes anonimizados de hechos de inseguridad</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/salud-hospital">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <Heart className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Salud / Hospital</h3>
                  <p className="text-sm text-muted-foreground">Reclamos ciudadanos sobre el sistema de salud</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/pedidos-informacion">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <FileText className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Pedidos de Información</h3>
                  <p className="text-sm text-muted-foreground">Seguimiento de pedidos de acceso a información pública</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/ranking-transparencia">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <BarChart2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Ranking de Transparencia</h3>
                  <p className="text-sm text-muted-foreground">Índice comparativo 0-100 por municipio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/medios">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <Newspaper className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Medios y Pauta Oficial</h3>
                  <p className="text-sm text-muted-foreground">Observatorio de pauta oficial y medios locales</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/proveedores-estado">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <Briefcase className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Proveedores del Estado</h3>
                  <p className="text-sm text-muted-foreground">Contratistas y proveedores del Estado identificados</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="text-center mt-10">
            <Link href="/cargar-reporte">
              <Button size="lg">Cargar un Reporte Ciudadano</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
