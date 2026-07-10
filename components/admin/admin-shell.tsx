"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart2, BookOpen, Building2, FileCheck, FileText,
  Globe, Home, LogOut, MapPin, Megaphone, Newspaper, Route, Send, Store, Users,
} from "lucide-react"
import { subscribeAuthState, logoutAdmin, type User } from "@/lib/firebase/auth-client"

const NAV = [
  {
    group: "Principal",
    items: [
      { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    ],
  },
  {
    group: "Gestión de Contenido",
    items: [
      { href: "/admin/ciudades",       icon: MapPin,     label: "Ciudades Cubiertas" },
      { href: "/admin/publicaciones",  icon: BookOpen,   label: "Noticias" },
      { href: "/admin/obras",          icon: Building2,  label: "Obras Públicas" },
      { href: "/admin/calles",         icon: Route,      label: "Calles y Pavimento" },
      { href: "/admin/notas-municipio",icon: Send,       label: "Notas al Municipio" },
      { href: "/admin/reclamos",       icon: Megaphone,  label: "Reclamos por Ente" },
      { href: "/admin/medios",         icon: Newspaper,  label: "Medios y Pautas" },
      { href: "/admin/proveedores",    icon: Store,      label: "Proveedores" },
      { href: "/admin/ranking",        icon: BarChart2,  label: "Ranking" },
    ],
  },
  {
    group: "Legacy",
    items: [
      { href: "/admin/reportes", icon: FileCheck, label: "Reportes (legacy)" },
      { href: "/admin/pedidos",  icon: FileText,  label: "Pedidos de Info (legacy)" },
    ],
  },
  {
    group: "Administración",
    items: [
      { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
    ],
  },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => subscribeAuthState(u => { setUser(u); setChecking(false) }), [])

  if (pathname === "/admin") return <>{children}</>

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!user) return <>{children}</>

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-950 text-slate-100 flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Panel Admin</p>
          <p className="text-sm font-semibold text-white leading-snug">
            Observatorio<br />Transparencia
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {NAV.map(group => (
            <div key={group.group}>
              <p className="px-3 text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-1">
                {group.group}
              </p>
              {group.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors ${
                      active
                        ? "bg-white/10 text-white font-medium"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-500 truncate mb-2.5 px-1">{user.email}</p>
          <div className="flex gap-1.5">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 flex-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded transition-colors"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              Ver web
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 px-2.5 py-1.5 rounded transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
