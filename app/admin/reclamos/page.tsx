"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
import {
  RECLAMO_ENTE_LABELS,
  RECLAMO_TIPO_LABELS,
  RECLAMO_ESTADO_LABELS,
  RECLAMO_PRIORIDAD_LABELS,
  type ReclamoEnte,
  type ReclamoTipo,
  type ReclamoEstado,
  type ReclamoPrioridad,
} from "@/types/reclamos"
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

interface ReclamoAdmin {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia?: string
  enteResponsable: ReclamoEnte
  tipo: ReclamoTipo
  titulo: string
  descripcion: string
  ubicacionTexto?: string
  estado: ReclamoEstado
  prioridad: ReclamoPrioridad
  publico: boolean
  respuestaOficial?: string
  createdAt?: string
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const reclamoFormSchema = z.object({
  ciudadSlug: z.string().min(1, "Seleccioná una ciudad"),
  enteResponsable: z.enum(["municipio", "hospital", "seguridad", "escuela", "servicios_publicos", "concejo", "otro"]),
  tipo: z.enum(["denuncia", "reclamo", "sugerencia", "alerta"]),
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(200),
  descripcion: z.string().min(10, "Mínimo 10 caracteres").max(2000),
  ubicacionTexto: z.string().max(200).optional(),
  estado: z.enum(["pendiente", "en_revision", "publicado", "derivado", "respondido", "rechazado"]).default("pendiente"),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
  publico: z.boolean().default(false),
  respuestaOficial: z.string().max(2000).optional(),
})

type ReclamoFormValues = z.infer<typeof reclamoFormSchema>

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
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function badgeEstadoReclamo(estado: ReclamoEstado): { label: string; className: string } {
  const label = RECLAMO_ESTADO_LABELS[estado] ?? estado
  switch (estado) {
    case "publicado":
      return { label, className: "bg-green-100 text-green-800 border-green-200" }
    case "respondido":
      return { label, className: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    case "en_revision":
      return { label, className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    case "derivado":
      return { label, className: "bg-purple-100 text-purple-800 border-purple-200" }
    case "rechazado":
      return { label, className: "bg-red-100 text-red-800 border-red-200" }
    case "pendiente":
    default:
      return { label, className: "bg-blue-100 text-blue-800 border-blue-200" }
  }
}

function badgePrioridad(prioridad: ReclamoPrioridad): { label: string; className: string } {
  const label = RECLAMO_PRIORIDAD_LABELS[prioridad] ?? prioridad
  switch (prioridad) {
    case "urgente":
      return { label, className: "bg-red-100 text-red-800 border-red-200" }
    case "alta":
      return { label, className: "bg-orange-100 text-orange-800 border-orange-200" }
    case "media":
      return { label, className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
    case "baja":
    default:
      return { label, className: "bg-gray-100 text-gray-600 border-gray-200" }
  }
}

const FORM_DEFAULTS: ReclamoFormValues = {
  ciudadSlug: "charata",
  enteResponsable: "municipio",
  tipo: "reclamo",
  titulo: "",
  descripcion: "",
  ubicacionTexto: "",
  estado: "pendiente",
  prioridad: "media",
  publico: false,
  respuestaOficial: "",
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminReclamosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [reclamos, setReclamos] = useState<ReclamoAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<ReclamoFormValues>({
    resolver: zodResolver(reclamoFormSchema),
    defaultValues: FORM_DEFAULTS,
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form

  // ── Auth ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeAuthState((u) => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ── Data fetching ───────────────────────────────────────────────────────

  const cargarReclamos = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/reclamos", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando reclamos"); return }
      const data = await res.json()
      setReclamos(data.reclamos ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarReclamos()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarReclamos])

  // ── Dialog helpers ──────────────────────────────────────────────────────

  function abrirCrear() {
    setEditingId(null)
    reset(FORM_DEFAULTS)
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  function abrirEditar(reclamo: ReclamoAdmin) {
    setEditingId(reclamo.id)
    reset({
      ciudadSlug: reclamo.ciudadSlug,
      enteResponsable: reclamo.enteResponsable,
      tipo: reclamo.tipo,
      titulo: reclamo.titulo,
      descripcion: reclamo.descripcion,
      ubicacionTexto: reclamo.ubicacionTexto ?? "",
      estado: reclamo.estado,
      prioridad: reclamo.prioridad,
      publico: reclamo.publico,
      respuestaOficial: reclamo.respuestaOficial ?? "",
    })
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function onSubmit(values: ReclamoFormValues) {
    setErrorGuardar(null)
    setGuardando(true)
    try {
      const ciudad = ciudades.find(c => c.slug === values.ciudadSlug)
      const payload = {
        ...values,
        ubicacionTexto: values.ubicacionTexto || undefined,
        respuestaOficial: values.respuestaOficial || undefined,
        ciudadNombre: ciudad?.nombre ?? values.ciudadSlug,
        departamento: ciudad?.departamento ?? undefined,
        provincia: ciudad?.provincia ?? "Chaco",
      }
      const headers = await authHeaders()
      const url = editingId ? `/api/admin/reclamos/${editingId}` : "/api/admin/reclamos"
      const method = editingId ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) {
        setErrorGuardar(data.error ?? "Error guardando el reclamo")
        return
      }
      setDialogOpen(false)
      await cargarReclamos()
    } catch {
      setErrorGuardar("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  // ── Delete + toggle público ─────────────────────────────────────────────

  async function handleEliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/reclamos/${id}`, { method: "DELETE", headers })
      setReclamos((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setErrorGlobal("Error eliminando el reclamo")
    }
  }

  async function handleTogglePublico(reclamo: ReclamoAdmin) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/reclamos/${reclamo.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ publico: !reclamo.publico }),
      })
      setReclamos((prev) =>
        prev.map((r) => (r.id === reclamo.id ? { ...r, publico: !reclamo.publico } : r))
      )
    } catch {
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  // ── Auth guards ─────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ── Render ──────────────────────────────────────────────────────────────

  const publicoValue = watch("publico")

  return (
    <>
      <main className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Reclamos por Ente</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Denuncias, reclamos, sugerencias y alertas ciudadanas clasificadas por organismo responsable
            </p>
          </div>
          <Button onClick={abrirCrear}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo reclamo
          </Button>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {reclamos.length} reclamo{reclamos.length !== 1 ? "s" : ""} registrado{reclamos.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reclamos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No hay reclamos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Ente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reclamos.map((reclamo) => {
                      const est = badgeEstadoReclamo(reclamo.estado)
                      const pri = badgePrioridad(reclamo.prioridad)
                      return (
                        <TableRow key={reclamo.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatFecha(reclamo.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium max-w-[220px] truncate">
                            {reclamo.titulo}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {reclamo.ciudadNombre}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {RECLAMO_ENTE_LABELS[reclamo.enteResponsable] ?? reclamo.enteResponsable}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {RECLAMO_TIPO_LABELS[reclamo.tipo] ?? reclamo.tipo}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${pri.className}`}>
                              {pri.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${est.className}`}>
                              {est.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                title={reclamo.publico ? "Ocultar del sitio público" : "Publicar en sitio público"}
                                onClick={() => handleTogglePublico(reclamo)}
                              >
                                <span
                                  className={`text-xs font-medium ${
                                    reclamo.publico ? "text-green-600" : "text-muted-foreground"
                                  }`}
                                >
                                  {reclamo.publico ? "Público" : "Interno"}
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar reclamo"
                                onClick={() => abrirEditar(reclamo)}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Eliminar reclamo">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar reclamo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es irreversible. Se eliminará el reclamo{" "}
                                      <strong>{reclamo.titulo}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleEliminar(reclamo.id)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar reclamo" : "Nuevo reclamo"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modificá los datos del reclamo y guardá los cambios."
                : "Registrá un reclamo ciudadano clasificado por ente responsable."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            {/* Row: ciudad + ente */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ciudadSlug">Ciudad / Municipio</Label>
                <Select
                  value={watch("ciudadSlug")}
                  onValueChange={(v) => setValue("ciudadSlug", v, { shouldValidate: true })}
                >
                  <SelectTrigger id="ciudadSlug">
                    <SelectValue placeholder="Seleccioná ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {ciudades.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.nombre}{c.departamento ? ` (${c.departamento})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ciudadSlug && (
                  <p className="text-xs text-destructive">{errors.ciudadSlug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="enteResponsable">Ente responsable</Label>
                <Select
                  value={watch("enteResponsable")}
                  onValueChange={(v) =>
                    setValue("enteResponsable", v as ReclamoFormValues["enteResponsable"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="enteResponsable">
                    <SelectValue placeholder="Seleccioná ente" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RECLAMO_ENTE_LABELS) as ReclamoEnte[]).map((e) => (
                      <SelectItem key={e} value={e}>{RECLAMO_ENTE_LABELS[e]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.enteResponsable && (
                  <p className="text-xs text-destructive">{errors.enteResponsable.message}</p>
                )}
              </div>
            </div>

            {/* Row: tipo + prioridad + estado */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={watch("tipo")}
                  onValueChange={(v) => setValue("tipo", v as ReclamoFormValues["tipo"], { shouldValidate: true })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RECLAMO_TIPO_LABELS) as ReclamoTipo[]).map((t) => (
                      <SelectItem key={t} value={t}>{RECLAMO_TIPO_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-xs text-destructive">{errors.tipo.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select
                  value={watch("prioridad")}
                  onValueChange={(v) =>
                    setValue("prioridad", v as ReclamoFormValues["prioridad"], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="prioridad">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RECLAMO_PRIORIDAD_LABELS) as ReclamoPrioridad[]).map((p) => (
                      <SelectItem key={p} value={p}>{RECLAMO_PRIORIDAD_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prioridad && (
                  <p className="text-xs text-destructive">{errors.prioridad.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={watch("estado")}
                  onValueChange={(v) => setValue("estado", v as ReclamoFormValues["estado"], { shouldValidate: true })}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RECLAMO_ESTADO_LABELS) as ReclamoEstado[]).map((e) => (
                      <SelectItem key={e} value={e}>{RECLAMO_ESTADO_LABELS[e]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-xs text-destructive">{errors.estado.message}</p>
                )}
              </div>
            </div>

            {/* titulo */}
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ej: Falta de insumos en la guardia del hospital"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            {/* descripcion */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalle del reclamo o denuncia…"
                rows={4}
                {...register("descripcion")}
              />
              {errors.descripcion && (
                <p className="text-xs text-destructive">{errors.descripcion.message}</p>
              )}
            </div>

            {/* ubicacion */}
            <div className="space-y-1.5">
              <Label htmlFor="ubicacionTexto">Ubicación (opcional)</Label>
              <Input
                id="ubicacionTexto"
                placeholder="Ej: Av. San Martín y calle 25 de Mayo"
                {...register("ubicacionTexto")}
              />
              {errors.ubicacionTexto && (
                <p className="text-xs text-destructive">{errors.ubicacionTexto.message}</p>
              )}
            </div>

            {/* respuestaOficial */}
            <div className="space-y-1.5">
              <Label htmlFor="respuestaOficial">Respuesta oficial (opcional)</Label>
              <Textarea
                id="respuestaOficial"
                placeholder="Respuesta del organismo responsable…"
                rows={3}
                {...register("respuestaOficial")}
              />
              {errors.respuestaOficial && (
                <p className="text-xs text-destructive">{errors.respuestaOficial.message}</p>
              )}
            </div>

            {/* publico */}
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="publico"
                checked={publicoValue}
                onCheckedChange={(checked) =>
                  setValue("publico", Boolean(checked), { shouldValidate: true })
                }
              />
              <Label htmlFor="publico" className="cursor-pointer">
                Visible en el sitio público
              </Label>
            </div>

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
                {editingId ? "Guardar cambios" : "Crear reclamo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
