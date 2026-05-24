import Link from "next/link"
import { ChevronDown, Menu, Scale } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const primaryLinks = [
  { href: "/", label: "Inicio" },
  { href: "/municipios", label: "Municipios" },
  { href: "/rendicion", label: "Rendicion de Cuentas" },
  { href: "/publicaciones", label: "Publicaciones" },
  { href: "/denuncias", label: "Denuncias" },
]

const observatorioLinks = [
  { href: "/ranking-transparencia", label: "Ranking de Transparencia" },
  { href: "/obras-publicas", label: "Obras Publicas" },
  { href: "/mapa-ciudadano", label: "Mapa Ciudadano" },
  { href: "/pedidos-informacion", label: "Pedidos de Informacion" },
  { href: "/medios", label: "Medios y Pauta" },
  { href: "/proveedores-estado", label: "Proveedores del Estado" },
  { href: "/accidentes-seguridad", label: "Seguridad y Accidentes" },
  { href: "/salud-hospital", label: "Salud / Hospital" },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#024852] text-cyan-100 shadow-sm">
              <Scale className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-black leading-none tracking-tight text-slate-950">
                Transparencia Chaco
              </span>
              <span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">
                Control ciudadano municipal
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-700 transition-colors hover:text-[#08707b]"
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-semibold text-slate-700 transition-colors hover:text-[#08707b]">
                  Observatorio <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {observatorioLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sumate" className="hidden lg:block">
              <Button size="sm" className="bg-[#024852] px-5 hover:bg-[#08707b]">
                Sumate
              </Button>
            </Link>
            <Link href="/cargar-reporte" className="hidden xl:block">
              <Button size="sm" variant="outline" className="border-slate-300 bg-white">
                Cargar Reporte
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
                  {primaryLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-semibold transition-colors hover:text-[#08707b]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/quienes-somos" className="text-lg font-semibold transition-colors hover:text-[#08707b]">
                    Quienes Somos
                  </Link>
                  <Link href="/marco-legal" className="text-lg font-semibold transition-colors hover:text-[#08707b]">
                    Marco Legal
                  </Link>

                  <div className="border-t pt-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      Observatorio
                    </p>
                    {observatorioLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block py-2 text-base font-medium transition-colors hover:text-[#08707b]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t pt-5">
                    <Link href="/cargar-reporte">
                      <Button className="w-full bg-[#024852] hover:bg-[#08707b]">Cargar Reporte</Button>
                    </Link>
                    <Link href="/sumate">
                      <Button variant="outline" className="mt-2 w-full bg-white">
                        Sumate
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
