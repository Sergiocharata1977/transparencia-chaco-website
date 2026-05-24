import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, Scale, FileText } from "lucide-react"

export default function MarcoLegalPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Marco Legal</h1>
            <p className="text-lg text-primary-foreground/90">
              Conocé tus derechos y las obligaciones de transparencia de los gobiernos municipales
            </p>
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Derecho de Acceso a la Información</h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center mb-12">
              El acceso a la información pública es un derecho fundamental reconocido por la Constitución Nacional y
              diversas leyes provinciales. Los ciudadanos tienen derecho a saber cómo se administran los recursos
              públicos.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Constitución Nacional</CardTitle>
                  <CardDescription>Artículo 43 - Derecho de acceso a documentos públicos</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ley Orgánica de Municipios</CardTitle>
                  <CardDescription>Artículo 67 - Obligaciones de rendición de cuentas</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Ordenanzas Municipales</CardTitle>
                  <CardDescription>Normativas locales sobre transparencia</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Artículo 67 */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Artículo 67 - Ley Orgánica de Municipios
            </h2>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Obligaciones de Rendición de Cuentas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  El Artículo 67 de la Ley Orgánica de Municipios de la Provincia del Chaco establece que los
                  intendentes municipales deben presentar anualmente ante el Concejo Deliberante un informe detallado
                  sobre:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>La situación administrativa del municipio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>El estado financiero y patrimonial</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>La ejecución del presupuesto</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>Las obras y servicios realizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>Los planes y proyectos para el siguiente período</span>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Esta información debe ser pública y accesible para todos los ciudadanos, no solo para los concejales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Preguntas Frecuentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué es la rendición de cuentas?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    La rendición de cuentas es la obligación que tienen los funcionarios públicos de informar a la
                    ciudadanía sobre cómo administran los recursos públicos y las decisiones que toman en su gestión. Es
                    un mecanismo fundamental de control democrático que permite a los ciudadanos evaluar el desempeño de
                    sus autoridades.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Qué información debe publicar un municipio?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed mb-2">Los municipios deben publicar:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• Presupuesto anual y su ejecución</li>
                    <li>• Ordenanzas y decretos</li>
                    <li>• Contratos y licitaciones</li>
                    <li>• Nómina de personal y salarios</li>
                    <li>• Obras públicas y su estado</li>
                    <li>• Estados contables y financieros</li>
                    <li>• Actas del Concejo Deliberante</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Cómo puedo solicitar información pública?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Podés solicitar información pública presentando una nota formal en la Mesa de Entradas del
                    municipio, especificando qué información necesitás. No es necesario justificar el motivo de tu
                    pedido. El municipio tiene un plazo legal para responder. Si no obtenés respuesta o te la niegan sin
                    justificación válida, podés hacer un reclamo o recurrir a instancias judiciales.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Qué hago si mi municipio no cumple con la transparencia?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Si tu municipio no cumple con las obligaciones de transparencia, podés: 1) Hacer un pedido formal de
                    información pública, 2) Documentar el incumplimiento, 3) Denunciar el caso en nuestra plataforma, 4)
                    Presentar una denuncia ante organismos de control provincial, 5) Recurrir a medios de comunicación
                    locales para visibilizar el problema. Nosotros te ayudamos a documentar y darle seguimiento a tu
                    denuncia.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>¿Es legal que me nieguen información pública?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Solo en casos muy específicos pueden negarte información, como cuando se trata de datos personales
                    protegidos, secretos de estado debidamente clasificados, o información que pueda afectar
                    investigaciones judiciales en curso. Pero estas excepciones son limitadas y deben estar debidamente
                    justificadas. La información sobre gestión pública, uso de recursos y decisiones de gobierno DEBE
                    ser pública.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Recursos para Ciudadanos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Guía de Solicitud de Información</CardTitle>
                  <CardDescription>
                    Descargá una plantilla modelo para solicitar información pública a tu municipio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Descargar PDF →
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Normativa Completa</CardTitle>
                  <CardDescription>Accedé al texto completo de la Ley Orgánica de Municipios</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Ver normativa →
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual del Ciudadano</CardTitle>
                  <CardDescription>Guía práctica sobre tus derechos y cómo ejercerlos</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Descargar manual →
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Casos de Éxito</CardTitle>
                  <CardDescription>Conocé casos donde la ciudadanía logró mayor transparencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="#" className="text-primary hover:underline text-sm">
                    Ver casos →
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
