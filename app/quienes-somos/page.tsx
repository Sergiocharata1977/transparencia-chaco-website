import Link from "next/link"
import { BookOpen, Eye, FileText, Handshake, Scale, Shield, Users } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const principios = [
  {
    icon: Eye,
    titulo: "Claridad publica",
    descripcion: "Ordenamos informacion dispersa para que cualquier vecino pueda entenderla sin tecnicismos.",
  },
  {
    icon: Shield,
    titulo: "Independencia",
    descripcion: "Trabajamos con criterio ciudadano, fuentes identificadas y autonomia institucional.",
  },
  {
    icon: FileText,
    titulo: "Informacion verificable",
    descripcion: "Trabajamos con pedidos, expedientes, publicaciones oficiales, fotos, actas y evidencia verificable.",
  },
  {
    icon: Users,
    titulo: "Control ciudadano",
    descripcion: "La transparencia se fortalece con vecinos atentos, datos claros y participacion sostenida.",
  },
]

const hitos = [
  {
    titulo: "El punto de partida",
    texto:
      "La iniciativa nace cuando vecinos de Charata empiezan a revisar compromisos publicos de transparencia y a ordenar informacion municipal de interes ciudadano.",
  },
  {
    titulo: "De reclamo aislado a observatorio",
    texto:
      "La participacion vecinal se transformo en una plataforma para ordenar obras, pedidos de informacion, reportes y compromisos asumidos en Charata.",
  },
  {
    titulo: "Una herramienta para Charata",
    texto:
      "El objetivo es que los vecinos de Charata puedan mirar la gestion municipal con datos, formular preguntas y dejar registro publico de compromisos y avances.",
  },
]

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />

      <section className="bg-[#005763] py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Nosotros</p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight md:text-6xl">
              Una historia ciudadana para fortalecer la rendicion de cuentas
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-cyan-50/85">
              Transparencia Chaco es una iniciativa independiente que documenta, ordena y publica informacion
              municipal para que el control ciudadano sea posible, concreto y sostenido.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Origen</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Por que existimos</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Porque la rendicion de cuentas mejora cuando la informacion publica esta ordenada, disponible y puede ser
              consultada por cualquier vecino.
            </p>
            <p className="mt-4 leading-8 text-slate-600">
              Esta plataforma centraliza informacion de Charata: compromisos firmados, datos publicos, obras, pedidos
              de informacion y canales para que los vecinos participen con evidencia.
            </p>
          </div>

          <div className="space-y-4">
            {hitos.map((hito, index) => (
              <Card key={hito.titulo} className="border-cyan-950/10 bg-[#f7fafb] shadow-sm">
                <CardContent className="grid gap-4 p-6 sm:grid-cols-[48px_1fr]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#dff5f8] text-lg font-black text-[#005763]">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-950">{hito.titulo}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{hito.texto}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef7f8] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#08707b]">Principios</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Como trabajamos</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {principios.map((principio) => {
              const Icon = principio.icon
              return (
                <Card key={principio.titulo} className="h-full border-cyan-950/10 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#dff5f8]">
                      <Icon className="h-6 w-6 text-[#08707b]" />
                    </div>
                    <h3 className="font-black">{principio.titulo}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{principio.descripcion}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          <Card className="border-cyan-950/10 bg-white shadow-sm">
            <CardContent className="p-6">
              <Scale className="mb-5 h-9 w-9 text-[#08707b]" />
              <h3 className="text-xl font-black">Base legal</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                El eje del proyecto es que la informacion municipal de Charata sea clara: ordenanzas, ingresos, gastos,
                presupuesto y memoria de gestion.
              </p>
              <Link href="/marco-legal" className="mt-5 inline-block text-sm font-bold text-[#005763] hover:underline">
                Ver marco legal
              </Link>
            </CardContent>
          </Card>

          <Card className="border-cyan-950/10 bg-white shadow-sm">
            <CardContent className="p-6">
              <Handshake className="mb-5 h-9 w-9 text-[#08707b]" />
              <h3 className="text-xl font-black">Compromisos publicos</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Tambien registramos promesas hechas en campana, acuerdos firmados y compromisos de transparencia que
                pueden verificarse con informacion publica y seguimiento ciudadano.
              </p>
              <Link href="/acuerdos" className="mt-5 inline-block text-sm font-bold text-[#005763] hover:underline">
                Ver compromisos
              </Link>
            </CardContent>
          </Card>

          <Card className="border-cyan-950/10 bg-white shadow-sm">
            <CardContent className="p-6">
              <BookOpen className="mb-5 h-9 w-9 text-[#08707b]" />
              <h3 className="text-xl font-black">Memoria publica</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Cada publicacion, pedido y reporte ayuda a construir una memoria ordenada para sostener preguntas,
                respuestas y aprendizajes.
              </p>
              <Link href="/publicaciones" className="mt-5 inline-block text-sm font-bold text-[#005763] hover:underline">
                Ver informes
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-[#024852] py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Tu participacion tambien deja huella</h2>
          <p className="max-w-2xl text-cyan-50/80">
            Si tenes documentos, fotos, reclamos o ganas de colaborar, podes sumarte al observatorio ciudadano.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sumate">
              <Button className="bg-cyan-100 text-[#024852] hover:bg-white">Sumate</Button>
            </Link>
            <Link href="/cargar-reporte">
              <Button variant="outline" className="border-white/70 bg-transparent text-white hover:bg-white hover:text-[#024852]">
                Cargar reporte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
