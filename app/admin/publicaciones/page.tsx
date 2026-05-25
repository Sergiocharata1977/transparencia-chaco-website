"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { logoutAdmin, subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface PublicacionAdmin {
  id: string
  titulo: string
  extracto: string
  contenido: string
  categoria: string
  municipio: string
  municipioSlug: string
  estadoEditorial: string
  visibilidadPublica: boolean
  autor?: string
  imagen?: string
  createdAt?: unknown
  publishedAt?: unknown
}

// ─── Constants ───────────────────────────────────────────────────────────────


const CATEGORIAS = [
  { value: "obras", label: "Obras" },
  { value: "transparencia", label: "Transparencia" },
  { value: "reportes", label: "Reportes" },
  { value: "salud", label: "Salud" },
  { value: "seguridad", label: "Seguridad" },
  { value: "general", label: "General" },
]

const ESTADOS_EDITORIALES = [
  { value: "draft", label: "Borrador" },
  { value: "review", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
]

// ─── Zod schema ──────────────────────────────────────────────────────────────

const pubFormSchema = z.object({
  titulo: z.string().min(5).max(200),
  extracto: z.string().min(10, "Mínimo 10 caracteres").max(400),
  contenido: z.string().min(20, "Mínimo 20 caracteres").max(10000),
  categoria: z
    .enum(["obras", "transparencia", "reportes", "salud", "seguridad", "general"])
    .default("general"),
  municipioSlug: z.string().min(1, "Seleccioná un municipio"),
  estadoEditorial: z
    .enum(["draft", "review", "published", "archived"])
    .default("draft"),
  visibilidadPublica: z.boolean().default(false),
  autor: z.string().max(100).optional(),
  imagen: z.string().optional(),
})

type PubForm = z.infer<typeof pubFormSchema>

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

function formatFecha(value: unknown): string {
  if (!value) return "—"
  // Firestore Timestamp or ISO string
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }
  return "—"
}

function estadoBadge(estado: string) {
  switch (estado) {
    case "draft":
      return <Badge variant="secondary">Borrador</Badge>
    case "review":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
          En revisión
        </Badge>
      )
    case "published":
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          Publicado
        </Badge>
      )
    case "archived":
      return (
        <Badge className="bg-red-100 text-red-800 border border-red-200">
          Archivado
        </Badge>
      )
    default:
      return <Badge variant="secondary">{estado}</Badge>
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPublicacionesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [publicaciones, setPublicaciones] = useState<PublicacionAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<PubForm>({
    resolver: zodResolver(pubFormSchema),
    defaultValues: {
      titulo: "",
      extracto: "",
      contenido: "",
      categoria: "general",
      municipioSlug: "todos",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      autor: "",
      imagen: "",
    },
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = form

  // Watched values for counters
  const tituloVal = watch("titulo") ?? ""
  const extractoVal = watch("extracto") ?? ""
  const contenidoVal = watch("contenido") ?? ""

  // ── Data loading ─────────────────────────────────────────────────────────

  const cargarPublicaciones = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/publicaciones", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando publicaciones"); return }
      const data = await res.json()
      setPublicaciones(data.publicaciones ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  useEffect(() => {
    if (user) {
      cargarPublicaciones()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarPublicaciones])

  // ── Handlers ─────────────────────────────────────────────────────────────

  function openNueva() {
    setEditingId(null)
    reset({
      titulo: "",
      extracto: "",
      contenido: "",
      categoria: "general",
      municipioSlug: "todos",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      autor: "",
      imagen: "",
    })
    setErrorForm(null)
    setDialogOpen(true)
  }

  function openEditar(pub: PublicacionAdmin) {
    setEditingId(pub.id)
    reset({
      titulo: pub.titulo,
      extracto: pub.extracto,
      contenido: pub.contenido,
      categoria: pub.categoria as PubForm["categoria"],
      municipioSlug: pub.municipioSlug as PubForm["municipioSlug"],
      estadoEditorial: pub.estadoEditorial as PubForm["estadoEditorial"],
      visibilidadPublica: pub.visibilidadPublica,
      autor: pub.autor ?? "",
      imagen: pub.imagen ?? "",
    })
    setErrorForm(null)
    setDialogOpen(true)
  }

  const onSubmit = async (data: PubForm) => {
    setErrorForm(null)
    setGuardando(true)
    try {
      const municipioLabel =
        ciudades.find(c => c.slug === data.municipioSlug)?.nombre ?? data.municipioSlug
      const payload = { ...data, municipio: municipioLabel }
      const headers = await authHeaders()

      let res: Response
      if (editingId) {
        res = await fetch(`/api/admin/publicaciones/${editingId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/admin/publicaciones", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
      }

      const json = await res.json()
      if (!res.ok) {
        setErrorForm(json.error ?? "Error al guardar")
        return
      }

      setDialogOpen(false)
      await cargarPublicaciones()
    } catch {
      setErrorForm("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  async function handlePublicarRapido(id: string) {
    try {
      const headers = await authHeaders()
      const res = await fetch(`/api/admin/publicaciones/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estadoEditorial: "published", visibilidadPublica: true }),
      })
      if (!res.ok) { setErrorGlobal("Error al publicar"); return }
      setPublicaciones(prev =>
        prev.map(p =>
          p.id === id ? { ...p, estadoEditorial: "published", visibilidadPublica: true } : p
        )
      )
    } catch {
      setErrorGlobal("Error de red")
    }
  }

  async function handleToggleVisibilidad(pub: PublicacionAdmin) {
    try {
      const headers = await authHeaders()
      const res = await fetch(`/api/admin/publicaciones/${pub.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibilidadPublica: !pub.visibilidadPublica }),
      })
      if (!res.ok) { setErrorGlobal("Error actualizando visibilidad"); return }
      setPublicaciones(prev =>
        prev.map(p =>
          p.id === pub.id ? { ...p, visibilidadPublica: !pub.visibilidadPublica } : p
        )
      )
    } catch {
      setErrorGlobal("Error de red")
    }
  }

  async function handleEliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/publicaciones/${id}`, { method: "DELETE", headers })
      setPublicaciones(prev => prev.filter(p => p.id !== id))
    } catch {
      setErrorGlobal("Error eliminando publicación")
    }
  }

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  // ── Auth guard ───────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Publicaciones</span>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gestión de publicaciones</h1>
          <Button onClick={openNueva}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva publicación
          </Button>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        {/* Table card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {publicaciones.length} publicación{publicaciones.length !== 1 ? "es" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : publicaciones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No hay publicaciones registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publicaciones.map(pub => (
                      <TableRow key={pub.id}>
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {pub.titulo}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {pub.municipio}
                        </TableCell>
                        <TableCell className="text-sm capitalize">{pub.categoria}</TableCell>
                        <TableCell>{estadoBadge(pub.estadoEditorial)}</TableCell>
                        <TableCell>
                          {pub.visibilidadPublica ? (
                            <Badge className="bg-green-100 text-green-800 border border-green-200">
                              Sí
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFecha(pub.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar publicación"
                              onClick={() => openEditar(pub)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            {/* Publicar rápido — solo si estado es "review" */}
                            {pub.estadoEditorial === "review" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Publicar rápido"
                                onClick={() => handlePublicarRapido(pub.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}

                            {/* Toggle visibilidad */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title={pub.visibilidadPublica ? "Ocultar" : "Mostrar al público"}
                              onClick={() => handleToggleVisibilidad(pub)}
                            >
                              {pub.visibilidadPublica ? (
                                <Eye className="h-4 w-4 text-blue-600" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>

                            {/* Eliminar */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Eliminar publicación">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es irreversible. Se eliminará permanentemente{" "}
                                    <strong>{pub.titulo}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleEliminar(pub.id)}
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog — crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar publicación" : "Nueva publicación"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifica los campos y guarda los cambios."
                : "Completa los datos para crear una nueva publicación."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* Título */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="titulo">Título</Label>
                <span className="text-xs text-muted-foreground">{tituloVal.length}/200</span>
              </div>
              <Input
                id="titulo"
                placeholder="Título de la publicación"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            {/* Extracto */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="extracto">Extracto</Label>
                <span className="text-xs text-muted-foreground">{extractoVal.length}/400</span>
              </div>
              <Textarea
                id="extracto"
                placeholder="Breve descripción o resumen de la publicación"
                rows={3}
                {...register("extracto")}
              />
              {errors.extracto && (
                <p className="text-xs text-destructive">{errors.extracto.message}</p>
              )}
            </div>

            {/* Contenido */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="contenido">Contenido</Label>
                <span className="text-xs text-muted-foreground">{contenidoVal.length}/10000</span>
              </div>
              <Textarea
                id="contenido"
                placeholder="Contenido completo de la publicación"
                className="min-h-[200px]"
                {...register("contenido")}
              />
              {errors.contenido && (
                <p className="text-xs text-destructive">{errors.contenido.message}</p>
              )}
            </div>

            {/* Categoría + Municipio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select
                  defaultValue={form.getValues("categoria")}
                  onValueChange={val => setValue("categoria", val as PubForm["categoria"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && (
                  <p className="text-xs text-destructive">{errors.categoria.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Municipio</Label>
                <Select
                  defaultValue={form.getValues("municipioSlug")}
                  onValueChange={val => setValue("municipioSlug", val as PubForm["municipioSlug"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los municipios</SelectItem>
                    {ciudades.map(c => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.municipioSlug && (
                  <p className="text-xs text-destructive">{errors.municipioSlug.message}</p>
                )}
              </div>
            </div>

            {/* Estado editorial */}
            <div className="space-y-1.5">
              <Label>Estado editorial</Label>
              <Select
                defaultValue={form.getValues("estadoEditorial")}
                onValueChange={val =>
                  setValue("estadoEditorial", val as PubForm["estadoEditorial"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_EDITORIALES.map(e => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.estadoEditorial && (
                <p className="text-xs text-destructive">{errors.estadoEditorial.message}</p>
              )}
            </div>

            {/* Visibilidad pública */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="visibilidadPublica"
                checked={watch("visibilidadPublica")}
                onCheckedChange={checked =>
                  setValue("visibilidadPublica", checked === true)
                }
              />
              <Label htmlFor="visibilidadPublica" className="cursor-pointer">
                Visible al público
              </Label>
            </div>

            {/* Autor */}
            <div className="space-y-1.5">
              <Label htmlFor="autor">Autor (opcional)</Label>
              <Input
                id="autor"
                placeholder="Nombre del autor"
                {...register("autor")}
              />
              {errors.autor && (
                <p className="text-xs text-destructive">{errors.autor.message}</p>
              )}
            </div>

            {/* Imagen URL */}
            <div className="space-y-1.5">
              <Label htmlFor="imagen">URL de imagen (opcional)</Label>
              <Input
                id="imagen"
                placeholder="https://..."
                {...register("imagen")}
              />
              {errors.imagen && (
                <p className="text-xs text-destructive">{errors.imagen.message}</p>
              )}
            </div>

            {errorForm && (
              <p className="text-sm text-destructive">{errorForm}</p>
            )}

            <DialogFooter className="pt-2">
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
                {editingId ? "Guardar cambios" : "Crear publicación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
