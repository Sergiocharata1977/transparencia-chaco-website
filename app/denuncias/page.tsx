"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, FileUp, Shield, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function DenunciasPage() {
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica de envío del formulario
    setEnviado(true)
    setTimeout(() => setEnviado(false), 5000)
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

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Denuncias Ciudadanas</h1>
            <p className="text-lg text-primary-foreground/90">
              Denunciar no es acusar, es pedir explicaciones. Tu voz es importante para construir transparencia.
            </p>
          </div>
        </div>
      </section>

      {/* Información importante */}
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
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>Todas las denuncias son revisadas por nuestro equipo antes de ser publicadas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>Podés hacer denuncias de manera anónima si lo preferís</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>Las denuncias con documentación son procesadas con mayor prioridad</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>No publicamos datos personales sin tu consentimiento explícito</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>
                            Esta plataforma es para documentar incumplimientos, no sustituye denuncias legales formales
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulario de denuncia */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {enviado ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-900">Denuncia recibida</CardTitle>
                  <CardDescription className="text-green-700 text-base">
                    Tu denuncia ha sido recibida correctamente. Nuestro equipo la revisará en los próximos días. Si
                    dejaste tu email, te contactaremos para informarte sobre el seguimiento.
                  </CardDescription>
                  <div className="pt-4">
                    <Button onClick={() => setEnviado(false)} variant="outline">
                      Hacer otra denuncia
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Formulario de Denuncia</CardTitle>
                  <CardDescription>
                    Completá este formulario para denunciar incumplimientos en la rendición de cuentas municipal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo de denuncia */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de denuncia *</Label>
                      <Select required>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccioná el tipo de incumplimiento" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDenuncia.map((tipo) => (
                            <SelectItem key={tipo} value={tipo.toLowerCase().replace(/\s+/g, "-")}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Municipio */}
                    <div className="space-y-2">
                      <Label htmlFor="municipio">Municipio *</Label>
                      <Select required>
                        <SelectTrigger id="municipio">
                          <SelectValue placeholder="Seleccioná el municipio" />
                        </SelectTrigger>
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

                    {/* Descripción */}
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción del incumplimiento *</Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Describí en detalle qué información no está siendo publicada o qué incumplimiento observaste. Incluí fechas, lugares y cualquier detalle relevante."
                        rows={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Cuanto más detallada sea tu descripción, mejor podremos documentar el caso
                      </p>
                    </div>

                    {/* Adjuntar documentos */}
                    <div className="space-y-2">
                      <Label htmlFor="documentos">Adjuntar pruebas (opcional)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Arrastrá archivos aquí o hacé clic para seleccionar
                        </p>
                        <Input id="documentos" type="file" className="hidden" multiple />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("documentos")?.click()}
                        >
                          Seleccionar archivos
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Formatos aceptados: PDF, JPG, PNG, DOC (máx. 10MB por archivo)
                        </p>
                      </div>
                    </div>

                    {/* Opción de anonimato */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="anonimo" />
                        <label htmlFor="anonimo" className="text-sm leading-relaxed cursor-pointer">
                          Quiero hacer esta denuncia de manera anónima (no dejar mis datos de contacto)
                        </label>
                      </div>
                    </div>

                    {/* Datos de contacto (opcionales si es anónimo) */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Datos de contacto (opcional)</h3>
                      <p className="text-sm text-muted-foreground">
                        Si querés que te contactemos para hacer seguimiento de la denuncia, dejanos tus datos
                      </p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre completo</Label>
                          <Input id="nombre" placeholder="Tu nombre" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="tu@email.com" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" type="tel" placeholder="Tu número de teléfono" />
                      </div>
                    </div>

                    {/* Aceptación de términos */}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="veracidad" required />
                        <label htmlFor="veracidad" className="text-sm leading-relaxed cursor-pointer">
                          Declaro que la información proporcionada es verídica y estoy dispuesto/a a aportar más
                          detalles si es necesario *
                        </label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="privacidad" required />
                        <label htmlFor="privacidad" className="text-sm leading-relaxed cursor-pointer">
                          Acepto que mis datos sean utilizados únicamente para el seguimiento de esta denuncia y que
                          Transparencia Chaco mantenga la confidencialidad de mi identidad si así lo solicito *
                        </label>
                      </div>
                    </div>

                    {/* Botón de envío */}
                    <Button type="submit" size="lg" className="w-full">
                      Enviar Denuncia
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">¿Qué pasa después de hacer una denuncia?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-xl">
                    1
                  </div>
                  <CardTitle>Revisión</CardTitle>
                  <CardDescription>
                    Nuestro equipo revisa la denuncia y verifica la información proporcionada con fuentes oficiales
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-xl">
                    2
                  </div>
                  <CardTitle>Documentación</CardTitle>
                  <CardDescription>
                    Documentamos el caso, solicitamos información adicional al municipio si es necesario, y preparamos
                    un informe
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 font-bold text-xl">
                    3
                  </div>
                  <CardTitle>Publicación</CardTitle>
                  <CardDescription>
                    Si se confirma el incumplimiento, publicamos el caso en nuestra plataforma y lo difundimos en redes
                    sociales
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto alternativo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>¿Preferís contactarnos de otra manera?</CardTitle>
                <CardDescription className="text-base">
                  Si no te sentís cómodo/a usando el formulario web, podés contactarnos por otros medios
                </CardDescription>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:denuncias@transparenciachaco.org" className="text-primary hover:underline">
                        denuncias@transparenciachaco.org
                      </a>
                    </p>
                    <p>
                      <strong>WhatsApp:</strong>{" "}
                      <a href="https://wa.me/5493644000000" className="text-primary hover:underline">
                        +54 9 364 4000000
                      </a>
                    </p>
                    <p>
                      <strong>Facebook:</strong>{" "}
                      <a href="https://facebook.com" className="text-primary hover:underline">
                        @TransparenciaChaco
                      </a>
                    </p>
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
