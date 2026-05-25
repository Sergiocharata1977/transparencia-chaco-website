"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, LogOut, Pencil, Plus, Trash2, MapPin } from "lucide-react"
import { logoutAdmin, subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Ciudad {
  id: string
  slug: string
  nombre: string
  provincia: string
  activa: boolean
  descripcion?: string
  poblacion?: number
}

// ─── Zod schema ────────────────────────────────────────────────────────────────

const ciudadFormSchema = z.object({
  slug: z.string().min(2, "Mínimo 2 caracteres").max(60)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  provincia: z.string().min(2).max(60),
  activa: z.boolean().default(true),
  descripcion: z.string().max(500).optional(),
  poblacion: z.coerce.number().int().min(0).optional(),
})

type CiudadForm = z.infer<typeof ciudadFormSchema>

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function AdminCiudadesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const router = useRouter()

  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<Ciudad | null>(null)

  // ─── Auth guard ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ─── Carga de datos ───────────────────────────────────────────────────────────

  const cargarCiudades = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/ciudades", { headers })
      if (!res.ok) throw new Error("Error al cargar ciudades")
      const data = await res.json()
      setCiudades(data.ciudades ?? [])
    } catch {
      setError("No se pudieron cargar las ciudades.")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) cargarCiudades()
  }, [user, cargarCiudades])

  // ─── Form ─────────────────────────────────────────────────────────────────────

  const form = useForm<CiudadForm>({
    resolver: zodResolver(ciudadFormSchema),
    defaultValues: { slug: "", nombre: "", provincia: "Chaco", activa: true, descripcion: "", poblacion: undefined },
  })

  const { watch, setValue } = form
  const nombreWatch = watch("nombre")

  useEffect(() => {
    if (!editando && nombreWatch) {
      setValue("slug", slugify(nombreWatch), { shouldValidate: false })
    }
  }, [nombreWatch, editando, setValue])

  function abrirNueva() {
    setEditando(null)
    form.reset({ slug: "", nombre: "", provincia: "Chaco", activa: true, descripcion: "", poblacion: undefined })
    setDialogOpen(true)
  }

  function abrirEditar(ciudad: Ciudad) {
    setEditando(ciudad)
    form.reset({
      slug: ciudad.slug,
      nombre: ciudad.nombre,
      provincia: ciudad.provincia,
      activa: ciudad.activa,
      descripcion: ciudad.descripcion ?? "",
      poblacion: ciudad.poblacion,
    })
    setDialogOpen(true)
  }

  async function handleGuardar(valores: CiudadForm) {
    setGuardando(true)
    try {
      const headers = await authHeaders()
      if (editando) {
        const { slug: _slug, ...resto } = valores
        const res = await fetch(`/api/admin/ciudades/${editando.slug}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(resto),
        })
        if (!res.ok) throw new Error("Error al actualizar")
      } else {
        const res = await fetch("/api/admin/ciudades", {
          method: "POST",
          headers,
          body: JSON.stringify(valores),
        })
        if (!res.ok) {
          const data = await res.json()
          if (res.status === 409) throw new Error("Ya existe una ciudad con ese slug")
          throw new Error(data.error ?? "Error al crear")
        }
      }
      setDialogOpen(false)
      cargarCiudades()
    } catch (e) {
      form.setError("root", { message: e instanceof Error ? e.message : "Error desconocido" })
    } finally {
      setGuardando(false)
    }
  }

  async function handleToggleActiva(ciudad: Ciudad) {
    const original = ciudad.activa
    setCiudades(prev => prev.map(c => c.id === ciudad.id ? { ...c, activa: !c.activa } : c))
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/ciudades/${ciudad.slug}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ activa: !original }),
      })
    } catch {
      setCiudades(prev => prev.map(c => c.id === ciudad.id ? { ...c, activa: original } : c))
    }
  }

  async function handleEliminar(ciudad: Ciudad) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/ciudades/${ciudad.slug}`, { method: "DELETE", headers })
      cargarCiudades()
    } catch {
      setError("No se pudo eliminar la ciudad.")
    }
  }

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  // ─── Render guards ────────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!user) return null

  const activas = ciudades.filter(c => c.activa).length
  const inactivas = ciudades.filter(c => !c.activa).length

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
            </Link>
            <span className="text-white font-semibold text-sm hidden sm:block">
              Ciudades Cubiertas
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70 hidden sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Ciudades Cubiertas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestioná los municipios que monitorea el observatorio
            </p>
          </div>
          <Button onClick={abrirNueva} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva ciudad
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{ciudades.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{activas}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactivas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-muted-foreground">{inactivas}</p>
            </CardContent>
          </Card>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex gap-3 items-start">
          <MapPin className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <strong>Solo las ciudades activas</strong> aparecen en los filtros y formularios del sitio público y del panel admin.
            Podés agregar ciudades ahora y activarlas cuando el observatorio tenga cobertura real.
          </div>
        </div>

        {/* Tabla */}
        <Card>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ciudades.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay ciudades cargadas</p>
                <p className="text-sm mt-1">Agregá la primera ciudad con el botón de arriba</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Provincia</TableHead>
                    <TableHead>Población</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ciudades.map(ciudad => (
                    <TableRow key={ciudad.id}>
                      <TableCell className="font-medium">{ciudad.nombre}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{ciudad.slug}</TableCell>
                      <TableCell>{ciudad.provincia}</TableCell>
                      <TableCell>{ciudad.poblacion ? ciudad.poblacion.toLocaleString("es-AR") : "—"}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleToggleActiva(ciudad)}
                          title="Click para cambiar estado"
                        >
                          <Badge
                            className={ciudad.activa
                              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 cursor-pointer"
                            }
                            variant="outline"
                          >
                            {ciudad.activa ? "Activa" : "Inactiva"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirEditar(ciudad)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar ciudad?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará <strong>{ciudad.nombre}</strong> del listado.
                                  Los registros existentes con este municipio no se verán afectados,
                                  pero ya no podrán asignarse nuevos registros a esta ciudad.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleEliminar(ciudad)}
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
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar ciudad" : "Nueva ciudad"}</DialogTitle>
            <DialogDescription>
              {editando
                ? `Editando ${editando.nombre}`
                : "Agregá una nueva ciudad al observatorio"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleGuardar)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                {...form.register("nombre")}
                placeholder="Ej: Charata"
              />
              {form.formState.errors.nombre && (
                <p className="text-sm text-destructive">{form.formState.errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug (ID canónico) *
                {!editando && <span className="text-muted-foreground text-xs ml-2">— se genera automáticamente</span>}
              </Label>
              <Input
                id="slug"
                {...form.register("slug")}
                placeholder="ej: charata"
                readOnly={!!editando}
                className={editando ? "bg-muted text-muted-foreground" : ""}
              />
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia *</Label>
              <Input
                id="provincia"
                {...form.register("provincia")}
                placeholder="Chaco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poblacion">Población (hab.)</Label>
              <Input
                id="poblacion"
                type="number"
                min={0}
                {...form.register("poblacion")}
                placeholder="Ej: 45000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...form.register("descripcion")}
                placeholder="Breve descripción del municipio..."
                rows={2}
              />
            </div>

            <Controller
              name="activa"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="activa"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="activa" className="cursor-pointer">
                    Ciudad activa (aparece en filtros y formularios)
                  </Label>
                </div>
              )}
            />

            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={guardando}>
                {guardando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editando ? "Guardar cambios" : "Crear ciudad"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
