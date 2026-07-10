import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BuscadorGlobal } from "@/components/busqueda/buscador-global"

const municipiosLinks = [
  { href: "/municipios", label: "Municipios monitoreados" },
  { href: "/municipios/charata/observatorio", label: "Charata" },
  { href: "/municipios/las-brenas/observatorio", label: "Las Breñas" },
  { href: "/municipios/corzuela/observatorio", label: "Corzuela" },
  { href: "/municipios/presidencia-roque-saenz-pena/observatorio", label: "Sáenz Peña" },
]

const observatorioLinks = [
  { href: "/publicaciones", label: "Noticias e informes" },
  { href: "/obras-publicas", label: "Obras públicas" },
  { href: "/pedidos-informacion", label: "Pedidos de información" },
  { href: "/medios", label: "Medios y pauta" },
  { href: "/proveedores-estado", label: "Proveedores del Estado" },
  { href: "/ranking-transparencia", label: "Ranking de transparencia" },
  { href: "/mapa-ciudadano", label: "Mapa ciudadano" },
]

const compromisosLinks = [
  { href: "/acuerdos", label: "Acuerdos firmados" },
  { href: "/rendicion", label: "Rendición de cuentas" },
  { href: "/marco-legal", label: "Marco legal" },
]

const participarLinks = [
  { href: "/denuncias", label: "Denuncias" },
  { href: "/cargar-reporte", label: "Cargar reporte" },
  { href: "/sumate", label: "Sumate" },
]

function NavDropdown({
  label,
  links,
  align = "start",
}: {
  label: string
  links: { href: string; label: string }[]
  align?: "start" | "end" | "center"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors hover:text-[#08707b]">
          {label} <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-64">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MobileSection({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="border-t pt-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block py-2 text-base font-medium transition-colors hover:text-[#08707b]"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-950/10 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center">
              <Image
                src="/logo-modelo1.png"
                alt="Transparencia Chaco"
                width={36}
                height={36}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span className="min-w-0">
              <span className="block text-sm font-black leading-none text-cyan-950">Transparencia Chaco</span>
              <span className="mt-1 hidden text-[11px] font-medium text-slate-500 sm:block">
                Control ciudadano municipal
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-[#08707b]"
            >
              Inicio
            </Link>
            <NavDropdown label="Municipios" links={municipiosLinks} />
            <NavDropdown label="Observatorio" links={observatorioLinks} />
            <NavDropdown label="Compromisos" links={compromisosLinks} />
            <NavDropdown label="Participar" links={participarLinks} align="end" />
            <Link
              href="/quienes-somos"
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-[#08707b]"
            >
              Nosotros
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <BuscadorGlobal />
            <Link href="/sumate" className="hidden xl:block">
              <Button size="sm" className="bg-[#005763] px-5 hover:bg-[#08707b]">
                Sumate
              </Button>
            </Link>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Transparencia Chaco</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  <Link href="/" className="text-lg font-semibold transition-colors hover:text-[#08707b]">
                    Inicio
                  </Link>
                  <MobileSection title="Municipios" links={municipiosLinks} />
                  <MobileSection title="Observatorio" links={observatorioLinks} />
                  <MobileSection title="Compromisos" links={compromisosLinks} />
                  <MobileSection title="Participar" links={participarLinks} />
                  <Link
                    href="/quienes-somos"
                    className="border-t pt-5 text-lg font-semibold transition-colors hover:text-[#08707b]"
                  >
                    Nosotros
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
