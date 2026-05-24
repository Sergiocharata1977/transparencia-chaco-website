"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  ArrowLeft,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { logoutAdmin, subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PedidoAdmin {
  id: string
  municipio: string
  municipioSlug: string
  organismo: string
  tema: string
  fechaISO: string
  estado: string
  estadoEditorial: string
  visibilidadPublica: boolean
  textoPedido?: string
  fechaRespuestaISO?: string
  respuestaResumen?: string
  nivelVerificacion?: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MUNICIPIOS = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const pedidoFormSchema = z.object({
  municipioSlug: z.enum(["charata", "las-brenas", "corzuela", "presidencia-roque-saenz-pena"]),
  organismo: z.string().min(3).max(150),
  tema: z.string().min(5).max(200),
  fechaISO: z.string().min(1, "Requerido"),
  estado: z.enum(["en-plazo", "respondido-completo", "respondido-parcial", "sin-respuesta", "vencido"]),
  estadoEditorial: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
  textoPedido: z.string().max(2000).optional(),
  fechaRespuestaISO: z.string().optional(),
  respuestaResumen: z.string().max(1000).optional(),
  nivelVerificacion: z.coerce.number().int().min(1).max(5).default(1),
})

type PedidoFormValues = z.infer<typeof pedidoFormSchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

function formatFecha(iso: string | undefined | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function municipioLabel(slug: string) {
  return MUNICIPIOS.find((m) => m.slug === slug)?.label ?? slug
}

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

function badgeEstado(estado: string): { label: string; className: string } {
  switch (estado) {
    case "respondido-completo":
      return { label: "Respondido completo", className: "bg-green-100 text-green-800 border-green-200" }
    case "respondido-parcial":
      return { label: "Respondido parcial", className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    case "sin-respuesta":
      return { label: "Sin respuesta", className: "bg-red-100 text-red-800 border-red-200" }
    case "vencido":
      return { label: "Vencido", className: "bg-red-100 text-red-800 border-red-200" }
    case "en-plazo":
    default:
      return { label: "En plazo", className: "bg-blue-100 text-blue-800 border-blue-200" }
  }
}

function badgeEditorial(estado: string): { label: string; variant: BadgeVariant } {
  switch (estado) {
    case "published":
      return { label: "Publicado", variant: "default" }
    case "review":
      return { label: "En revisión", variant: "secondary" }
    case "archived":
      return { label: "Archivado", variant: "destructive" }
    case "draft":
    default:
      return { label: "Borrador", variant: "outline" }
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminPedidosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const router = useRouter()

  // React Hook Form
  const form = useForm<PedidoFormValues>({
    resolver: zodResolver(pedidoFormSchema),
    defaultValues: {
      municipioSlug: "charata",
      organismo: "",
      tema: "",
      fechaISO: "",
      estado: "en-plazo",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      textoPedido: "",
      fechaRespuestaISO: "",
      respuestaResumen: "",
      nivelVerificacion: 1,
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const unsub = subscribeAuthState((u) => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const cargarPedidos = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/pedidos", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando pedidos"); return }
      const data = await res.json()
      setPedidos(data.pedidos ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) cargarPedidos()
  }, [user, cargarPedidos])

  // ---------------------------------------------------------------------------
  // Dialog open helpers
  // ---------------------------------------------------------------------------

  function abrirCrear() {
    setEditingId(null)
    reset({
      municipioSlug: "charata",
      organismo: "",
      tema: "",
      fechaISO: "",
      estado: "en-plazo",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      textoPedido: "",
      fechaRespuestaISO: "",
      respuestaResumen: "",
      nivelVerificacion: 1,
    })
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  function abrirEditar(pedido: PedidoAdmin) {
    setEditingId(pedido.id)
    reset({
      municipioSlug: pedido.municipioSlug as PedidoFormValues["municipioSlug"],
      organismo: pedido.organismo,
      tema: pedido.tema,
      fechaISO: pedido.fechaISO,
      estado: pedido.estado as PedidoFormValues["estado"],
      estadoEditorial: pedido.estadoEditorial as PedidoFormValues["estadoEditorial"],
      visibilidadPublica: pedido.visibilidadPublica,
      textoPedido: pedido.textoPedido ?? "",
      fechaRespuestaISO: pedido.fechaRespuestaISO ?? "",
      respuestaResumen: pedido.respuestaResumen ?? "",
      nivelVerificacion: pedido.nivelVerificacion ?? 1,
    })
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function onSubmit(values: PedidoFormValues) {
    setErrorGuardar(null)
    setGuardando(true)
    try {
      const headers = await authHeaders()
      const url = editingId ? `/api/admin/pedidos/${editingId}` : "/api/admin/pedidos"
      const method = editingId ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorGuardar(data.error ?? "Error guardando pedido")
        return
      }
      setDialogOpen(false)
      await cargarPedidos()
    } catch {
      setErrorGuardar("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  async function handleEliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/pedidos/${id}`, { method: "DELETE", headers })
      setPedidos((prev) => prev.filter((p) => p.id !== id))
    } catch {
      setErrorGlobal("Error eliminando pedido")
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle visibilidad pública
  // ---------------------------------------------------------------------------

  async function handleToggleVisibilidad(pedido: PedidoAdmin) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibilidadPublica: !pedido.visibilidadPublica }),
      })
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === pedido.id ? { ...p, visibilidadPublica: !pedido.visibilidadPublica } : p
        )
      )
    } catch {
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  // ---------------------------------------------------------------------------
  // Auth guards
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const visibilidadValue = watch("visibilidadPublica")

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Pedidos de Información</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Title + new button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestión de pedidos</h1>
          <Button onClick={abrirCrear}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo pedido
          </Button>
        </div>

        {/* Global error */}
        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        {/* Table card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} registrado{pedidos.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pedidos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No hay pedidos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Organismo</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Tema</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Editorial</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidos.map((pedido) => {
                      const est = badgeEstado(pedido.estado)
                      const ed = badgeEditorial(pedido.estadoEditorial)
                      return (
                        <TableRow key={pedido.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatFecha(pedido.fechaISO)}
                          </TableCell>
                          <TableCell className="font-medium max-w-[180px] truncate">
                            {pedido.organismo}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {municipioLabel(pedido.municipioSlug)}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-sm">
                            {pedido.tema}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${est.className}`}
                            >
                              {est.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ed.variant} className="text-xs">
                              {ed.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Toggle visibilidad */}
                              <Button
                                variant="ghost"
                                size="sm"
                                title={
                                  pedido.visibilidadPublica
                                    ? "Ocultar del sitio público"
                                    : "Publicar en sitio público"
                                }
                                onClick={() => handleToggleVisibilidad(pedido)}
                              >
                                <span
                                  className={`text-xs font-medium ${
                                    pedido.visibilidadPublica
                                      ? "text-green-600"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {pedido.visibilidadPublica ? "Visible" : "Oculto"}
                                </span>
                              </Button>

                              {/* Edit */}
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar pedido"
                                onClick={() => abrirEditar(pedido)}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>

                              {/* Delete */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Eliminar pedido"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      ¿Eliminar pedido?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es irreversible. Se eliminará el pedido sobre{" "}
                                      <strong>{pedido.tema}</strong> dirigido a{" "}
                                      <strong>{pedido.organismo}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleEliminar(pedido.id)}
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Create / Edit Dialog                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar pedido" : "Nuevo pedido de información"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modificá los datos del pedido y guardá los cambios."
                : "Completá los datos del nuevo pedido de acceso a la información."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            {/* Row: municipio + organismo */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* 1. municipioSlug */}
              <div className="space-y-1.5">
                <Label htmlFor="municipioSlug">Municipio</Label>
                <Select
                  value={watch("municipioSlug")}
                  onValueChange={(v) =>
                    setValue("municipioSlug", v as PedidoFormValues["municipioSlug"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="municipioSlug">
                    <SelectValue placeholder="Seleccioná municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS.map((m) => (
                      <SelectItem key={m.slug} value={m.slug}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipioSlug && (
                  <p className="text-xs text-destructive">{errors.municipioSlug.message}</p>
                )}
              </div>

              {/* 2. organismo */}
              <div className="space-y-1.5">
                <Label htmlFor="organismo">Organismo</Label>
                <Input
                  id="organismo"
                  placeholder="Ej: Municipalidad de Charata"
                  {...register("organismo")}
                />
                {errors.organismo && (
                  <p className="text-xs text-destructive">{errors.organismo.message}</p>
                )}
              </div>
            </div>

            {/* 3. tema */}
            <div className="space-y-1.5">
              <Label htmlFor="tema">Tema del pedido</Label>
              <Input
                id="tema"
                placeholder="Ej: Contrataciones directas 2024"
                {...register("tema")}
              />
              {errors.tema && (
                <p className="text-xs text-destructive">{errors.tema.message}</p>
              )}
            </div>

            {/* Row: fecha + estado */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* 4. fechaISO */}
              <div className="space-y-1.5">
                <Label htmlFor="fechaISO">Fecha del pedido</Label>
                <Input id="fechaISO" type="date" {...register("fechaISO")} />
                {errors.fechaISO && (
                  <p className="text-xs text-destructive">{errors.fechaISO.message}</p>
                )}
              </div>

              {/* 5. estado */}
              <div className="space-y-1.5">
                <Label htmlFor="estado">Estado del pedido</Label>
                <Select
                  value={watch("estado")}
                  onValueChange={(v) =>
                    setValue("estado", v as PedidoFormValues["estado"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Seleccioná estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-plazo">En plazo</SelectItem>
                    <SelectItem value="respondido-completo">Respondido completo</SelectItem>
                    <SelectItem value="respondido-parcial">Respondido parcial</SelectItem>
                    <SelectItem value="sin-respuesta">Sin respuesta</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-xs text-destructive">{errors.estado.message}</p>
                )}
              </div>
            </div>

            {/* Row: estadoEditorial + nivelVerificacion */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* 6. estadoEditorial */}
              <div className="space-y-1.5">
                <Label htmlFor="estadoEditorial">Estado editorial</Label>
                <Select
                  value={watch("estadoEditorial")}
                  onValueChange={(v) =>
                    setValue("estadoEditorial", v as PedidoFormValues["estadoEditorial"], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="estadoEditorial">
                    <SelectValue placeholder="Seleccioná estado editorial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="review">En revisión</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.estadoEditorial && (
                  <p className="text-xs text-destructive">{errors.estadoEditorial.message}</p>
                )}
              </div>

              {/* 11. nivelVerificacion */}
              <div className="space-y-1.5">
                <Label htmlFor="nivelVerificacion">Nivel de verificación</Label>
                <Select
                  value={String(watch("nivelVerificacion") ?? 1)}
                  onValueChange={(v) =>
                    setValue("nivelVerificacion", Number(v), { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="nivelVerificacion">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 — Sin verificar</SelectItem>
                    <SelectItem value="2">2 — Verificación inicial</SelectItem>
                    <SelectItem value="3">3 — Verificado con documento</SelectItem>
                    <SelectItem value="4">4 — Verificado con fuente</SelectItem>
                    <SelectItem value="5">5 — Totalmente confirmado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nivelVerificacion && (
                  <p className="text-xs text-destructive">{errors.nivelVerificacion.message}</p>
                )}
              </div>
            </div>

            {/* 7. visibilidadPublica */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="visibilidadPublica"
                checked={visibilidadValue}
                onCheckedChange={(checked) =>
                  setValue("visibilidadPublica", Boolean(checked), { shouldValidate: true })
                }
              />
              <Label htmlFor="visibilidadPublica" className="cursor-pointer">
                Visible en el sitio público
              </Label>
            </div>

            {/* 8. textoPedido */}
            <div className="space-y-1.5">
              <Label htmlFor="textoPedido">Texto del pedido (opcional)</Label>
              <Textarea
                id="textoPedido"
                placeholder="Transcripción o resumen del texto enviado al organismo…"
                rows={4}
                {...register("textoPedido")}
              />
              {errors.textoPedido && (
                <p className="text-xs text-destructive">{errors.textoPedido.message}</p>
              )}
            </div>

            {/* Row: fechaRespuesta */}
            <div className="space-y-1.5">
              <Label htmlFor="fechaRespuestaISO">Fecha de respuesta (opcional)</Label>
              <Input id="fechaRespuestaISO" type="date" {...register("fechaRespuestaISO")} />
              {errors.fechaRespuestaISO && (
                <p className="text-xs text-destructive">{errors.fechaRespuestaISO.message}</p>
              )}
            </div>

            {/* 10. respuestaResumen */}
            <div className="space-y-1.5">
              <Label htmlFor="respuestaResumen">Resumen de la respuesta (opcional)</Label>
              <Textarea
                id="respuestaResumen"
                placeholder="Resumen público de lo respondido por el organismo…"
                rows={3}
                {...register("respuestaResumen")}
              />
              {errors.respuestaResumen && (
                <p className="text-xs text-destructive">{errors.respuestaResumen.message}</p>
              )}
            </div>

            {/* Error general */}
            {errorGuardar && (
              <p className="text-sm text-destructive">{errorGuardar}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Guardar cambios" : "Crear pedido"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
