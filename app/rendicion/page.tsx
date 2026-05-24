import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  FileText,
  DollarSign,
  Building,
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

export default function RendicionPage() {
  const elementosRendicion = [
    {
      icon: DollarSign,
      titulo: "Presupuesto y Ejecución",
      descripcion:
        "Presupuesto anual aprobado y su ejecución trimestral, incluyendo ingresos y gastos por partida presupuestaria.",
    },
    {
      icon: Building,
      titulo: "Obras Públicas",
      descripcion:
        "Estado de obras públicas planificadas y en ejecución, con sus montos, plazos y empresas contratistas.",
    },
    {
      icon: Users,
      titulo: "Nómina de Personal",
      descripcion: "Lista completa de empleados municipales con sus cargos y remuneraciones brutas.",
    },
    {
      icon: ClipboardList,
      titulo: "Licitaciones y Contratos",
      descripcion: "Procesos de contratación, licitaciones públicas y contratos firmados con proveedores.",
    },
    {
      icon: FileText,
      titulo: "Ordenanzas y Decretos",
      descripcion:
        "Normativa municipal aprobada, incluyendo ordenanzas del Concejo Deliberante y decretos del Ejecutivo.",
    },
    {
      icon: TrendingUp,
      titulo: "Deuda Pública",
      descripcion: "Estado de la deuda municipal, préstamos contraídos y plan de pagos.",
    },
  ]

  const casosMunicipales = [
    {
      municipio: "Charata",
      cumplimiento: "cumple",
      items: [
        { aspecto: "Presupuesto publicado", estado: "cumple" },
        { aspecto: "Ejecución presupuestaria trimestral", estado: "cumple" },
        { aspecto: "Nómina de personal actualizada", estado: "cumple" },
        { aspecto: "Portal de licitaciones activo", estado: "cumple" },
        { aspecto: "Actas del Concejo publicadas", estado: "cumple" },
      ],
    },
    {
      municipio: "Presidencia Roque Sáenz Peña",
      cumplimiento: "parcial",
      items: [
        { aspecto: "Presupuesto publicado", estado: "cumple" },
        { aspecto: "Ejecución presupuestaria trimestral", estado: "parcial" },
        { aspecto: "Nómina de personal actualizada", estado: "no-cumple" },
        { aspecto: "Portal de licitaciones activo", estado: "cumple" },
        { aspecto: "Actas del Concejo publicadas", estado: "parcial" },
      ],
    },
    {
      municipio: "General Pinedo",
      cumplimiento: "no-cumple",
      items: [
        { aspecto: "Presupuesto publicado", estado: "parcial" },
        { aspecto: "Ejecución presupuestaria trimestral", estado: "no-cumple" },
        { aspecto: "Nómina de personal actualizada", estado: "no-cumple" },
        { aspecto: "Portal de licitaciones activo", estado: "no-cumple" },
        { aspecto: "Actas del Concejo publicadas", estado: "no-cumple" },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Rendición de Cuentas</h1>
            <p className="text-lg text-primary-foreground/90">
              Información clara sobre qué deben publicar los municipios y cómo cumplir con la transparencia
            </p>
          </div>
        </div>
      </section>

      {/* ¿Qué es rendir cuentas? */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">¿Qué es rendir cuentas?</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                Rendir cuentas es la obligación que tienen los funcionarios públicos de informar a la ciudadanía sobre
                cómo administran los recursos públicos, qué decisiones toman y qué resultados obtienen en su gestión. No
                se trata de un favor o una concesión, sino de un deber legal establecido en la Ley Orgánica de
                Municipios.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                La rendición de cuentas es fundamental para la democracia porque permite que los ciudadanos ejerzan
                control sobre sus autoridades, evalúen su desempeño y tomen decisiones informadas en las elecciones. Sin
                transparencia, no hay democracia real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Elementos de la rendición */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              ¿Qué información debe publicar un municipio?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elementosRendicion.map((elemento) => {
                const Icon = elemento.icon
                return (
                  <Card key={elemento.titulo}>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{elemento.titulo}</CardTitle>
                      <CardDescription className="leading-relaxed">{elemento.descripcion}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Casos documentados */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Casos Documentados</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Estado de cumplimiento de las obligaciones de transparencia en municipios del sudoeste chaqueño
            </p>

            <div className="space-y-6">
              {casosMunicipales.map((caso) => (
                <Card key={caso.municipio}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl">{caso.municipio}</CardTitle>
                      {caso.cumplimiento === "cumple" && (
                        <Badge variant="default" className="bg-green-600">
                          Cumple
                        </Badge>
                      )}
                      {caso.cumplimiento === "parcial" && (
                        <Badge variant="secondary" className="bg-amber-600 text-white">
                          Parcial
                        </Badge>
                      )}
                      {caso.cumplimiento === "no-cumple" && <Badge variant="destructive">No Cumple</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {caso.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-medium">{item.aspecto}</span>
                          <div className="flex items-center gap-2">
                            {item.estado === "cumple" && (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-green-600">Cumple</span>
                              </>
                            )}
                            {item.estado === "parcial" && (
                              <>
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <span className="text-sm text-amber-600">Parcial</span>
                              </>
                            )}
                            {item.estado === "no-cumple" && (
                              <>
                                <XCircle className="h-5 w-5 text-destructive" />
                                <span className="text-sm text-destructive">No cumple</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link href={`/municipios/${caso.municipio.toLowerCase().replace(/\s+/g, "-")}`}>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Ver detalles completos
                        </Button>
                      </Link>
                    </div>
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
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Preguntas Frecuentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Con qué frecuencia deben rendir cuentas los municipios?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Los municipios deben presentar un informe anual completo ante el Concejo Deliberante, según lo
                    establece el Artículo 67 de la Ley Orgánica de Municipios. Además, deben publicar información
                    trimestral sobre la ejecución presupuestaria y mantener actualizada la información sobre
                    licitaciones, contratos y ordenanzas de manera permanente.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>¿Dónde debería estar publicada esta información?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    La información debe estar disponible en el sitio web oficial del municipio, en la sede municipal
                    (mesa de entradas) y en el Concejo Deliberante. Lo ideal es que exista un portal de transparencia
                    digital donde todos los ciudadanos puedan acceder fácilmente a la información sin necesidad de hacer
                    pedidos formales.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>¿Qué pasa si un municipio no rinde cuentas?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    El incumplimiento de las obligaciones de rendición de cuentas puede derivar en responsabilidades
                    administrativas para los funcionarios. Los ciudadanos pueden presentar denuncias ante organismos de
                    control provincial, solicitar intervención del Concejo Deliberante o recurrir a la justicia. También
                    pueden utilizar esta plataforma para documentar y visibilizar el incumplimiento.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>¿Cómo puedo verificar si la información es correcta?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    Podés solicitar información adicional mediante pedidos de acceso a la información pública,
                    contrastar los datos con otras fuentes oficiales (como el Tribunal de Cuentas provincial), consultar
                    con organizaciones de la sociedad civil especializadas en control ciudadano, o contactarnos para que
                    te ayudemos a analizar la información disponible.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">¿Tu municipio no rinde cuentas?</h3>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Documentá el incumplimiento y ayudanos a presionar por mayor transparencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/denuncias">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Hacer una Denuncia
                </Button>
              </Link>
              <Link href="/marco-legal">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Conocer el Marco Legal
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
