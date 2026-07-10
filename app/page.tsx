"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  FileText,
  MapPin,
  Route,
  Scale,
  ShieldAlert,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getPublicaciones } from "@/lib/firebase/public-site"
import type { Publicacion } from "@/types/site"

const informacionDisponible = [
  {
    title: "Presupuesto municipal",
    description: "Ingresos, gastos, ejecucion y documentos que ayudan a entender como se administran los recursos.",
    status: "Informacion solicitada",
  },
  {
    title: "Obras publicas",
    description: "Obras anunciadas, iniciadas y finalizadas, con ubicacion, montos, plazos y estado de avance.",
    status: "Disponible",
  },
  {
    title: "Concejo Municipal",
    description: "Ordenanzas, sesiones, proyectos y decisiones institucionales vinculadas con Charata.",
    status: "En construccion",
  },
  {
    title: "Compras y contrataciones",
    description: "Proveedores, licitaciones, adquisiciones y contrataciones realizadas con fondos publicos.",
    status: "Informacion solicitada",
  },
  {
    title: "Autoridades y estructura",
    description: "Areas municipales, responsables, funciones, organigrama y canales institucionales.",
    status: "En construccion",
  },
  {
    title: "Pedidos de informacion",
    description: "Solicitudes presentadas, respuestas recibidas, plazos y temas pendientes de actualizacion.",
    status: "Disponible",
  },
]

const seguimientosCharata = [
  { title: "Estado de obras publicas", status: "Publicado", href: "/obras-publicas" },
  { title: "Calles y pavimento", status: "Relevamiento iniciado", href: "/calles-pavimento" },
  { title: "Pedidos de informacion publica", status: "Seguimiento activo", href: "/pedidos-informacion" },
  { title: "Publicacion de ordenanzas", status: "Informacion solicitada", href: "/marco-legal" },
]

const metodologia = [
  {
    title: "Fuentes identificadas",
    description: "Cada publicacion debe indicar de donde surge la informacion y que documento la respalda.",
  },
  {
    title: "Documentos disponibles",
    description: "Siempre que sea posible, acercamos el documento original para que pueda ser consultado.",
  },
  {
    title: "Correcciones abiertas",
    description: "Los vecinos pueden informar errores o aportar nueva documentacion para revisar datos publicados.",
  },
  {
    title: "Criterio institucional",
    description: "El analisis se aplica con el mismo estandar ante autoridades, areas y decisiones municipales.",
  },
]

const observatorioHighlights = [
  {
    href: "/obras-publicas",
    title: "Obras publicas",
    description: "Seguimiento ciudadano de obras de Charata, montos, estados y responsables.",
    icon: Building2,
  },
  {
    href: "/calles-pavimento",
    title: "Calles y pavimento",
    description: "Registro calle por calle del avance de asfalto y tramos en obra.",
    icon: Route,
  },
  {
    href: "/pedidos-informacion",
    title: "Pedidos de informacion",
    description: "Solicitudes, respuestas y plazos vinculados con informacion publica municipal.",
    icon: FileText,
  },
  {
    href: "/mapa-ciudadano",
    title: "Mapa ciudadano",
    description: "Obras, reportes y datos ubicados territorialmente para leer mejor la ciudad.",
    icon: MapPin,
  },
  {
    href: "/cargar-reporte",
    title: "Aportes ciudadanos",
    description: "Canal simple para compartir informacion, documentos y temas de interes publico.",
    icon: ShieldAlert,
  },
]

export default function HomePage() {
  const [ultimosInformes, setUltimosInformes] = useState<Publicacion[]>([])

  useEffect(() => {
    void (async () => {
      const publicacionesData = await getPublicaciones()
      setUltimosInformes(publicacionesData.slice(0, 3))
    })()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-[#005763] text-white">
        <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-12 px-4 py-14 md:grid-cols-[1.02fr_0.98fr] md:py-16">
          <div className="max-w-2xl">
            <Badge className="mb-6 rounded-md border-white/20 bg-white/10 text-white hover:bg-white/10">
              Control ciudadano en Charata
            </Badge>
            <h1 className="text-balance text-4xl font-black leading-[0.98] md:text-6xl">
              La transparencia es una obligacion publica
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-cyan-50/85 md:text-lg">
              Transparencia Chaco es una iniciativa ciudadana independiente que reune, ordena y publica informacion
              sobre la gestion municipal de Charata. Buscamos facilitar el acceso a datos publicos, promover la
              rendicion de cuentas y fortalecer la participacion de los vecinos.
            </p>
            <p className="mt-4 max-w-xl text-sm font-semibold text-cyan-100">
              Informacion basada en documentos, fuentes identificadas y participacion ciudadana.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/municipios/charata/observatorio">
                <Button size="lg" className="w-full bg-cyan-100 text-[#043f49] hover:bg-white sm:w-auto">
                  Ver informacion de Charata
                </Button>
              </Link>
              <Link href="/pedidos-informacion">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/70 bg-transparent text-white hover:bg-white hover:text-[#043f49] sm:w-auto"
                >
                  Realizar un pedido
                </Button>
              </Link>
            </div>
            <Link
              href="/quienes-somos"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-50 underline-offset-4 hover:underline"
            >
              Conoce como trabajamos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center">
            <Image
              src="/foto-principal.png"
              width={428}
              height={583}
              alt="Mano sosteniendo un vidrio transparente"
              priority
              className="relative z-10 h-auto w-[74%] max-w-[360px] drop-shadow-[0_28px_70px_rgba(0,0,0,0.28)]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative flex items-center justify-center">
              <Image
                src="/libro-ley.jpg"
                width={560}
                height={720}
                alt="Texto legal sobre rendicion de cuentas municipal"
                className="w-full max-w-md rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.20)] ring-1 ring-slate-200"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">
                  Derecho a la informacion
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">
                  Tenes derecho a saber como se administra Charata
                </h2>
              </div>

              <p className="leading-9 text-slate-600">
                La informacion municipal es publica. Los vecinos tienen derecho a conocer como se utiliza el
                presupuesto, que obras se realizan, que decisiones adopta el Concejo Municipal y como actuan las
                autoridades.
              </p>

              <p className="leading-9 text-slate-600">
                La Ley Organica Municipal del Chaco establece obligaciones de publicacion y rendicion de cuentas. En
                esta primera etapa ordenamos esa informacion para que sea mas clara, accesible y util para Charata.
              </p>

              <div className="mt-2 rounded-lg border-l-4 border-[#08707b] bg-[#eef7f8] p-6">
                <p className="text-2xl font-black text-[#024852] md:text-3xl">
                  La informacion publica debe estar disponible, completa, actualizada y facil de encontrar.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  El acceso ciudadano se fortalece con documentos, datos abiertos, respuestas formales y canales claros.
                </p>
              </div>

              <Link href="/marco-legal">
                <Button className="w-fit bg-[#08707b] hover:bg-[#024852]">Conocer el marco legal</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f8] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">
              Informacion municipal
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Que podes consultar</h2>
            <p className="mt-4 text-muted-foreground">
              Organizamos la informacion publica de Charata para que cualquier vecino pueda comprenderla, consultarla y
              utilizarla.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {informacionDisponible.map((item) => (
              <Card key={item.title} className="h-full border-cyan-900/10 bg-white shadow-sm">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-4 border-[#08707b]/25 bg-[#eef7f8] text-[#005763]">
                    {item.status}
                  </Badge>
                  <h3 className="text-lg font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Seguimientos</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Temas que estamos siguiendo en Charata</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Consultas, documentacion disponible y estado de cada tema de interes publico local.
              </p>
            </div>
            <Link href="/publicaciones">
              <Button variant="outline" className="border-[#08707b] bg-white text-[#024852] hover:bg-cyan-50">
                Ver publicaciones
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {seguimientosCharata.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="h-full border-cyan-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-6">
                    <Badge className="mb-5 bg-[#dff5f8] text-[#005763] hover:bg-[#dff5f8]">{item.status}</Badge>
                    <h3 className="text-lg font-black">{item.title}</h3>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#024852]">
                      Consultar <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#024852] py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                Como trabajamos
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">
                Informacion verificable, clara y documentada
              </h2>
              <p className="mt-6 leading-9 text-cyan-50/80">
                Publicamos informacion respaldada por documentos oficiales, normas, expedientes, ordenanzas,
                presupuestos, pedidos de acceso a la informacion y respuestas de organismos publicos. Cuando existe un
                analisis, lo diferenciamos de la documentacion original.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {metodologia.map((item) => (
                <Card key={item.title} className="border-white/10 bg-white/10 text-white shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-cyan-50/80">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Estado actual</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Que tan accesible es la informacion municipal
            </h2>
            <p className="mt-4 text-muted-foreground">
              Medimos avances simples: que informacion esta publicada, que pedidos fueron respondidos y que temas
              siguen en seguimiento.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Pedidos presentados", "8"],
              ["Respuestas recibidas", "3"],
              ["En seguimiento", "2"],
              ["Actualizacion pendiente", "3"],
            ].map(([label, value]) => (
              <Card key={label} className="border-cyan-950/10 bg-[#f7fafb] shadow-sm">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-black text-[#08707b]">{value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f8] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Observatorio</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Herramientas para Charata</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Accesos directos a los datos, mapas, pedidos y reportes que organizan el control ciudadano local.
              </p>
            </div>
            <Link href="/cargar-reporte">
              <Button variant="outline" className="border-[#08707b] bg-white text-[#024852] hover:bg-cyan-50">
                Enviar informacion
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {observatorioHighlights.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full border-cyan-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#dff5f8]">
                        <Icon className="h-6 w-6 text-[#08707b]" />
                      </div>
                      <h3 className="font-bold">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight">Ultimas publicaciones</h2>
            <p className="mt-3 text-muted-foreground">Informes, analisis y seguimiento de la gestion municipal.</p>
          </div>

          {ultimosInformes.length > 0 ? (
            <div className="mx-auto mt-10 max-w-5xl space-y-4">
              {ultimosInformes.map((informe) => (
                <Link key={informe.slug} href={`/publicaciones/${informe.slug}`} className="block">
                  <Card className="border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FileText className="h-5 w-5 text-[#024852]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{informe.titulo}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {informe.fecha} - {informe.categoria}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-[#024852]">
                        Leer mas <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-3xl rounded-lg border border-cyan-950/10 bg-[#f7fafb] px-6 py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">Las publicaciones se estan preparando.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                El listado se actualizara cuando se publiquen informes desde el panel.
              </p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/publicaciones">
              <Button className="bg-[#08707b] hover:bg-[#024852]">Explorar publicaciones</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#024852] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-lg border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur md:flex-row md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-[#024852]">
              <Scale className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">El control ciudadano tambien depende de vos</h2>
              <p className="mt-2 text-cyan-50/80">
                Los vecinos conocen la ciudad. Podes informar una obra, compartir documentacion, proponer un tema de
                analisis o pedir ayuda para realizar una solicitud de informacion publica.
              </p>
              <p className="mt-3 text-sm text-cyan-100">
                Antes de publicar aportes ciudadanos, verificamos la informacion y cuidamos los datos personales.
              </p>
            </div>
            <Link href="/sumate">
              <Button className="bg-cyan-100 text-[#024852] hover:bg-white">Participar</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
