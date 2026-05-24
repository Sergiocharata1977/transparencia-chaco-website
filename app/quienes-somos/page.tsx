import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Users, Lightbulb } from "lucide-react"

export default function QuienesSomosPage() {
  const principios = [
    {
      icon: Eye,
      titulo: "Transparencia",
      descripcion:
        "Creemos que toda información pública debe ser accesible, clara y comprensible para todos los ciudadanos.",
    },
    {
      icon: Shield,
      titulo: "Acceso a la información pública",
      descripcion:
        "Defendemos el derecho constitucional de acceder a información sobre la gestión de los recursos públicos.",
    },
    {
      icon: Users,
      titulo: "Participación ciudadana",
      descripcion:
        "Promovemos la participación activa de la ciudadanía en el control y seguimiento de la gestión municipal.",
    },
    {
      icon: Lightbulb,
      titulo: "Independencia política",
      descripcion: "No respondemos a ningún partido político ni gobierno. Nuestra única lealtad es con la ciudadanía.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">¿Quiénes Somos?</h1>
            <p className="text-lg text-primary-foreground/90">
              Una iniciativa ciudadana comprometida con la transparencia y la rendición de cuentas en el sudoeste
              chaqueño
            </p>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Nuestra Historia</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Transparencia Chaco nació en 2024 como respuesta a la creciente necesidad de que los gobiernos
                municipales del sudoeste chaqueño rindan cuentas de manera efectiva a sus ciudadanos. Observando que
                muchos municipios no cumplían con las obligaciones establecidas en la Ley Orgánica de Municipios, un
                grupo de vecinos decidió organizarse.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Lo que comenzó como un esfuerzo informal de documentación se convirtió en una plataforma estructurada
                que monitorea, documenta y visibiliza el cumplimiento (o incumplimiento) de las obligaciones de
                transparencia municipal, con especial énfasis en el Artículo 67 de la Ley Orgánica de Municipios.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Hoy somos una red de ciudadanos, periodistas, organizaciones sociales y estudiantes que trabajamos
                juntos para construir una cultura de transparencia en Chaco. Nuestro objetivo es simple: que la
                información pública esté al alcance de todos y que los gobiernos locales respondan ante sus ciudadanos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principios */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Nuestros Principios</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {principios.map((principio) => {
                const Icon = principio.icon
                return (
                  <Card key={principio.titulo}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="mb-2">{principio.titulo}</CardTitle>
                          <CardContent className="p-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">{principio.descripcion}</p>
                          </CardContent>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Aclaración importante */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Independencia Política</CardTitle>
                <CardContent className="p-0 pt-4">
                  <p className="text-center text-lg leading-relaxed">
                    <strong>No somos un partido político ni respondemos a ningún gobierno.</strong> Transparencia Chaco
                    es una iniciativa ciudadana independiente que no está afiliada a ninguna organización política.
                    Nuestro único compromiso es con la ciudadanía y la transparencia en la gestión pública.
                  </p>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Nuestra Metodología</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Nuestro trabajo se basa en la documentación rigurosa y el análisis objetivo de información pública. No
                hacemos acusaciones sin fundamento, sino que presentamos datos verificables y contrastables.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>
                    Monitoreamos periódicamente el cumplimiento de las obligaciones de transparencia en cada municipio
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Solicitamos información pública mediante los canales oficiales establecidos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Documentamos y publicamos nuestros hallazgos de manera clara y accesible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Facilitamos que los ciudadanos puedan hacer sus propias denuncias y consultas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>Trabajamos con base en hechos y documentos, no en opiniones personales</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
