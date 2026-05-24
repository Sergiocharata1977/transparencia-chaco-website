"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Download, MapPin, Share2, User } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicacionBySlug } from "@/lib/firebase/public-site"
import type { Publicacion } from "@/types/site"

export default function PublicacionDetallePage({ params }: { params: { slug: string } }) {
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null)

  useEffect(() => {
    void (async () => {
      setPublicacion(await getPublicacionBySlug(params.slug))
    })()
  }, [params.slug])

  if (!publicacion) {
    return <div className="min-h-screen bg-background"><Navbar /><section className="py-24"><div className="container mx-auto px-4 text-center"><h1 className="text-3xl font-bold mb-4">Publicación no encontrada</h1><Link href="/publicaciones"><Button>Volver a Publicaciones</Button></Link></div></section><Footer /></div>
  }

  const publicacionesRelacionadas = publicacion.relacionadas ?? []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-4 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/publicaciones" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" />Volver a Publicaciones</Link>
          </div>
        </div>
      </section>
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-96 overflow-hidden rounded-lg mt-8">
              <img src={publicacion.imagen || "/placeholder.svg"} alt={publicacion.titulo} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
      <article className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge>{publicacion.categoria}</Badge>
                {publicacion.municipio !== "Varios" && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{publicacion.municipio}</span></div>}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">{publicacion.titulo}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{publicacion.fecha}</span></div>
                <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{publicacion.autor}</span></div>
              </div>
              <div className="flex flex-wrap gap-3 pb-6 border-b">
                <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" />Compartir</Button>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Descargar PDF</Button>
              </div>
            </div>

            <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: publicacion.contenido }} />

            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-4"><strong>Nota:</strong> Este informe fue elaborado por Transparencia Chaco, una iniciativa ciudadana independiente. La información presentada se basa en fuentes públicas y verificables.</p>
                <div className="flex gap-3">
                  <Link href="/sumate"><Button variant="outline" size="sm">Colaborar con nosotros</Button></Link>
                  <Link href="/denuncias"><Button variant="outline" size="sm">Hacer una denuncia</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </article>
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Publicaciones Relacionadas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {publicacionesRelacionadas.map((pub) => (
                <Card key={pub.slug} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">{pub.categoria}</Badge>
                    <h3 className="font-semibold mb-4">{pub.titulo}</h3>
                    <Link href={`/publicaciones/${pub.slug}`}><Button variant="ghost" size="sm" className="p-0 h-auto">Leer artículo →</Button></Link>
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
