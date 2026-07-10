"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart2, BookOpen, Building2, FileCheck, FileText, Loader2, MapPin, Megaphone, Newspaper, Route, Send, Store, Users } from "lucide-react"
import { subscribeAuthState, type User } from "@/lib/firebase/auth-client"
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

  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="px-6 py-8">
      <div className="mb-2 text-sm text-muted-foreground">Bienvenido, {user.email}</div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
        {[
          { href: "/admin/ciudades",       icon: MapPin,     titulo: "Ciudades Cubiertas",       desc: "ABM madre: municipios y departamentos" },
          { href: "/admin/publicaciones",  icon: BookOpen,   titulo: "Noticias",                 desc: "Publicaciones del observatorio" },
          { href: "/admin/obras",          icon: Building2,  titulo: "Obras Públicas",           desc: "Alta y edición de obras" },
          { href: "/admin/calles",         icon: Route,      titulo: "Calles y Pavimento",       desc: "Tramos, estado de calles y mapa" },
          { href: "/admin/notas-municipio",icon: Send,       titulo: "Notas al Municipio",       desc: "Pedidos de info, notas y solicitudes" },
          { href: "/admin/reclamos",       icon: Megaphone,  titulo: "Reclamos por Ente",        desc: "Denuncias y reclamos por organismo" },
          { href: "/admin/medios",         icon: Newspaper,  titulo: "Medios y Pautas",          desc: "Medios y pauta oficial" },
          { href: "/admin/proveedores",    icon: Store,      titulo: "Proveedores del Estado",   desc: "Contrataciones municipales" },
          { href: "/admin/ranking",        icon: BarChart2,  titulo: "Ranking de Transparencia", desc: "Índice por municipio" },
          { href: "/admin/reportes",       icon: FileCheck,  titulo: "Reportes (legacy)",        desc: "Módulo anterior de reportes" },
          { href: "/admin/pedidos",        icon: FileText,   titulo: "Pedidos de Info (legacy)", desc: "Módulo anterior de pedidos" },
          { href: "/admin/usuarios",       icon: Users,      titulo: "Usuarios",                 desc: "Administradores del panel" },
        ].map(({ href, icon: Icon, titulo, desc }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md cursor-pointer border-primary/20">
              <CardHeader className="pb-3">
                <Icon className="h-7 w-7 text-primary" />
                <CardTitle className="text-sm mt-3">{titulo}</CardTitle>
                <CardDescription className="text-xs">{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary font-medium group-hover:underline">Abrir →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide text-xs">Accesos rápidos</h2>
        <div className="flex gap-3 flex-wrap">
          {[
            { href: "/",              label: "Ver web pública" },
            { href: "/obras-publicas",label: "Obras públicas" },
            { href: "/cargar-reporte",label: "Cargar reporte" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline border border-primary/20 px-3 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
            >
              {label} →
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
