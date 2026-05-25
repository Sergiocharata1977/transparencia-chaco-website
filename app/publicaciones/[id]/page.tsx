import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getPublicacionById } from "@/lib/firebase/publicaciones"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const pub = await getPublicacionById(id)
  if (!pub) {
    return { title: "Noticia no encontrada | Transparencia Chaco" }
  }
  return {
    title: `${pub.titulo} | Transparencia Chaco`,
    description: pub.extracto,
  }
}

export default async function PublicacionDetallePage({ params }: Props) {
  const { id } = await params
  const pub = await getPublicacionById(id)

  if (!pub) {
    notFound()
  }

  const fechaDisplay = pub.publishedAt
    ? new Date(pub.publishedAt).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <nav className="border-b bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/publicaciones" className="hover:text-primary">
                  Noticias
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="truncate font-medium text-foreground">{pub.titulo}</li>
            </ol>
          </div>
        </div>
      </nav>

      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Imagen destacada */}
            {pub.imagen && (
              <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={pub.imagen}
                  alt={pub.titulo}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            )}

            {/* Título */}
            <h1 className="mb-6 text-3xl font-bold text-balance md:text-4xl">{pub.titulo}</h1>

            {/* Metadatos */}
            <div className="mb-8 flex flex-wrap items-center gap-3 border-b pb-6 text-sm text-muted-foreground">
              <Badge variant="secondary" className="capitalize">
                {pub.categoria}
              </Badge>
              {pub.municipio && (
                <span className="font-medium text-foreground">{pub.municipio}</span>
              )}
              {pub.autor && <span>Por {pub.autor}</span>}
              {fechaDisplay && <span>{fechaDisplay}</span>}
            </div>

            {/* Contenido */}
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-foreground">
              {pub.contenido}
            </div>

            {/* Botón volver */}
            <div className="mt-12 border-t pt-8">
              <Link href="/publicaciones">
                <Button variant="outline" className="bg-transparent">
                  &larr; Volver a Noticias
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  )
}
