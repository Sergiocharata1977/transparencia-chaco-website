import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, Menu, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const observatorioLinks = [
  { href: "/obras-publicas", label: "Obras Públicas" },
  { href: "/mapa-ciudadano", label: "Mapa Ciudadano" },
  { href: "/accidentes-seguridad", label: "Seguridad y Accidentes" },
  { href: "/salud-hospital", label: "Salud / Hospital" },
  { href: "/pedidos-informacion", label: "Pedidos de Información" },
  { href: "/ranking-transparencia", label: "Ranking de Transparencia" },
  { href: "/medios", label: "Medios y Pauta" },
  { href: "/proveedores-estado", label: "Proveedores del Estado" },
]

export function Navbar() {
  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">Transparencia Chaco</h1>
              <p className="text-xs text-muted-foreground">Iniciativa ciudadana</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/municipios" className="text-sm font-medium hover:text-primary transition-colors">
              Municipios
            </Link>
            <Link href="/rendicion" className="text-sm font-medium hover:text-primary transition-colors">
              Rendición de Cuentas
            </Link>
            <Link href="/denuncias" className="text-sm font-medium hover:text-primary transition-colors">
              Denuncias
            </Link>
            <Link href="/publicaciones" className="text-sm font-medium hover:text-primary transition-colors">
              Publicaciones
            </Link>
            <Link href="/quienes-somos" className="text-sm font-medium hover:text-primary transition-colors">
              Quiénes Somos
            </Link>

            {/* Observatorio dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                  Observatorio <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {observatorioLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cargar-reporte" className="hidden lg:block">
              <Button size="sm">Cargar Reporte</Button>
            </Link>
            <Link href="/sumate" className="hidden lg:block">
              <Button size="sm" variant="outline">Sumate</Button>
            </Link>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                    Inicio
                  </Link>
                  <Link href="/municipios" className="text-lg font-medium hover:text-primary transition-colors">
                    Municipios
                  </Link>
                  <Link href="/rendicion" className="text-lg font-medium hover:text-primary transition-colors">
                    Rendición de Cuentas
                  </Link>
                  <Link href="/denuncias" className="text-lg font-medium hover:text-primary transition-colors">
                    Denuncias
                  </Link>
                  <Link href="/publicaciones" className="text-lg font-medium hover:text-primary transition-colors">
                    Publicaciones
                  </Link>
                  <Link href="/quienes-somos" className="text-lg font-medium hover:text-primary transition-colors">
                    Quiénes Somos
                  </Link>
                  <Link href="/marco-legal" className="text-lg font-medium hover:text-primary transition-colors">
                    Marco Legal
                  </Link>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">Observatorio</p>
                    {observatorioLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block py-1.5 text-base font-medium hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex flex-col gap-2">
                    <Link href="/cargar-reporte">
                      <Button className="w-full">Cargar Reporte</Button>
                    </Link>
                    <Link href="/sumate">
                      <Button variant="outline" className="w-full">Sumate</Button>
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
