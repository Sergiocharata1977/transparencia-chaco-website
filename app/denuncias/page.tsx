"use client"

import type React from "react"
import { useState } from "react"
import { AlertCircle, CheckCircle, Shield } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { submitDenuncia } from "@/lib/firebase/public-site"

export default function DenunciasPage() {
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      await submitDenuncia({
        tipo: String(formData.get("tipo") ?? ""),
        municipio: String(formData.get("municipio") ?? ""),
        descripcion: String(formData.get("descripcion") ?? ""),
        anonimo: formData.get("anonimo") === "on",
        nombre: String(formData.get("nombre") ?? ""),
        email: String(formData.get("email") ?? ""),
        telefono: String(formData.get("telefono") ?? ""),
      })
      form.reset()
      setEnviado(true)
      setTimeout(() => setEnviado(false), 5000)
    } catch {
      setError("No pudimos enviar la denuncia en este momento. Probá nuevamente en unos minutos.")
    }
  }

  const tiposDenuncia = [
    "Falta de publicación de presupuesto",
    "No publicación de ejecución presupuestaria",
    "Ausencia de nómina de personal",
    "Falta de información sobre licitaciones",
    "No publicación de ordenanzas",
    "Negativa a entregar información pública",
    "Información desactualizada",
    "Otro",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Denuncias Ciudadanas</h1>
            <p className="text-lg text-primary-foreground/90">Denunciar no es acusar, es pedir explicaciones. Tu voz es importante para construir transparencia.</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <CardTitle className="mb-2">Información importante sobre las denuncias</CardTitle>
                    <CardContent className="p-0">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>Todas las denuncias son revisadas por nuestro equipo antes de ser publicadas.</li>
                        <li>Podés hacer denuncias de manera anónima si lo preferís.</li>
                        <li>No publicamos datos personales sin tu consentimiento explícito.</li>
                      </ul>
                    </CardContent>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {enviado ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4"><CheckCircle className="h-16 w-16 text-green-600" /></div>
                  <CardTitle className="text-2xl text-green-900">Denuncia recibida</CardTitle>
                  <CardDescription className="text-green-700 text-base">Tu denuncia fue recibida correctamente. Nuestro equipo la revisará en los próximos días.</CardDescription>
                  <div className="pt-4"><Button onClick={() => setEnviado(false)} variant="outline">Hacer otra denuncia</Button></div>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-2xl">Formulario de Denuncia</CardTitle><CardDescription>Completá este formulario para denunciar incumplimientos en la rendición de cuentas municipal</CardDescription></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de denuncia *</Label>
                      <Select name="tipo" required>
                        <SelectTrigger id="tipo"><SelectValue placeholder="Seleccioná el tipo de incumplimiento" /></SelectTrigger>
                        <SelectContent>{tiposDenuncia.map((tipo) => <SelectItem key={tipo} value={tipo.toLowerCase().replace(/\s+/g, "-")}>{tipo}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipio">Municipio *</Label>
                      <Select name="municipio" required>
                        <SelectTrigger id="municipio"><SelectValue placeholder="Seleccioná el municipio" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="charata">Charata</SelectItem>
                          <SelectItem value="presidencia-roque-saenz-pena">Presidencia Roque Sáenz Peña</SelectItem>
                          <SelectItem value="general-pinedo">General Pinedo</SelectItem>
                          <SelectItem value="villa-angela">Villa Ángela</SelectItem>
                          <SelectItem value="las-brenas">Las Breñas</SelectItem>
                          <SelectItem value="quitilipi">Quitilipi</SelectItem>
                          <SelectItem value="otro">Otro municipio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción del incumplimiento *</Label>
                      <Textarea id="descripcion" name="descripcion" placeholder="Describí en detalle qué incumplimiento observaste." rows={6} required />
                    </div>
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="anonimo" name="anonimo" />
                        <label htmlFor="anonimo" className="text-sm leading-relaxed cursor-pointer">Quiero hacer esta denuncia de manera anónima.</label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Datos de contacto (opcional)</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="nombre">Nombre completo</Label><Input id="nombre" name="nombre" placeholder="Tu nombre" /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" placeholder="tu@email.com" /></div>
                      </div>
                      <div className="space-y-2"><Label htmlFor="telefono">Teléfono</Label><Input id="telefono" name="telefono" type="tel" placeholder="Tu número de teléfono" /></div>
                    </div>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    <Button type="submit" size="lg" className="w-full">Enviar Denuncia</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>¿Preferís contactarnos de otra manera?</CardTitle>
                <CardDescription className="text-base">También podés escribirnos por otros medios.</CardDescription>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <p><strong>Email:</strong> <a href="mailto:denuncias@transparenciachaco.org" className="text-primary hover:underline">denuncias@transparenciachaco.org</a></p>
                    <p><strong>WhatsApp:</strong> <a href="https://wa.me/5493644000000" className="text-primary hover:underline">+54 9 364 4000000</a></p>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
