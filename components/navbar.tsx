import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Scale, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

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
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sumate" className="hidden lg:block">
              <Button size="sm">Sumate</Button>
            </Link>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
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
                  <Link href="/sumate" className="mt-4">
                    <Button className="w-full">Sumate</Button>
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
