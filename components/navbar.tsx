"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
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

const observatorioLinks = [
  { href: "/publicaciones", label: "Noticias e informes" },
  { href: "/obras-publicas", label: "Obras públicas" },
  { href: "/calles-pavimento", label: "Calles y pavimento" },
  { href: "/medios", label: "Medios y pauta" },
  { href: "/proveedores-estado", label: "Proveedores del Estado" },
  { href: "/ranking-transparencia", label: "Ranking de transparencia" },
  { href: "/mapa-ciudadano", label: "Mapa ciudadano" },
]

const charataLinks = [
  { href: "/municipios/charata/observatorio", label: "Informacion general" },
  { href: "/rendicion", label: "Presupuesto y rendicion" },
  { href: "/obras-publicas", label: "Obras publicas" },
  { href: "/calles-pavimento", label: "Calles y pavimento" },
  { href: "/marco-legal", label: "Concejo y marco legal" },
  { href: "/proveedores-estado", label: "Compras y contrataciones" },
]

const participarLinks = [
  { href: "/denuncias", label: "Enviar informacion" },
  { href: "/cargar-reporte", label: "Aportar documentacion" },
  { href: "/sumate", label: "Sumate" },
]

function NavDropdown({
  label,
  links,
  align = "start",
  active = false,
}: {
  label: string
  links: { href: string; label: string }[]
  align?: "start" | "end" | "center"
  active?: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex h-11 items-center gap-1 border-b-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08707b] focus-visible:ring-offset-2 ${
            active
              ? "border-[#08707b] text-[#005763]"
              : "border-transparent text-slate-700 hover:text-[#08707b]"
          }`}
        >
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

function NavLink({ href, children, active }: { href: string; children: ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex h-11 items-center border-b-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#08707b] focus-visible:ring-offset-2 ${
        active
          ? "border-[#08707b] text-[#005763]"
          : "border-transparent text-slate-700 hover:text-[#08707b]"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileSection({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <details className="group border-t pt-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">
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
    </details>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const participarMobileLinks = participarLinks.filter((link) => link.href !== "/sumate")

  const isActiveHref = (href: string) => (
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  )

  const isActiveGroup = (links: { href: string }[]) => links.some((link) => isActiveHref(link.href))

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-950/10 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="border-b border-cyan-950/10">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:min-h-[72px]">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Transparencia Chaco, inicio">
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

          <div className="flex items-center gap-2">
            <BuscadorGlobal
              className="w-[420px] max-w-[42vw]"
              placeholder="Buscar obras, pedidos, noticias o datos de Charata"
            />
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
                  <Link
                    href="/quienes-somos"
                    className="text-lg font-semibold transition-colors hover:text-[#08707b]"
                  >
                    Nosotros
                  </Link>
                  <MobileSection title="Charata" links={charataLinks} />
                  <MobileSection title="Observatorio" links={observatorioLinks} />
                  <Link
                    href="/pedidos-informacion"
                    className="border-t pt-5 text-lg font-semibold transition-colors hover:text-[#08707b]"
                  >
                    Pedidos de informacion
                  </Link>
                  <MobileSection title="Participar" links={participarMobileLinks} />
                  <Link href="/sumate" className="border-t pt-5 text-lg font-semibold transition-colors hover:text-[#08707b]">
                    Sumate
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <nav aria-label="Menu principal" className="hidden lg:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-7 px-4">
          <NavLink href="/" active={isActiveHref("/")}>
            Inicio
          </NavLink>
          <NavLink href="/quienes-somos" active={isActiveHref("/quienes-somos")}>
            Nosotros
          </NavLink>
          <NavDropdown label="Charata" links={charataLinks} active={isActiveGroup(charataLinks)} />
          <NavDropdown label="Observatorio" links={observatorioLinks} active={isActiveGroup(observatorioLinks)} />
          <NavLink href="/pedidos-informacion" active={isActiveHref("/pedidos-informacion")}>
            Pedidos de informacion
          </NavLink>
          <NavDropdown label="Participar" links={participarLinks} align="end" active={isActiveGroup(participarLinks)} />
        </div>
      </nav>
    </header>
  )
}
