import Link from "next/link"
import { Scale } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-secondary py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8 mb-8">
          <div className="md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-primary" />
              <h4 className="font-bold">Transparencia Chaco</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Iniciativa ciudadana independiente por la rendición de cuentas municipal.
            </p>
          </div>

          <div>
            <h5 className="font-semibold mb-4">Navegación</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/municipios" className="text-muted-foreground hover:text-foreground">
                  Municipios
                </Link>
              </li>
              <li>
                <Link href="/rendicion" className="text-muted-foreground hover:text-foreground">
                  Rendición de Cuentas
                </Link>
              </li>
              <li>
                <Link href="/publicaciones" className="text-muted-foreground hover:text-foreground">
                  Publicaciones
                </Link>
              </li>
              <li>
                <Link href="/quienes-somos" className="text-muted-foreground hover:text-foreground">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link href="/marco-legal" className="text-muted-foreground hover:text-foreground">
                  Marco Legal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4">Observatorio</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/obras-publicas" className="text-muted-foreground hover:text-foreground">
                  Obras Públicas
                </Link>
              </li>
              <li>
                <Link href="/mapa-ciudadano" className="text-muted-foreground hover:text-foreground">
                  Mapa Ciudadano
                </Link>
              </li>
              <li>
                <Link href="/accidentes-seguridad" className="text-muted-foreground hover:text-foreground">
                  Seguridad y Accidentes
                </Link>
              </li>
              <li>
                <Link href="/salud-hospital" className="text-muted-foreground hover:text-foreground">
                  Salud / Hospital
                </Link>
              </li>
              <li>
                <Link href="/pedidos-informacion" className="text-muted-foreground hover:text-foreground">
                  Pedidos de Información
                </Link>
              </li>
              <li>
                <Link href="/ranking-transparencia" className="text-muted-foreground hover:text-foreground">
                  Ranking de Transparencia
                </Link>
              </li>
              <li>
                <Link href="/medios" className="text-muted-foreground hover:text-foreground">
                  Medios y Pauta
                </Link>
              </li>
              <li>
                <Link href="/proveedores-estado" className="text-muted-foreground hover:text-foreground">
                  Proveedores del Estado
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4">Participá</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cargar-reporte" className="text-muted-foreground hover:text-foreground font-medium">
                  Cargar Reporte
                </Link>
              </li>
              <li>
                <Link href="/denuncias" className="text-muted-foreground hover:text-foreground">
                  Denuncias
                </Link>
              </li>
              <li>
                <Link href="/sumate" className="text-muted-foreground hover:text-foreground">
                  Sumate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold mb-4">Contacto</h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contacto@transparenciachaco.org"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            <strong>Independencia política:</strong> No somos un partido político ni respondemos a ningún gobierno.
          </p>
          <p className="mt-2">© 2025 Transparencia Chaco. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
