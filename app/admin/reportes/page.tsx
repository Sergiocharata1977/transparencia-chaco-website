"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle,
  Loader2,
  ArrowLeft,
  LogOut,
  ClipboardList,
} from "lucide-react"
import { subscribeAuthState, logoutAdmin, type User } from "@/lib/firebase/auth-client"
import { getReportesPendientes, actualizarReporte } from "@/lib/firebase/admin-data"
import type { ReporteCiudadano, ReporteEstado, NivelVerificacion } from "@/types/reportes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ──────────────────────────────────────────────
// Helpers de presentación
// ──────────────────────────────────────────────

const ESTADO_LABELS: Record<ReporteEstado, string> = {
  recibido: "Recibido",
  "en-revision": "En revisión",
  "falta-evidencia": "Falta evidencia",
  verificado: "Verificado",
  publicado: "Publicado",
  "pedido-enviado": "Pedido enviado",
  respondido: "Respondido",
  cerrado: "Cerrado",
  descartado: "Descartado",
}

const NIVEL_LABELS: Record<NivelVerificacion, string> = {
  1: "1 — Sin verificar",
  2: "2 — Con evidencia",
  3: "3 — Múltiples fuentes",
  4: "4 — Documento oficial",
  5: "5 — Respuesta oficial",
}

const TIPO_BADGE_COLOR: Record<string, string> = {
  "obra-publica": "bg-blue-100 text-blue-800 border-blue-200",
  accidente: "bg-red-100 text-red-800 border-red-200",
  inseguridad: "bg-orange-100 text-orange-800 border-orange-200",
  hospital: "bg-purple-100 text-purple-800 border-purple-200",
  bache: "bg-yellow-100 text-yellow-800 border-yellow-200",
  iluminacion: "bg-sky-100 text-sky-800 border-sky-200",
  calle: "bg-stone-100 text-stone-800 border-stone-200",
  otro: "bg-gray-100 text-gray-700 border-gray-200",
}

function tipoColor(tipo: string) {
  return TIPO_BADGE_COLOR[tipo] ?? TIPO_BADGE_COLOR["otro"]
}

function formatFecha(iso?: string) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

// ──────────────────────────────────────────────
// Tipos de estado local
// ──────────────────────────────────────────────

type CambiosPendientes = {
  estadoInterno: ReporteEstado
  nivelVerificacion: NivelVerificacion
  visibilidadPublica: boolean
  observacionInterna: string
}

// ──────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────

export default function AdminReportesPage() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [reportes, setReportes] = useState<ReporteCiudadano[]>([])
  const [loading, setLoading] = useState(true)
  const [cambios, setCambios] = useState<Record<string, CambiosPendientes>>({})
  const [guardando, setGuardando] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Record<string, string>>({})

  // ── Protección de ruta ──────────────────────
  useEffect(() => {
    const unsub = subscribeAuthState((u) => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ── Cargar datos ────────────────────────────
  useEffect(() => {
    if (!user) return
    setLoading(true)
    getReportesPendientes().then((data) => {
      setReportes(data)
      const init: Record<string, CambiosPendientes> = {}
      data.forEach((r) => {
        init[r.id] = {
          estadoInterno: r.estadoInterno,
          nivelVerificacion: r.nivelVerificacion,
          visibilidadPublica: r.visibilidadPublica,
          observacionInterna: "",
        }
      })
      setCambios(init)
      setLoading(false)
    })
  }, [user])

  // ── Guardar cambios ─────────────────────────
  async function guardarCambios(id: string) {
    const c = cambios[id]
    if (!c) return
    setGuardando(id)
    try {
      await actualizarReporte(id, c)
      setMensajes((prev) => ({ ...prev, [id]: "ok" }))
      // Si ya no está en estados pendientes, quitarlo de la lista
      if (c.estadoInterno !== "recibido" && c.estadoInterno !== "en-revision") {
        setReportes((prev) => prev.filter((r) => r.id !== id))
      }
    } catch {
      setMensajes((prev) => ({ ...prev, [id]: "error" }))
    } finally {
      setGuardando(null)
      setTimeout(
        () =>
          setMensajes((prev) => {
            const n = { ...prev }
            delete n[id]
            return n
          }),
        3000,
      )
    }
  }

  function setCampo<K extends keyof CambiosPendientes>(
    id: string,
    campo: K,
    valor: CambiosPendientes[K],
  ) {
    setCambios((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }))
  }

  // ── Estados de espera ───────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ── Render principal ────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold leading-tight">
              Panel Admin — Reportes Ciudadanos
            </h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logoutAdmin()
                router.replace("/admin")
              }}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* ── Stats bar ── */}
      <div className="bg-muted/30 py-4 border-b">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClipboardList className="h-4 w-4" />
            {loading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <span>
                <strong className="text-foreground">{reportes.length}</strong>{" "}
                {reportes.length === 1
                  ? "reporte pendiente de revisión"
                  : "reportes pendientes de revisión"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <main className="container py-8">
        {/* Estado de carga */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border overflow-hidden">
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="p-4 border-t">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reportes.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <p className="font-semibold text-lg">No hay reportes pendientes.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Todos los reportes han sido revisados.
              </p>
            </div>
          </div>
        ) : (
          /* Lista de reportes */
          <div className="space-y-6">
            {reportes.map((reporte) => {
              const c = cambios[reporte.id]
              const estaGuardando = guardando === reporte.id
              const msg = mensajes[reporte.id]
              const r = reporte as ReporteCiudadano & {
                subtipo?: string
                tipoProblema?: string
              }

              return (
                <div
                  key={reporte.id}
                  className="rounded-xl border overflow-hidden shadow-sm"
                >
                  {/* Card header */}
                  <div className="bg-muted/10 p-4 border-b flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={tipoColor(reporte.tipo)}
                        >
                          {reporte.tipo.replace(/-/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {reporte.municipio}
                          {reporte.createdAt
                            ? ` · ${formatFecha(reporte.createdAt)}`
                            : null}
                        </span>
                      </div>
                      <p className="font-semibold text-sm leading-snug">
                        {reporte.titulo}
                      </p>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-2 text-sm">
                    <p className="text-foreground/80 leading-relaxed">
                      {reporte.descripcion}
                    </p>
                    {r.subtipo ? (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Subtipo:</span>{" "}
                        {r.subtipo.replace(/-/g, " ")}
                      </p>
                    ) : null}
                    {r.tipoProblema ? (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Tipo de problema:
                        </span>{" "}
                        {r.tipoProblema.replace(/-/g, " ")}
                      </p>
                    ) : null}
                    {reporte.ubicacionTexto ? (
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Ubicación:</span>{" "}
                        {reporte.ubicacionTexto}
                      </p>
                    ) : null}
                    {reporte.anonimo === false ? (
                      <p className="text-amber-700 dark:text-amber-400 text-xs font-medium">
                        El vecino NO solicitó anonimato
                      </p>
                    ) : null}
                  </div>

                  {/* Card footer — controles */}
                  {c ? (
                    <div className="bg-muted/5 p-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        {/* Estado interno */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Estado
                          </Label>
                          <Select
                            value={c.estadoInterno}
                            onValueChange={(v) =>
                              setCampo(reporte.id, "estadoInterno", v as ReporteEstado)
                            }
                          >
                            <SelectTrigger className="w-full h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(
                                Object.keys(ESTADO_LABELS) as ReporteEstado[]
                              ).map((estado) => (
                                <SelectItem key={estado} value={estado} className="text-xs">
                                  {ESTADO_LABELS[estado]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Nivel verificación */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Verificación
                          </Label>
                          <Select
                            value={String(c.nivelVerificacion)}
                            onValueChange={(v) =>
                              setCampo(
                                reporte.id,
                                "nivelVerificacion",
                                Number(v) as NivelVerificacion,
                              )
                            }
                          >
                            <SelectTrigger className="w-full h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {([1, 2, 3, 4, 5] as NivelVerificacion[]).map((n) => (
                                <SelectItem key={n} value={String(n)} className="text-xs">
                                  {NIVEL_LABELS[n]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Observación interna */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Nota interna
                          </Label>
                          <Input
                            className="h-9 text-xs"
                            placeholder="Nota interna (no pública)"
                            value={c.observacionInterna}
                            onChange={(e) =>
                              setCampo(reporte.id, "observacionInterna", e.target.value)
                            }
                          />
                        </div>

                        {/* Visibilidad + guardar */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`vis-${reporte.id}`}
                              checked={c.visibilidadPublica}
                              onCheckedChange={(checked) =>
                                setCampo(
                                  reporte.id,
                                  "visibilidadPublica",
                                  checked === true,
                                )
                              }
                            />
                            <Label
                              htmlFor={`vis-${reporte.id}`}
                              className="text-xs cursor-pointer"
                            >
                              Publicar en el sitio
                            </Label>
                          </div>
                          <Button
                            size="sm"
                            className={
                              msg === "ok"
                                ? "w-full bg-green-600 hover:bg-green-700 text-white"
                                : "w-full"
                            }
                            disabled={estaGuardando}
                            onClick={() => guardarCambios(reporte.id)}
                          >
                            {estaGuardando ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Guardando…
                              </>
                            ) : msg === "ok" ? (
                              <>
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                Guardado
                              </>
                            ) : (
                              "Guardar cambios"
                            )}
                          </Button>
                          {msg === "error" ? (
                            <p className="text-xs text-destructive">
                              Error al guardar. Intentá de nuevo.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <Link
            href="/accidentes-seguridad"
            className="text-primary hover:underline"
          >
            Ver reportes publicados en el sitio →
          </Link>
        </div>
      </footer>
    </div>
  )
}
