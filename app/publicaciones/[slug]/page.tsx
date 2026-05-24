import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, MapPin, Share2, Download, ArrowLeft } from "lucide-react"

export default function PublicacionDetallePage({ params }: { params: { slug: string } }) {
  // Datos de ejemplo - en producción vendrían de una base de datos
  const publicacion = {
    titulo: "Informe de Rendición de Cuentas - Charata 2024",
    fecha: "15 de Marzo, 2024",
    categoria: "Informe Municipal",
    municipio: "Charata",
    autor: "Equipo Transparencia Chaco",
    imagen: "/city-hall-report.jpg",
    contenido: `
      <h2>Resumen Ejecutivo</h2>
      <p>El presente informe analiza el cumplimiento de las obligaciones de transparencia del municipio de Charata durante el primer trimestre de 2024, con especial énfasis en el cumplimiento del Artículo 67 de la Ley Orgánica de Municipios.</p>
      
      <h2>Hallazgos Principales</h2>
      <p>El municipio de Charata ha demostrado un alto nivel de cumplimiento en la mayoría de los indicadores evaluados:</p>
      
      <h3>1. Presupuesto Municipal</h3>
      <p>El presupuesto 2024 fue publicado en tiempo y forma en el portal municipal, incluyendo:</p>
      <ul>
        <li>Distribución de recursos por área</li>
        <li>Proyecciones de ingresos</li>
        <li>Plan de obras públicas</li>
        <li>Deuda pública y plan de pagos</li>
      </ul>
      
      <h3>2. Ejecución Presupuestaria</h3>
      <p>Los informes trimestrales de ejecución presupuestaria están actualizados y son accesibles. La información incluye comparativos con el mismo período del año anterior y explicaciones sobre desvíos significativos.</p>
      
      <h3>3. Nómina de Personal</h3>
      <p>La lista de empleados municipales se encuentra actualizada al mes de febrero 2024, incluyendo cargos y remuneraciones brutas como establece la normativa.</p>
      
      <h3>4. Licitaciones y Contratos</h3>
      <p>El portal de contrataciones está activo y actualizado, con información detallada sobre:</p>
      <ul>
        <li>Licitaciones en curso</li>
        <li>Contratos adjudicados</li>
        <li>Empresas contratistas</li>
        <li>Montos y plazos de ejecución</li>
      </ul>
      
      <h2>Recomendaciones</h2>
      <p>A pesar del buen desempeño general, se recomienda:</p>
      <ol>
        <li>Implementar un sistema de alertas para notificar automáticamente sobre nuevas publicaciones</li>
        <li>Mejorar la accesibilidad del portal para personas con discapacidad</li>
        <li>Publicar versiones simplificadas de documentos técnicos para facilitar la comprensión ciudadana</li>
      </ol>
      
      <h2>Conclusión</h2>
      <p>Charata se posiciona como un ejemplo de buenas prácticas en transparencia municipal en la región sudoeste del Chaco. El compromiso del gobierno local con la rendición de cuentas es evidente y debe ser mantenido y fortalecido.</p>
    `,
  }

  const publicacionesRelacionadas = [
    {
      titulo: "Análisis del cumplimiento del Art. 67",
      slug: "analisis-art67-sudoeste-chaco",
      categoria: "Marco Legal",
    },
    {
      titulo: "Transparencia en fondos públicos",
      slug: "transparencia-fondos-publicos",
      categoria: "Investigación",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <section className="py-4 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/publicaciones"
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Publicaciones
            </Link>
          </div>
        </div>
      </section>

      {/* Imagen destacada */}
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-96 overflow-hidden rounded-lg mt-8">
              <img
                src={publicacion.imagen || "/placeholder.svg"}
                alt={publicacion.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido del artículo */}
      <article className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge>{publicacion.categoria}</Badge>
                {publicacion.municipio !== "Varios" && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{publicacion.municipio}</span>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{publicacion.titulo}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{publicacion.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{publicacion.autor}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-3 pb-6 border-b">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>

            {/* Contenido */}
            <div
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: publicacion.contenido }}
            />

            {/* Footer del artículo */}
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Nota:</strong> Este informe fue elaborado por Transparencia Chaco, una iniciativa ciudadana
                  independiente. La información presentada se basa en fuentes públicas y verificables. Si encontrás
                  algún error o tenés información adicional, por favor contactanos.
                </p>
                <div className="flex gap-3">
                  <Link href="/sumate">
                    <Button variant="outline" size="sm">
                      Colaborar con nosotros
                    </Button>
                  </Link>
                  <Link href="/denuncias">
                    <Button variant="outline" size="sm">
                      Hacer una denuncia
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>

      {/* Publicaciones relacionadas */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Publicaciones Relacionadas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {publicacionesRelacionadas.map((pub) => (
                <Card key={pub.slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {pub.categoria}
                    </Badge>
                    <h3 className="font-semibold mb-4">{pub.titulo}</h3>
                    <Link href={`/publicaciones/${pub.slug}`}>
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Leer artículo →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
