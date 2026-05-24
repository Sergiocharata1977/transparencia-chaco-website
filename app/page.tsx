import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Users } from "lucide-react"

export default function HomePage() {
  const municipios = [
    {
      nombre: "Charata",
      estado: "cumple",
      provincia: "Chaco",
      descripcion: "Municipio principal del sudoeste chaqueño",
    },
    {
      nombre: "Presidencia Roque Sáenz Peña",
      estado: "parcial",
      provincia: "Chaco",
      descripcion: "Capital departamental",
    },
    {
      nombre: "General Pinedo",
      estado: "no-cumple",
      provincia: "Chaco",
      descripcion: "Municipio del sudoeste",
    },
  ]

  const ultimosInformes = [
    {
      titulo: "Informe de Rendición de Cuentas - Charata",
      fecha: "15 de Marzo, 2024",
      categoria: "Informe Municipal",
    },
    {
      titulo: "Análisis del cumplimiento del Art. 67",
      fecha: "28 de Febrero, 2024",
      categoria: "Marco Legal",
    },
    {
      titulo: "Transparencia en el uso de fondos públicos",
      fecha: "10 de Febrero, 2024",
      categoria: "Investigación",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              La transparencia no es un favor, es una obligación
            </h2>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 text-pretty">
              Iniciativa comunitaria para que los gobiernos municipales rindan cuentas a la ciudadanía.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/municipios">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Ver Municipios
                </Button>
              </Link>
              <Link href="/rendicion">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Rendición de Cuentas
                </Button>
              </Link>
              <Link href="/denuncias">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Denunciar Incumplimientos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre el proyecto */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Una iniciativa ciudadana por la transparencia
            </h3>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Transparencia Chaco es una plataforma independiente que monitorea y documenta el cumplimiento de las
              obligaciones de rendición de cuentas de los municipios del sudoeste chaqueño, especialmente en lo que
              respecta al Artículo 67 de la Ley Orgánica de Municipios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Documentación</CardTitle>
                <CardDescription>
                  Recopilamos y publicamos información sobre la gestión municipal para que esté al alcance de todos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Seguimiento</CardTitle>
                <CardDescription>
                  Monitoreamos el cumplimiento de las obligaciones legales de transparencia y rendición de cuentas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Participación</CardTitle>
                <CardDescription>
                  Facilitamos la participación ciudadana mediante herramientas de denuncia y consulta accesibles.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Municipios Monitoreados */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Municipios Monitoreados</h3>
            <p className="text-lg text-muted-foreground">
              Seguimiento del cumplimiento de la rendición de cuentas en municipios del sudoeste chaqueño
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {municipios.map((municipio) => (
              <Card key={municipio.nombre} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{municipio.nombre}</CardTitle>
                    {municipio.estado === "cumple" && (
                      <Badge variant="default" className="bg-green-600">
                        Cumple
                      </Badge>
                    )}
                    {municipio.estado === "parcial" && (
                      <Badge variant="secondary" className="bg-amber-600 text-white">
                        Parcial
                      </Badge>
                    )}
                    {municipio.estado === "no-cumple" && <Badge variant="destructive">No Cumple</Badge>}
                  </div>
                  <CardDescription className="text-sm">{municipio.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/municipios/${municipio.nombre.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/municipios">
              <Button variant="outline" size="lg">
                Ver Todos los Municipios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Últimas Publicaciones */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Últimas Publicaciones</h3>
            <p className="text-lg text-muted-foreground">Informes, análisis y seguimiento de la gestión municipal</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {ultimosInformes.map((informe, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{informe.titulo}</CardTitle>
                      <CardDescription className="text-sm">
                        {informe.fecha} • {informe.categoria}
                      </CardDescription>
                    </div>
                    <Link href="/publicaciones">
                      <Button variant="ghost" size="sm">
                        Leer más
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/publicaciones">
              <Button variant="outline" size="lg">
                Ver Todas las Publicaciones
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Tu voz importa</h3>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Denunciar no es acusar, es pedir explicaciones. Unite a nuestra iniciativa y ayudanos a construir una
              cultura de transparencia en Chaco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/denuncias">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Hacer una Denuncia
                </Button>
              </Link>
              <Link href="/sumate">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Sumate al Proyecto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
