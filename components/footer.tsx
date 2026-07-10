import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"

const footerGroups = [
  {
    title: "Observatorio",
    links: [
      { href: "/publicaciones", label: "Noticias e informes" },
      { href: "/obras-publicas", label: "Obras públicas" },
      { href: "/calles-pavimento", label: "Calles y pavimento" },
      { href: "/ranking-transparencia", label: "Ranking de transparencia" },
      { href: "/mapa-ciudadano", label: "Mapa ciudadano" },
    ],
  },
  {
    title: "Municipios",
    links: [
      { href: "/municipios/charata/observatorio", label: "Charata" },
      { href: "/municipios/las-brenas/observatorio", label: "Las Breñas" },
      { href: "/municipios/corzuela/observatorio", label: "Corzuela" },
      { href: "/municipios/presidencia-roque-saenz-pena/observatorio", label: "Pres. R. S. Peña" },
    ],
  },
  {
    title: "Compromisos",
    links: [
      { href: "/acuerdos", label: "Acuerdos firmados" },
      { href: "/rendicion", label: "Rendición de cuentas" },
      { href: "/marco-legal", label: "Marco legal" },
      { href: "/quienes-somos", label: "Nosotros" },
    ],
  },
  {
    title: "Participar",
    links: [
      { href: "/denuncias", label: "Denuncias" },
      { href: "/cargar-reporte", label: "Cargar reporte" },
      { href: "/sumate", label: "Sumate" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-cyan-950/10 bg-[#f7fafb] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src="/logo-modelo1.png"
                  alt="Transparencia Chaco"
                  width={40}
                  height={40}
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <h4 className="text-lg font-black text-cyan-950">Transparencia Chaco</h4>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Iniciativa ciudadana independiente para la rendición de cuentas municipal.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h5 className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-slate-500">{group.title}</h5>
              <ul className="space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-muted-foreground transition-colors hover:text-[#08707b]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-cyan-950/10 pt-8 text-center text-xs leading-6 text-muted-foreground">
          <p>
            <strong className="text-slate-700">Independencia política:</strong> No somos un partido político ni
            respondemos a ningún gobierno.
          </p>
          <p className="mt-1">© 2026 Transparencia Chaco. Iniciativa ciudadana independiente.</p>
          <div className="mt-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-900/20 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-[#08707b] hover:text-[#08707b]"
            >
              <Lock className="h-3.5 w-3.5" />
              Panel de administración
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
