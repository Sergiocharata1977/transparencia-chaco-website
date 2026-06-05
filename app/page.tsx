"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Building2,
  ExternalLink,
  FileText,
  MapPin,
  Play,
  Scale,
  Search,
  ShieldAlert,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getMunicipios, getPublicaciones } from "@/lib/firebase/public-site"
import { StatsObservatorio } from "@/components/home/stats-observatorio"
import type { Municipio, Publicacion } from "@/types/site"

const estadoConfig = {
  cumple: {
    label: "Cumple",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent: "border-l-emerald-500",
  },
  parcial: {
    label: "Parcial",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    accent: "border-l-orange-500",
  },
  "no-cumple": {
    label: "No cumple",
    className: "border-red-200 bg-red-50 text-red-700",
    accent: "border-l-red-500",
  },
} as const

const observatorioHighlights = [
  {
    href: "/ranking-transparencia",
    title: "Ranking de transparencia",
    description: "Indice comparativo por municipio, con criterios claros y trazables.",
    icon: BarChart3,
  },
  {
    href: "/obras-publicas",
    title: "Obras publicas",
    description: "Seguimiento ciudadano de obras, montos, estados y responsables.",
    icon: Building2,
  },
  {
    href: "/mapa-ciudadano",
    title: "Mapa ciudadano",
    description: "Reportes y obras ubicados territorialmente para detectar patrones.",
    icon: MapPin,
  },
  {
    href: "/cargar-reporte",
    title: "Reportes ciudadanos",
    description: "Canal simple para documentar problemas y sumar evidencia local.",
    icon: ShieldAlert,
  },
]

export default function HomePage() {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [ultimosInformes, setUltimosInformes] = useState<Publicacion[]>([])

  useEffect(() => {
    void (async () => {
      const [municipiosData, publicacionesData] = await Promise.all([getMunicipios(), getPublicaciones()])
      setMunicipios(municipiosData.slice(0, 3))
      setUltimosInformes(publicacionesData.slice(0, 3))
    })()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-[#024852] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_34%,rgba(81,188,205,0.38),transparent_32%),linear-gradient(135deg,#013d46_0%,#075c66_55%,#03414a_100%)]" />
        <div className="absolute left-0 top-0 -z-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="container mx-auto grid min-h-[590px] items-center gap-12 px-4 py-16 md:grid-cols-[1.02fr_0.98fr] md:py-20">
          <div className="max-w-2xl">
            <Badge className="mb-6 border-white/20 bg-white/10 text-white hover:bg-white/10">
              Iniciativa ciudadana independiente
            </Badge>
            <h1 className="text-balance text-4xl font-black tracking-tight drop-shadow-sm md:text-6xl">
              La transparencia no es un favor, es una obligacion
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-cyan-50/85 md:text-lg">
              Monitoreamos municipios, ordenamos informacion publica y acercamos herramientas para que cada vecino pueda
              pedir explicaciones con datos.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/municipios">
                <Button size="lg" className="w-full bg-cyan-100 text-[#043f49] hover:bg-white sm:w-auto">
                  Ver Municipios
                </Button>
              </Link>
              <Link href="/rendicion">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/70 bg-transparent text-white hover:bg-white hover:text-[#043f49] sm:w-auto"
                >
                  Rendicion de Cuentas
                </Button>
              </Link>
            </div>
            <Link
              href="/denuncias"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              Denunciar incumplimientos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl md:h-96 md:w-96" />
            <div className="absolute right-12 top-12 h-20 w-20 rounded-full border border-cyan-100/25" />
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

      {/* SECTION: La ley obliga */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Imagen del libro — guardar como /public/libro-ley.jpg */}
            <div className="relative flex items-center justify-center">
              <Image
                src="/libro-ley.jpg"
                width={560}
                height={720}
                alt="Ley Orgánica de Municipios — Artículo 67"
                className="w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.20)] ring-1 ring-slate-200"
              />
            </div>

            {/* Texto de la ley con palabras clave destacadas */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">
                  La ley vigente
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">
                  Ley Orgánica de Municipios — Art. 67
                </h2>
              </div>

              <p className="leading-9 text-slate-600">
                El Concejo Municipal deberá publicar en la página{" "}
                <span className="text-[1.55em] font-black leading-none text-[#08707b]">WEB</span>{" "}
                del Municipio el texto íntegro de las ordenanzas, resoluciones y declaraciones que
                dicte. Además deberá publicar, en forma mensual, el estado de los ingresos y gastos
                con cuadro de disponibilidades y un balance sintético de ejecución de presupuesto y
                anualmente una memoria sobre la labor desarrollada y la cuenta anual del ejercicio.
              </p>

              <p className="leading-9 text-slate-600">
                El Secretario del Concejo llevará un Protocolo de Ordenanzas con numeración
                correlativa y un Protocolo de Resoluciones y Declaraciones con numeración
                correlativa anual, debiendo{" "}
                <span className="text-[1.55em] font-black leading-none text-[#08707b]">REMITIR</span>{" "}
                copia certificada de aquellas ordenanzas que adhieran a leyes provinciales y/o que
                modifiquen y/o que deroguen ordenanzas anteriores relacionadas a las citadas
                adhesiones, para su incorporación al Registro de Leyes Provinciales que prevean
                adhesión municipal conforme con la ley 1326-A.
              </p>

              <div className="mt-2 rounded-2xl border-l-4 border-[#08707b] bg-[#eef7f8] p-6">
                <p className="text-2xl font-black text-[#024852] md:text-3xl">
                  Están obligados a{" "}
                  <span className="text-[1.25em] text-[#08707b]">RENDIR</span>{" "}
                  en la{" "}
                  <span className="text-[1.25em] text-[#08707b]">WEB</span>
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ley 2396-A consolidada por Ley 2857-A — Digesto Jurídico Provincia del Chaco
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: El compromiso público */}
      <section className="bg-[#024852] py-16 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Texto del compromiso — a completar */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
                  El compromiso
                </p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-tight md:text-4xl">
                  La palabra empeñada en campaña
                </h2>
              </div>
              <p className="leading-9 text-cyan-50/80">
                {/* Texto del compromiso público del intendente — pendiente de completar */}
                Texto del compromiso público a completar.
              </p>
            </div>

            {/* Video YouTube — estilo browser-chrome */}
            <div className="overflow-hidden rounded-[26px] border border-white/10 bg-slate-950 shadow-[0_48px_90px_-42px_rgba(0,0,0,0.85)]">
              {/* Barra chrome */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <div className="ml-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                    Compromiso público
                  </div>
                </div>
                <div className="rounded-full bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-300">
                  Intendente en campaña
                </div>
              </div>

              {/* iframe + overlays */}
              <div className="relative aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full border-0"
                  src="https://www.youtube.com/embed/xxdbT_z4X_0?rel=0&modestbranding=1"
                  title="Compromiso público del intendente"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Card overlay superior izquierda */}
                <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-slate-900/75 px-4 py-3 text-left backdrop-blur sm:left-6 sm:top-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                    Declaración pública
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                    La palabra empeñada en campaña
                  </p>
                </div>
                {/* Card overlay inferior derecha */}
                <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-2xl border border-white/10 bg-white/95 p-4 text-left shadow-xl sm:block sm:w-[260px]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Play className="h-4 w-4 text-[#08707b]" />
                    Compromiso ante vecinos
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Prometió rendir cuentas. La ley lo obliga. ¿Lo cumple?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Estado actual</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Municipios Monitoreados</h2>
            <p className="mt-4 text-muted-foreground">
              Seguimiento del cumplimiento de rendicion de cuentas en municipios del sudoeste chaqueno.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <StatsObservatorio />
          </div>
        </div>
      </section>

      <section className="bg-[#eef2f4] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Municipios Destacados</h2>
              <p className="mt-3 text-muted-foreground">Detalle de gestion y transparencia por localidad.</p>
            </div>
            <div className="flex h-11 w-full items-center gap-2 rounded-lg border bg-white px-4 text-sm text-muted-foreground shadow-sm md:w-80">
              <Search className="h-4 w-4" />
              Buscar municipio...
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {municipios.map((municipio) => {
              const estado = estadoConfig[municipio.estado]
              return (
                <Card
                  key={municipio.slug}
                  className={`min-h-56 border-l-4 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${estado.accent}`}
                >
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-semibold">{municipio.nombre}</h3>
                      <Badge variant="outline" className={estado.className}>
                        {estado.label}
                      </Badge>
                    </div>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {municipio.descripcion}
                    </p>
                    <Link
                      href={`/municipios/${municipio.slug}`}
                      className="mt-auto inline-flex items-center justify-center gap-2 pt-8 text-sm font-bold text-slate-950 hover:text-[#08707b]"
                    >
                      Ver detalles <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/municipios" className="text-sm font-bold text-[#024852] hover:underline">
              Ver todos los municipios
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight">Ultimas Publicaciones</h2>
            <p className="mt-3 text-muted-foreground">Informes, analisis y seguimiento de la gestion municipal.</p>
          </div>

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

          <div className="mt-10 text-center">
            <Link href="/publicaciones">
              <Button className="bg-[#08707b] hover:bg-[#024852]">Explorar todas las publicaciones</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f8] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Observatorio</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Herramientas para control ciudadano</h2>
            </div>
            <Link href="/cargar-reporte">
              <Button variant="outline" className="border-[#08707b] bg-white text-[#024852] hover:bg-cyan-50">
                Cargar reporte ciudadano
              </Button>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {observatorioHighlights.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full border-cyan-900/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff5f8]">
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

      <section className="bg-[#024852] py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 rounded-[2rem] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur md:flex-row md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-[#024852]">
              <Scale className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">Tu voz tambien audita</h2>
              <p className="mt-2 text-cyan-50/80">
                Denunciar no es acusar: es pedir explicaciones. Sumate para construir una cultura de transparencia en
                Chaco.
              </p>
            </div>
            <Link href="/sumate">
              <Button className="bg-cyan-100 text-[#024852] hover:bg-white">Sumate</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
