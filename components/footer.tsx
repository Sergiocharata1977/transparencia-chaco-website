import Link from "next/link"
import { Scale } from "lucide-react"

const footerGroups = [
  {
    title: "Explorar",
    links: [
      { href: "/obras-publicas", label: "Obras Publicas" },
      { href: "/publicaciones", label: "Noticias" },
      { href: "/buscar", label: "Buscar" },
      { href: "/ranking-transparencia", label: "Ranking de Transparencia" },
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
    title: "Participa",
    links: [
      { href: "/cargar-reporte", label: "Cargar Reporte" },
      { href: "/pedidos-informacion", label: "Pedidos de Informacion" },
      { href: "/mapa-ciudadano", label: "Mapa Ciudadano" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f7f9fa] py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#024852] text-cyan-100">
                <Scale className="h-5 w-5" />
              </span>
              <h4 className="text-lg font-black">Transparencia Chaco</h4>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Iniciativa ciudadana independiente para la rendicion de cuentas municipal.
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

        <div className="mt-10 border-t border-slate-200 pt-8 text-center text-xs leading-6 text-muted-foreground">
          <p>
            <strong className="text-slate-700">Independencia politica:</strong> No somos un partido politico ni
            respondemos a ningun gobierno.
          </p>
          <p className="mt-1">© 2026 Transparencia Chaco. Iniciativa ciudadana independiente.</p>
        </div>
      </div>
    </footer>
  )
}
