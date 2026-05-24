"use client"

import { useState } from "react"
import { Camera, Code, FileText, Heart, Megaphone, Users } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitVoluntario } from "@/lib/firebase/public-site"

export default function SumatePage() {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formasDeParticipar = [
    { icon: Users, titulo: "Voluntariado Activo", descripcion: "Participá en nuestras actividades de monitoreo y documentación de gestión municipal." },
    { icon: Megaphone, titulo: "Difusión", descripcion: "Ayudanos a dar visibilidad compartiendo contenido en redes sociales." },
    { icon: FileText, titulo: "Investigación", descripcion: "Colaborá con investigación periodística y análisis de información pública." },
    { icon: Camera, titulo: "Documentación Visual", descripcion: "Aportá fotografías y videos de obras públicas y eventos municipales." },
    { icon: Code, titulo: "Desarrollo Técnico", descripcion: "Ayudanos a mejorar nuestra plataforma web y herramientas digitales." },
    { icon: Heart, titulo: "Apoyo Económico", descripcion: "Contribuí con recursos para sostener nuestras actividades." },
  ]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await submitVoluntario({
        nombre: String(formData.get("nombre") ?? ""),
        email: String(formData.get("email") ?? ""),
        telefono: String(formData.get("telefono") ?? ""),
        municipio: String(formData.get("municipio") ?? ""),
        intereses: formData.getAll("intereses").map((item) => String(item)),
        mensaje: String(formData.get("mensaje") ?? ""),
      })
      form.reset()
      setEnviado(true)
      setTimeout(() => setEnviado(false), 5000)
    } catch {
      setError("No pudimos registrar tu interés en este momento. Intentá nuevamente en unos minutos.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Sumate a Transparencia Chaco</h1>
            <p className="text-lg text-primary-foreground/90">La transparencia es una construcción colectiva. Unite a nuestra iniciativa y ayudanos a fortalecer la democracia en Chaco.</p>
          </div>
        </div>
      </section>

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
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"><Icon className="h-6 w-6 text-primary" /></div>
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

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Unite a nosotros</h2>
              <p className="text-lg text-muted-foreground">Completá el formulario y nos pondremos en contacto con vos.</p>
            </div>
            <Card>
              <CardHeader><CardTitle>Formulario de Participación</CardTitle><CardDescription>Contanos cómo te gustaría colaborar con Transparencia Chaco.</CardDescription></CardHeader>
              <CardContent>
                {enviado ? (
                  <div className="space-y-3 text-center">
                    <h3 className="text-xl font-semibold">Gracias por sumarte</h3>
                    <p className="text-muted-foreground">Registramos tu interés y te vamos a contactar cuando avancemos con el próximo paso.</p>
                    <Button variant="outline" onClick={() => setEnviado(false)}>Enviar otro formulario</Button>
                  </div>
                ) : (
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="nombre">Nombre *</Label><Input id="nombre" name="nombre" placeholder="Tu nombre completo" required /></div>
                      <div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" name="email" type="email" placeholder="tu@email.com" required /></div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" name="telefono" type="tel" placeholder="Tu número de teléfono" /></div>
                    <div className="space-y-2"><Label htmlFor="municipio">Municipio</Label><Input id="municipio" name="municipio" placeholder="¿De qué municipio sos?" /></div>
                    <div className="space-y-2">
                      <Label>¿Cómo te gustaría colaborar? *</Label>
                      <div className="space-y-3">
                        {formasDeParticipar.map((forma, index) => (
                          <div key={forma.titulo} className="flex items-center space-x-2">
                            <Checkbox id={`interes-${index}`} name="intereses" value={forma.titulo} />
                            <Label htmlFor={`interes-${index}`} className="cursor-pointer">{forma.titulo}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="mensaje">Mensaje</Label><Textarea id="mensaje" name="mensaje" placeholder="Contanos más sobre tu interés en participar..." rows={5} /></div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button type="submit" size="lg" className="w-full">Enviar formulario</Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
