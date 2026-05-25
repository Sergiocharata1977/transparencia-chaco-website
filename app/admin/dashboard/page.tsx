"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart2, BookOpen, Building2, FileCheck, FileText, Loader2, LogOut, MapPin, Newspaper, Store, Users } from "lucide-react"
import { logoutAdmin, subscribeAuthState, type User } from "@/lib/firebase/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header sticky */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <span className="font-semibold text-base truncate">
            Panel Admin — Observatorio Transparencia
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Grid de navegación */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-12">

          {[
            { href: "/admin/ciudades", icon: MapPin, titulo: "Ciudades Cubiertas", desc: "Alta y gestión de municipios del observatorio" },
            { href: "/admin/reportes", icon: FileCheck, titulo: "Reportes Ciudadanos", desc: "Revisar y aprobar reportes pendientes" },
            { href: "/admin/obras", icon: Building2, titulo: "Obras Públicas", desc: "Alta y edición de obras municipales" },
            { href: "/admin/pedidos", icon: FileText, titulo: "Pedidos de Información", desc: "Seguimiento de solicitudes de acceso a la información" },
            { href: "/admin/medios", icon: Newspaper, titulo: "Medios y Pautas", desc: "Gestión de medios y pauta oficial" },
            { href: "/admin/proveedores", icon: Store, titulo: "Proveedores del Estado", desc: "Contrataciones y proveedores municipales" },
            { href: "/admin/publicaciones", icon: BookOpen, titulo: "Publicaciones", desc: "Noticias y artículos del observatorio" },
            { href: "/admin/ranking", icon: BarChart2, titulo: "Ranking de Transparencia", desc: "Editor del índice por municipio" },
            { href: "/admin/usuarios", icon: Users, titulo: "Usuarios", desc: "Gestión de usuarios administradores" },
          ].map(({ href, icon: Icon, titulo, desc }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer border-primary/20">
                <CardHeader className="pb-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle className="text-base mt-3">{titulo}</CardTitle>
                  <CardDescription className="text-xs">{desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary font-medium group-hover:underline">
                    Abrir →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}

        </div>

        {/* Accesos rápidos */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Accesos rápidos</h2>
          <Card className="max-w-md">
            <CardContent className="pt-6 space-y-3">
              <div>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver web pública →
                </a>
              </div>
              <div>
                <a
                  href="/obras-publicas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Obras públicas →
                </a>
              </div>
              <div>
                <a
                  href="/cargar-reporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Cargar reporte →
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Nota al pie */}
      <footer className="container mx-auto px-4 py-8 mt-4">
        <p className="text-xs text-muted-foreground text-center">
          Solo los usuarios administradores tienen acceso a este panel. Asegurate de cerrar sesión en equipos compartidos.
        </p>
      </footer>
    </div>
  )
}
