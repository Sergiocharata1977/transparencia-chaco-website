import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Megaphone, Code, Camera, FileText, Heart } from "lucide-react"

export default function SumatePage() {
  const formasDeParticipar = [
    {
      icon: Users,
      titulo: "Voluntariado Activo",
      descripcion: "Participá en nuestras actividades de monitoreo y documentación de gestión municipal",
    },
    {
      icon: Megaphone,
      titulo: "Difusión",
      descripcion: "Ayudanos a dar visibilidad compartiendo nuestro contenido en redes sociales",
    },
    {
      icon: FileText,
      titulo: "Investigación",
      descripcion: "Colaborá con investigación periodística y análisis de información pública",
    },
    {
      icon: Camera,
      titulo: "Documentación Visual",
      descripcion: "Aporta fotografías y videos de obras públicas y eventos municipales",
    },
    {
      icon: Code,
      titulo: "Desarrollo Técnico",
      descripcion: "Ayudanos a mejorar nuestra plataforma web y herramientas digitales",
    },
    {
      icon: Heart,
      titulo: "Apoyo Económico",
      descripcion: "Contribuí con recursos para sostener nuestras actividades",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Sumate a Transparencia Chaco</h1>
            <p className="text-lg text-primary-foreground/90">
              La transparencia es una construcción colectiva. Unite a nuestra iniciativa y ayudanos a fortalecer la
              democracia en Chaco
            </p>
          </div>
        </div>
      </section>

      {/* Formas de participar */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">¿Cómo podés participar?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {formasDeParticipar.map((forma) => {
                const Icon = forma.icon
                return (
                  <Card key={forma.titulo} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{forma.titulo}</CardTitle>
                      <CardDescription>{forma.descripcion}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de contacto */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Unite a nosotros</h2>
              <p className="text-lg text-muted-foreground">
                Completá el formulario y nos pondremos en contacto con vos
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulario de Participación</CardTitle>
                <CardDescription>Contanos cómo te gustaría colaborar con Transparencia Chaco</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input id="nombre" placeholder="Tu nombre completo" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="tu@email.com" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" type="tel" placeholder="Tu número de teléfono" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio</Label>
                    <Input id="municipio" placeholder="¿De qué municipio sos?" />
                  </div>

                  <div className="space-y-2">
                    <Label>¿Cómo te gustaría colaborar? *</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="voluntariado" />
                        <label htmlFor="voluntariado" className="text-sm cursor-pointer">
                          Voluntariado activo
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="difusion" />
                        <label htmlFor="difusion" className="text-sm cursor-pointer">
                          Difusión en redes sociales
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="investigacion" />
                        <label htmlFor="investigacion" className="text-sm cursor-pointer">
                          Investigación y análisis
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="documentacion" />
                        <label htmlFor="documentacion" className="text-sm cursor-pointer">
                          Documentación visual
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="desarrollo" />
                        <label htmlFor="desarrollo" className="text-sm cursor-pointer">
                          Desarrollo técnico
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="apoyo" />
                        <label htmlFor="apoyo" className="text-sm cursor-pointer">
                          Apoyo económico
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensaje">Mensaje</Label>
                    <Textarea id="mensaje" placeholder="Contanos más sobre tu interés en participar..." rows={5} />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="privacidad" required />
                    <label
                      htmlFor="privacidad"
                      className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                    >
                      Acepto que mis datos sean utilizados para contactarme en relación con mi interés de participar en
                      Transparencia Chaco *
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Enviar Formulario
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Redes sociales */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Seguinos en Redes Sociales</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Mantenete informado sobre nuestras actividades y últimas novedades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Twitter / X
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
