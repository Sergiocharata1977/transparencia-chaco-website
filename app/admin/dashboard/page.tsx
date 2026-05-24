"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, FileCheck, FileText, Loader2, LogOut, Users } from "lucide-react"
import { logoutAdmin, subscribeAuthState, type User } from "@/lib/firebase/auth-client"
import { Badge } from "@/components/ui/badge"
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
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Reportes Ciudadanos */}
          <Link href="/admin/reportes" className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg mt-3">Reportes Ciudadanos</CardTitle>
                <CardDescription>Revisar y aprobar reportes pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Ir a reportes →
                </span>
              </CardContent>
            </Card>
          </Link>

          {/* Usuarios internos */}
          <Link href="/admin/usuarios" className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg mt-3">Usuarios</CardTitle>
                <CardDescription>Gestión de usuarios administradores</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium group-hover:underline">
                  Ir a usuarios →
                </span>
              </CardContent>
            </Card>
          </Link>

          {/* Obras Públicas */}
          <Card className="h-full opacity-70 border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <Badge variant="secondary">Próximamente</Badge>
              </div>
              <CardTitle className="text-lg mt-3 text-muted-foreground">Obras Públicas</CardTitle>
              <CardDescription>Gestión de obras y proyectos municipales</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">No disponible aún</span>
            </CardContent>
          </Card>

          {/* Pedidos de Información */}
          <Card className="h-full opacity-70 border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <Badge variant="secondary">Próximamente</Badge>
              </div>
              <CardTitle className="text-lg mt-3 text-muted-foreground">
                Pedidos de Información
              </CardTitle>
              <CardDescription>Seguimiento de solicitudes de acceso a la información</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">No disponible aún</span>
            </CardContent>
          </Card>
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
