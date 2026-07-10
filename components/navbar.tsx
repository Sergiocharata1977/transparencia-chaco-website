import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BuscadorGlobal } from "@/components/busqueda/buscador-global"

const primaryLinks = [
  { href: "/", label: "Inicio" },
  { href: "/acuerdos", label: "Acuerdos" },
  { href: "/rendicion", label: "Rendicion de Cuentas" },
  { href: "/publicaciones", label: "Noticias" },
  { href: "/denuncias", label: "Denuncias" },
]

const municipiosLinks = [
  { href: "/municipios/charata/observatorio", label: "Charata" },
  { href: "/municipios/las-brenas/observatorio", label: "Las Breñas" },
  { href: "/municipios/corzuela/observatorio", label: "Corzuela" },
  { href: "/municipios/presidencia-roque-saenz-pena/observatorio", label: "Pres. R. S. Peña" },
]

const observatorioLinks = [
  { href: "/obras-publicas", label: "Obras Publicas" },
  { href: "/pedidos-informacion", label: "Pedidos de Informacion" },
  { href: "/medios", label: "Medios y Pauta" },
  { href: "/proveedores-estado", label: "Proveedores del Estado" },
  { href: "/ranking-transparencia", label: "Ranking de Transparencia" },
  { href: "/mapa-ciudadano", label: "Mapa Ciudadano" },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-950/10 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center">
              <Image
                src="/logo-modelo1.png"
                alt="Transparencia Chaco"
                width={36}
                height={36}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span>
              <span className="block text-sm font-black leading-none text-cyan-950">
                Transparencia Chaco
              </span>
              <span className="mt-1 hidden text-[11px] font-medium text-slate-500 sm:block">
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
                  Municipios <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {municipiosLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/municipios">Ver todos los municipios</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
            <BuscadorGlobal />
            <Link href="/sumate" className="hidden lg:block">
              <Button size="sm" className="bg-[#005763] px-5 hover:bg-[#08707b]">
                Sumate
              </Button>
            </Link>
            <Link href="/cargar-reporte" className="hidden xl:block">
              <Button size="sm" variant="outline" className="border-cyan-900/20 bg-white text-cyan-950">
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
                      Municipios
                    </p>
                    {municipiosLinks.map((link) => (
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
