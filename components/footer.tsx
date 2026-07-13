import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"

const footerGroups = [
  {
    title: "Observatorio",
    links: [
      { href: "/publicaciones", label: "Noticias e informes" },
      { href: "/obras-publicas", label: "Obras publicas" },
      { href: "/calles-pavimento", label: "Calles y pavimento" },
      { href: "/basurales", label: "Basurales" },
      { href: "/ranking-transparencia", label: "Indicadores" },
      { href: "/mapa-ciudadano", label: "Mapa ciudadano" },
    ],
  },
  {
    title: "Charata",
    links: [
      { href: "/municipios/charata/observatorio", label: "Informacion general" },
      { href: "/rendicion", label: "Presupuesto y rendicion" },
      { href: "/obras-publicas", label: "Obras publicas" },
      { href: "/calles-pavimento", label: "Calles y pavimento" },
      { href: "/basurales", label: "Basurales" },
      { href: "/marco-legal", label: "Concejo y marco legal" },
    ],
  },
  {
    title: "Transparencia",
    links: [
      { href: "/pedidos-informacion", label: "Pedidos de informacion" },
      { href: "/acuerdos", label: "Compromisos publicos" },
      { href: "/proveedores-estado", label: "Contrataciones" },
      { href: "/quienes-somos", label: "Nosotros" },
    ],
  },
  {
    title: "Participar",
    links: [
      { href: "/denuncias", label: "Enviar informacion" },
      { href: "/cargar-reporte", label: "Aportar documentacion" },
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
              Iniciativa ciudadana independiente para organizar informacion publica de Charata.
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
            <strong className="text-slate-700">Independencia institucional:</strong> trabajamos con criterio ciudadano,
            fuentes identificadas y documentacion publica.
          </p>
          <p className="mt-1">© 2026 Transparencia Chaco. Iniciativa ciudadana independiente.</p>
          <div className="mt-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-cyan-900/20 bg-white px-3 py-1.5 font-medium text-slate-600 transition-colors hover:border-[#08707b] hover:text-[#08707b]"
            >
              <Lock className="h-3.5 w-3.5" />
              Panel de administracion
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
