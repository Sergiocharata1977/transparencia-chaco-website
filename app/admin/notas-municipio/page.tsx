"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
import { NOTA_TIPO_LABELS, NOTA_ESTADO_LABELS, type NotaTipo, type NotaEstado } from "@/types/notas"
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

interface NotaAdmin {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia?: string
  tipo: NotaTipo
  titulo: string
  descripcion: string
  destinatario: string
  fechaEnvioISO?: string
  estado: NotaEstado
  respuesta?: string
  fechaRespuestaISO?: string
  archivoUrl?: string
  publico: boolean
}

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const notaFormSchema = z.object({
  ciudadSlug: z.string().min(1, "Seleccioná una ciudad"),
  tipo: z.enum(["pedido_informacion", "nota_administrativa", "solicitud_vecinal", "reclamo_formal"]),
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(200),
  descripcion: z.string().min(10, "Mínimo 10 caracteres").max(2000),
  destinatario: z.string().min(2, "Mínimo 2 caracteres").max(150),
  fechaEnvioISO: z.string().optional(),
  estado: z.enum(["borrador", "enviada", "respondida", "vencida", "archivada"]).default("borrador"),
  respuesta: z.string().max(2000).optional(),
  fechaRespuestaISO: z.string().optional(),
  archivoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  publico: z.boolean().default(false),
})

type NotaFormValues = z.infer<typeof notaFormSchema>

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

function badgeEstadoNota(estado: NotaEstado): { label: string; className: string } {
  const label = NOTA_ESTADO_LABELS[estado] ?? estado
  switch (estado) {
    case "respondida":
      return { label, className: "bg-green-100 text-green-800 border-green-200" }
    case "enviada":
      return { label, className: "bg-blue-100 text-blue-800 border-blue-200" }
    case "vencida":
      return { label, className: "bg-red-100 text-red-800 border-red-200" }
    case "archivada":
      return { label, className: "bg-gray-100 text-gray-600 border-gray-200" }
    case "borrador":
    default:
      return { label, className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
  }
}

const FORM_DEFAULTS: NotaFormValues = {
  ciudadSlug: "charata",
  tipo: "pedido_informacion",
  titulo: "",
  descripcion: "",
  destinatario: "",
  fechaEnvioISO: "",
  estado: "borrador",
  respuesta: "",
  fechaRespuestaISO: "",
  archivoUrl: "",
  publico: false,
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminNotasMunicipioPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [notas, setNotas] = useState<NotaAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<NotaFormValues>({
    resolver: zodResolver(notaFormSchema),
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

  const cargarNotas = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/notas-municipio", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando notas"); return }
      const data = await res.json()
      setNotas(data.notas ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarNotas()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarNotas])

  // ── Dialog helpers ──────────────────────────────────────────────────────

  function abrirCrear() {
    setEditingId(null)
    reset(FORM_DEFAULTS)
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  function abrirEditar(nota: NotaAdmin) {
    setEditingId(nota.id)
    reset({
      ciudadSlug: nota.ciudadSlug,
      tipo: nota.tipo,
      titulo: nota.titulo,
      descripcion: nota.descripcion,
      destinatario: nota.destinatario,
      fechaEnvioISO: nota.fechaEnvioISO ?? "",
      estado: nota.estado,
      respuesta: nota.respuesta ?? "",
      fechaRespuestaISO: nota.fechaRespuestaISO ?? "",
      archivoUrl: nota.archivoUrl ?? "",
      publico: nota.publico,
    })
    setErrorGuardar(null)
    setDialogOpen(true)
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function onSubmit(values: NotaFormValues) {
    setErrorGuardar(null)
    setGuardando(true)
    try {
      const ciudad = ciudades.find(c => c.slug === values.ciudadSlug)
      const payload = {
        ...values,
        fechaEnvioISO: values.fechaEnvioISO || undefined,
        fechaRespuestaISO: values.fechaRespuestaISO || undefined,
        ciudadNombre: ciudad?.nombre ?? values.ciudadSlug,
        departamento: ciudad?.departamento ?? undefined,
        provincia: ciudad?.provincia ?? "Chaco",
      }
      const headers = await authHeaders()
      const url = editingId ? `/api/admin/notas-municipio/${editingId}` : "/api/admin/notas-municipio"
      const method = editingId ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) {
        setErrorGuardar(data.error ?? "Error guardando la nota")
        return
      }
      setDialogOpen(false)
      await cargarNotas()
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
      await fetch(`/api/admin/notas-municipio/${id}`, { method: "DELETE", headers })
      setNotas((prev) => prev.filter((n) => n.id !== id))
    } catch {
      setErrorGlobal("Error eliminando la nota")
    }
  }

  async function handleTogglePublico(nota: NotaAdmin) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/notas-municipio/${nota.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ publico: !nota.publico }),
      })
      setNotas((prev) =>
        prev.map((n) => (n.id === nota.id ? { ...n, publico: !nota.publico } : n))
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
            <h1 className="text-2xl font-bold">Notas al Municipio</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pedidos de información, notas administrativas, solicitudes vecinales y reclamos formales
            </p>
          </div>
          <Button onClick={abrirCrear}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva nota
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
              {notas.length} nota{notas.length !== 1 ? "s" : ""} registrada{notas.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : notas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No hay notas registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha envío</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Destinatario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.map((nota) => {
                      const est = badgeEstadoNota(nota.estado)
                      return (
                        <TableRow key={nota.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatFecha(nota.fechaEnvioISO)}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {NOTA_TIPO_LABELS[nota.tipo] ?? nota.tipo}
                          </TableCell>
                          <TableCell className="font-medium max-w-[220px] truncate">
                            {nota.titulo}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {nota.ciudadNombre}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-sm">
                            {nota.destinatario}
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
                                title={nota.publico ? "Ocultar del sitio público" : "Publicar en sitio público"}
                                onClick={() => handleTogglePublico(nota)}
                              >
                                <span
                                  className={`text-xs font-medium ${
                                    nota.publico ? "text-green-600" : "text-muted-foreground"
                                  }`}
                                >
                                  {nota.publico ? "Pública" : "Interna"}
                                </span>
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar nota"
                                onClick={() => abrirEditar(nota)}
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Eliminar nota">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar nota?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es irreversible. Se eliminará la nota{" "}
                                      <strong>{nota.titulo}</strong> dirigida a{" "}
                                      <strong>{nota.destinatario}</strong>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleEliminar(nota.id)}
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
            <DialogTitle>{editingId ? "Editar nota" : "Nueva nota al municipio"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modificá los datos de la nota y guardá los cambios."
                : "Completá los datos de la nota, pedido o solicitud enviada al municipio."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            {/* Row: ciudad + tipo */}
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
                <Label htmlFor="tipo">Tipo de nota</Label>
                <Select
                  value={watch("tipo")}
                  onValueChange={(v) => setValue("tipo", v as NotaFormValues["tipo"], { shouldValidate: true })}
                >
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Seleccioná tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(NOTA_TIPO_LABELS) as NotaTipo[]).map((t) => (
                      <SelectItem key={t} value={t}>{NOTA_TIPO_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-xs text-destructive">{errors.tipo.message}</p>
                )}
              </div>
            </div>

            {/* titulo */}
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="Ej: Pedido de información sobre licitación de pavimento"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            {/* Row: destinatario + fecha envío */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="destinatario">Destinatario</Label>
                <Input
                  id="destinatario"
                  placeholder="Ej: Intendencia de Charata"
                  {...register("destinatario")}
                />
                {errors.destinatario && (
                  <p className="text-xs text-destructive">{errors.destinatario.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fechaEnvioISO">Fecha de envío (opcional)</Label>
                <Input id="fechaEnvioISO" type="date" {...register("fechaEnvioISO")} />
                {errors.fechaEnvioISO && (
                  <p className="text-xs text-destructive">{errors.fechaEnvioISO.message}</p>
                )}
              </div>
            </div>

            {/* estado */}
            <div className="space-y-1.5">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={watch("estado")}
                onValueChange={(v) => setValue("estado", v as NotaFormValues["estado"], { shouldValidate: true })}
              >
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccioná estado" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(NOTA_ESTADO_LABELS) as NotaEstado[]).map((e) => (
                    <SelectItem key={e} value={e}>{NOTA_ESTADO_LABELS[e]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estado && (
                <p className="text-xs text-destructive">{errors.estado.message}</p>
              )}
            </div>

            {/* descripcion */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Contenido o resumen de la nota enviada…"
                rows={4}
                {...register("descripcion")}
              />
              {errors.descripcion && (
                <p className="text-xs text-destructive">{errors.descripcion.message}</p>
              )}
            </div>

            {/* respuesta */}
            <div className="space-y-1.5">
              <Label htmlFor="respuesta">Respuesta recibida (opcional)</Label>
              <Textarea
                id="respuesta"
                placeholder="Resumen de la respuesta del municipio…"
                rows={3}
                {...register("respuesta")}
              />
              {errors.respuesta && (
                <p className="text-xs text-destructive">{errors.respuesta.message}</p>
              )}
            </div>

            {/* Row: fecha respuesta + archivo */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fechaRespuestaISO">Fecha de respuesta (opcional)</Label>
                <Input id="fechaRespuestaISO" type="date" {...register("fechaRespuestaISO")} />
                {errors.fechaRespuestaISO && (
                  <p className="text-xs text-destructive">{errors.fechaRespuestaISO.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="archivoUrl">URL del archivo (opcional)</Label>
                <Input
                  id="archivoUrl"
                  placeholder="https://…"
                  {...register("archivoUrl")}
                />
                {errors.archivoUrl && (
                  <p className="text-xs text-destructive">{errors.archivoUrl.message}</p>
                )}
              </div>
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
                {editingId ? "Guardar cambios" : "Crear nota"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
