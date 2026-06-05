import Image from "next/image"
import { AlertTriangle, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

type Acuerdo = {
  numero: string
  lista: string
  partido: string
  badgeClass: string
  accentClass: string
  chromeTag: string
  chromeColor: string
  imagen: string
  videoId: string | null
  descripcion: string
}

const acuerdos: Acuerdo[] = [
  {
    numero: "01",
    lista: "Lista 653",
    partido: "Radicalismo",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    accentClass: "border-l-red-500",
    chromeTag: "Lista 653 - UCR",
    chromeColor: "bg-red-500/20 text-red-300",
    imagen: "/Iniciativa Transparencia Charata Lista 653 ch.jpg",
    videoId: null,
    descripcion:
      'Los candidatos del Radicalismo (Lista 653) firmaron ante Escribana Publica el compromiso "Municipio Transparente - Todo a Internet". Se comprometieron a publicar presupuesto, nomina, contratos y rodados en linea. Nunca cumplieron.',
  },
  {
    numero: "02",
    lista: "Lista 652",
    partido: "Peronismo",
    badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
    accentClass: "border-l-blue-500",
    chromeTag: "Lista 652 - PJ",
    chromeColor: "bg-blue-500/20 text-blue-300",
    imagen: "/Iniciativa Transparencia Charata Lista 652 gr.jpg",
    videoId: null,
    descripcion:
      "Los candidatos del Peronismo (Lista 652) tambien firmaron el mismo compromiso con certificacion notarial. Acceso a gastos e ingresos, catastro en linea y digitalizacion de compras publicas eran los puntos centrales. Nunca cumplieron.",
  },
  {
    numero: "03",
    lista: "Lista 659",
    partido: "La Libertad Avanza",
    badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
    accentClass: "border-l-violet-500",
    chromeTag: "Lista 659 - LLA",
    chromeColor: "bg-violet-500/20 text-violet-300",
    imagen: "/Iniciativa Transparencia Charata Lista 659 gr.jpg",
    videoId: null,
    descripcion:
      "Los candidatos de La Libertad Avanza (Lista 659) suscribieron el mismo compromiso publico de transparencia municipal. Prometieron gobierno abierto y rendicion de cuentas en internet. Nunca cumplieron.",
  },
]

export default function AcuerdosPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fa] text-slate-950">
      <Navbar />

      {/* Header */}
      <section className="relative isolate overflow-hidden bg-[#024852] py-16 text-white md:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_40%,rgba(81,188,205,0.25),transparent_50%),linear-gradient(135deg,#013d46_0%,#075c66_60%,#03414a_100%)]" />
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm font-semibold text-cyan-50/90">
              Documentos firmados ante Escribana Pública — Charata, 2023
            </p>
          </div>
          <h1 className="mt-8 text-balance text-4xl font-black tracking-tight drop-shadow-sm md:text-6xl">
            Los acuerdos nunca cumplidos
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-8 text-cyan-50/80 md:text-lg">
            En 2023, durante la campaña electoral, los candidatos a intendente y concejales de Charata
            firmaron ante escribana pública la{" "}
            <strong className="text-white">
              Iniciativa Municipio Transparente — "Todo a Internet"
            </strong>
            . Un compromiso público, notariado, con nombre y DNI. Lo prometieron. Nunca lo cumplieron.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto space-y-10 px-4">
          {acuerdos.map((acuerdo) => (
            <div
              key={acuerdo.numero}
              className={`overflow-hidden rounded-3xl border-l-4 bg-white shadow-md ${acuerdo.accentClass}`}
            >
              {/* Card header */}
              <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-6 py-4">
                <span className="text-4xl font-black text-slate-100">{acuerdo.numero}</span>
                <div>
                  <Badge variant="outline" className={`mb-1 ${acuerdo.badgeClass}`}>
                    {acuerdo.lista}
                  </Badge>
                  <h2 className="text-xl font-black tracking-tight">{acuerdo.partido}</h2>
                </div>
                <Badge variant="outline" className="ml-auto border-red-200 bg-red-50 text-red-600">
                  Incumplido
                </Badge>
              </div>

              {/* Card body: imagen + video */}
              <div className="grid gap-0 md:grid-cols-2">
                {/* Imagen */}
                <div className="relative min-h-[280px] overflow-hidden bg-slate-100">
                  <Image
                    src={acuerdo.imagen}
                    alt={`Compromiso firmado — ${acuerdo.partido} ${acuerdo.lista}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                      Documento original firmado
                    </p>
                  </div>
                </div>

                {/* Video browser-chrome */}
                <div className="flex flex-col gap-5 p-6">
                  <p className="text-sm leading-7 text-slate-600">{acuerdo.descripcion}</p>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg">
                    {/* Chrome bar */}
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        <div className="ml-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                          Declaración en campaña
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${acuerdo.chromeColor}`}>
                        {acuerdo.chromeTag}
                      </span>
                    </div>

                    {/* Video area */}
                    <div className="relative aspect-video bg-slate-900">
                      {acuerdo.videoId ? (
                        <iframe
                          className="absolute inset-0 h-full w-full border-0"
                          src={`https://www.youtube.com/embed/${acuerdo.videoId}?rel=0&modestbranding=1`}
                          title={`Video ${acuerdo.partido}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        /* Placeholder hasta que se agregue el video */
                        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            <Play className="h-6 w-6 text-white/60" />
                          </div>
                          <p className="text-sm text-slate-400">Video del acto de campaña</p>
                          <p className="text-xs text-slate-600">Próximamente</p>
                        </div>
                      )}

                      {/* Overlay card inferior derecha */}
                      <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-xl border border-white/10 bg-white/95 p-3 text-left shadow-lg sm:block sm:w-[220px]">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Lo prometió en campaña
                        </div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Firmado ante escribana. Jamás cumplido.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#024852] py-14 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-black">¿Querés que lo cumplan?</h3>
          <p className="mx-auto mt-3 max-w-lg text-cyan-50/80">
            Pedí formalmente la información pública que prometieron publicar. Tenés derecho.
          </p>
          <a
            href="/pedidos-informacion"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-100 px-6 py-3 text-sm font-bold text-[#024852] transition hover:bg-white"
          >
            Hacer un pedido de información
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}
