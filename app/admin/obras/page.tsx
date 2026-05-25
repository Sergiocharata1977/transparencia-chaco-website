"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Loader2, LogOut, Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { logoutAdmin, subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ObraAdmin {
  id: string
  municipio: string
  municipioSlug: string
  nombre: string
  descripcion: string
  tipo: string
  estado: string
  estadoEditorial: string
  visibilidadPublica: boolean
  ubicacionTexto?: string
  origenFondos?: string
  ejecucion?: string
  responsableInformado?: string
  contratista?: string
  presupuestoInformado?: string
  fechaInicioISO?: string
  fechaFinISO?: string
  fuenteInformacion?: string
  nivelVerificacion?: number
}

// ─── Zod schema ───────────────────────────────────────────────────────────────

const obraFormSchema = z.object({
  municipioSlug: z.string().min(1, "Seleccioná un municipio"),
  nombre: z.string().min(3, "Mínimo 3 caracteres").max(150),
  descripcion: z.string().min(10, "Mínimo 10 caracteres").max(1000),
  tipo: z.enum(["pavimento", "ripio", "iluminacion", "cloacas", "edificio-publico", "obra-hidraulica", "plaza", "parque", "otro"]),
  estado: z.enum(["anunciada", "iniciada", "en-ejecucion", "paralizada", "finalizada", "sin-informacion"]),
  estadoEditorial: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
  ubicacionTexto: z.string().max(200).optional(),
  origenFondos: z.enum(["municipal", "provincial", "nacional", "mixto", "desconocido"]).optional(),
  ejecucion: z.enum(["administracion-propia", "empresa-contratista", "ejecucion-provincial", "ejecucion-nacional", "desconocido"]).optional(),
  responsableInformado: z.string().max(100).optional(),
  contratista: z.string().max(100).optional(),
  presupuestoInformado: z.string().max(50).optional(),
  fechaInicioISO: z.string().optional(),
  fechaFinISO: z.string().optional(),
  fuenteInformacion: z.string().max(200).optional(),
  nivelVerificacion: z.coerce.number().int().min(1).max(5).default(1),
})

type ObraForm = z.infer<typeof obraFormSchema>

// ─── Constants ────────────────────────────────────────────────────────────────


const TIPOS_OBRA = [
  { value: "pavimento", label: "Pavimento" },
  { value: "ripio", label: "Ripio" },
  { value: "iluminacion", label: "Iluminación" },
  { value: "cloacas", label: "Cloacas" },
  { value: "edificio-publico", label: "Edificio público" },
  { value: "obra-hidraulica", label: "Obra hidráulica" },
  { value: "plaza", label: "Plaza" },
  { value: "parque", label: "Parque" },
  { value: "otro", label: "Otro" },
] as const

const ESTADOS_OBRA = [
  { value: "anunciada", label: "Anunciada" },
  { value: "iniciada", label: "Iniciada" },
  { value: "en-ejecucion", label: "En ejecución" },
  { value: "paralizada", label: "Paralizada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "sin-informacion", label: "Sin información" },
] as const

const ESTADOS_EDITORIAL = [
  { value: "draft", label: "Borrador" },
  { value: "review", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
] as const

const ORIGENES_FONDOS = [
  { value: "municipal", label: "Municipal" },
  { value: "provincial", label: "Provincial" },
  { value: "nacional", label: "Nacional" },
  { value: "mixto", label: "Mixto" },
  { value: "desconocido", label: "Desconocido" },
] as const

const TIPOS_EJECUCION = [
  { value: "administracion-propia", label: "Administración propia" },
  { value: "empresa-contratista", label: "Empresa contratista" },
  { value: "ejecucion-provincial", label: "Ejecución provincial" },
  { value: "ejecucion-nacional", label: "Ejecución nacional" },
  { value: "desconocido", label: "Desconocido" },
] as const

const DEFAULT_FORM: ObraForm = {
  municipioSlug: "charata",
  nombre: "",
  descripcion: "",
  tipo: "pavimento",
  estado: "anunciada",
  estadoEditorial: "draft",
  visibilidadPublica: false,
  ubicacionTexto: "",
  origenFondos: undefined,
  ejecucion: undefined,
  responsableInformado: "",
  contratista: "",
  presupuestoInformado: "",
  fechaInicioISO: "",
  fechaFinISO: "",
  fuenteInformacion: "",
  nivelVerificacion: 1,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

function municipioLabel(slug: string, lista: Ciudad[]): string {
  return lista.find(c => c.slug === slug)?.nombre ?? slug
}

// ─── Badge helpers ────────────────────────────────────────────────────────────

function BadgeEditorial({ estado }: { estado: string }) {
  if (estado === "draft") return <Badge variant="secondary">Borrador</Badge>
  if (estado === "review") return <Badge className="bg-yellow-100 text-yellow-800">Revisión</Badge>
  if (estado === "published") return <Badge className="bg-green-100 text-green-800">Publicado</Badge>
  if (estado === "archived") return <Badge className="bg-red-100 text-red-800">Archivado</Badge>
  return <Badge variant="secondary">{estado}</Badge>
}

function BadgeEstadoObra({ estado }: { estado: string }) {
  if (estado === "finalizada") return <Badge className="bg-green-100 text-green-800">Finalizada</Badge>
  if (estado === "en-ejecucion") return <Badge className="bg-blue-100 text-blue-800">En ejecución</Badge>
  if (estado === "paralizada") return <Badge className="bg-red-100 text-red-800">Paralizada</Badge>
  return <Badge variant="secondary">{ESTADOS_OBRA.find(e => e.value === estado)?.label ?? estado}</Badge>
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminObrasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [obras, setObras] = useState<ObraAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState<ObraAdmin | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ObraForm>({
    resolver: zodResolver(obraFormSchema),
    defaultValues: DEFAULT_FORM,
  })

  // ── Auth guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ── Data loading ──────────────────────────────────────────────────────────

  const cargarObras = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/obras", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando obras"); return }
      const data = await res.json()
      setObras(data.obras ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarObras()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarObras])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleGuardar(values: ObraForm) {
    setErrorForm(null)
    setGuardando(true)
    try {
      const headers = await authHeaders()
      const payload = {
        ...values,
        municipio: municipioLabel(values.municipioSlug, ciudades),
      }

      let res: Response
      if (modoEdicion !== null) {
        res = await fetch(`/api/admin/obras/${modoEdicion.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/admin/obras", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setErrorForm(data.error ?? "Error guardando obra")
        return
      }

      setDialogOpen(false)
      setModoEdicion(null)
      reset(DEFAULT_FORM)
      await cargarObras()
    } catch {
      setErrorForm("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  function abrirDialogNueva() {
    setModoEdicion(null)
    reset(DEFAULT_FORM)
    setErrorForm(null)
    setDialogOpen(true)
  }

  function abrirDialogEditar(obra: ObraAdmin) {
    setModoEdicion(obra)
    reset({
      municipioSlug: obra.municipioSlug as ObraForm["municipioSlug"],
      nombre: obra.nombre,
      descripcion: obra.descripcion,
      tipo: obra.tipo as ObraForm["tipo"],
      estado: obra.estado as ObraForm["estado"],
      estadoEditorial: obra.estadoEditorial as ObraForm["estadoEditorial"],
      visibilidadPublica: obra.visibilidadPublica,
      ubicacionTexto: obra.ubicacionTexto ?? "",
      origenFondos: obra.origenFondos as ObraForm["origenFondos"],
      ejecucion: obra.ejecucion as ObraForm["ejecucion"],
      responsableInformado: obra.responsableInformado ?? "",
      contratista: obra.contratista ?? "",
      presupuestoInformado: obra.presupuestoInformado ?? "",
      fechaInicioISO: obra.fechaInicioISO ?? "",
      fechaFinISO: obra.fechaFinISO ?? "",
      fuenteInformacion: obra.fuenteInformacion ?? "",
      nivelVerificacion: obra.nivelVerificacion ?? 1,
    })
    setErrorForm(null)
    setDialogOpen(true)
  }

  async function handleToggleVisibilidad(obra: ObraAdmin) {
    const nueva = !obra.visibilidadPublica
    // Optimistic update
    setObras(prev => prev.map(o => o.id === obra.id ? { ...o, visibilidadPublica: nueva } : o))
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/obras/${obra.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibilidadPublica: nueva }),
      })
    } catch {
      // Revert on error
      setObras(prev => prev.map(o => o.id === obra.id ? { ...o, visibilidadPublica: !nueva } : o))
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  async function handleEliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/obras/${id}`, { method: "DELETE", headers })
      setObras(prev => prev.filter(o => o.id !== id))
    } catch {
      setErrorGlobal("Error eliminando obra")
    }
  }

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  // ── Auth loading state ────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Obras Públicas</span>
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
          <h1 className="text-2xl font-bold">Gestión de obras públicas</h1>

          <Dialog open={dialogOpen} onOpenChange={open => {
            setDialogOpen(open)
            if (!open) { setModoEdicion(null); reset(DEFAULT_FORM); setErrorForm(null) }
          }}>
            <DialogTrigger asChild>
              <Button onClick={abrirDialogNueva}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva obra
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{modoEdicion ? "Editar obra" : "Nueva obra"}</DialogTitle>
                <DialogDescription>
                  {modoEdicion
                    ? "Modificá los datos de la obra y guardá los cambios."
                    : "Completá los datos para registrar una nueva obra pública."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(handleGuardar)} className="space-y-4 py-2">
                {/* municipioSlug */}
                <div className="space-y-1.5">
                  <Label htmlFor="municipioSlug">Municipio *</Label>
                  <Controller
                    name="municipioSlug"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="municipioSlug" className="w-full">
                          <SelectValue placeholder="Seleccionar municipio" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciudades.map(c => (
                            <SelectItem key={c.slug} value={c.slug}>{c.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.municipioSlug && <p className="text-xs text-destructive">{errors.municipioSlug.message}</p>}
                </div>

                {/* nombre */}
                <div className="space-y-1.5">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" placeholder="Ej: Pavimentación Av. San Martín" {...register("nombre")} />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>

                {/* descripcion */}
                <div className="space-y-1.5">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea id="descripcion" placeholder="Descripción de la obra..." rows={3} {...register("descripcion")} />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                {/* tipo */}
                <div className="space-y-1.5">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Controller
                    name="tipo"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="tipo" className="w-full">
                          <SelectValue placeholder="Tipo de obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_OBRA.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
                </div>

                {/* estado */}
                <div className="space-y-1.5">
                  <Label htmlFor="estado">Estado de la obra *</Label>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="estado" className="w-full">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_OBRA.map(e => (
                            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estado && <p className="text-xs text-destructive">{errors.estado.message}</p>}
                </div>

                {/* estadoEditorial */}
                <div className="space-y-1.5">
                  <Label htmlFor="estadoEditorial">Estado editorial *</Label>
                  <Controller
                    name="estadoEditorial"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="estadoEditorial" className="w-full">
                          <SelectValue placeholder="Estado editorial" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_EDITORIAL.map(e => (
                            <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.estadoEditorial && <p className="text-xs text-destructive">{errors.estadoEditorial.message}</p>}
                </div>

                {/* visibilidadPublica */}
                <div className="flex items-center gap-2">
                  <Controller
                    name="visibilidadPublica"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="visibilidadPublica"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="visibilidadPublica" className="cursor-pointer">Visible al público</Label>
                </div>

                {/* ── Campos opcionales ─────────────────────────────── */}
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm font-medium text-muted-foreground">Campos opcionales</p>

                  {/* ubicacionTexto */}
                  <div className="space-y-1.5">
                    <Label htmlFor="ubicacionTexto">Ubicación</Label>
                    <Input id="ubicacionTexto" placeholder="Ej: Entre calle 9 de Julio y Belgrano" {...register("ubicacionTexto")} />
                  </div>

                  {/* origenFondos */}
                  <div className="space-y-1.5">
                    <Label htmlFor="origenFondos">Origen de fondos</Label>
                    <Controller
                      name="origenFondos"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={v => field.onChange(v || undefined)}>
                          <SelectTrigger id="origenFondos" className="w-full">
                            <SelectValue placeholder="Seleccionar origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {ORIGENES_FONDOS.map(o => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* ejecucion */}
                  <div className="space-y-1.5">
                    <Label htmlFor="ejecucion">Tipo de ejecución</Label>
                    <Controller
                      name="ejecucion"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value ?? ""} onValueChange={v => field.onChange(v || undefined)}>
                          <SelectTrigger id="ejecucion" className="w-full">
                            <SelectValue placeholder="Seleccionar ejecución" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_EJECUCION.map(e => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* responsableInformado */}
                  <div className="space-y-1.5">
                    <Label htmlFor="responsableInformado">Responsable informado</Label>
                    <Input id="responsableInformado" placeholder="Nombre del responsable" {...register("responsableInformado")} />
                  </div>

                  {/* contratista */}
                  <div className="space-y-1.5">
                    <Label htmlFor="contratista">Contratista</Label>
                    <Input id="contratista" placeholder="Empresa o contratista" {...register("contratista")} />
                  </div>

                  {/* presupuestoInformado */}
                  <div className="space-y-1.5">
                    <Label htmlFor="presupuestoInformado">Presupuesto informado</Label>
                    <Input id="presupuestoInformado" placeholder="Ej: $5.000.000" {...register("presupuestoInformado")} />
                  </div>

                  {/* fechas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fechaInicioISO">Fecha de inicio</Label>
                      <Input id="fechaInicioISO" type="date" {...register("fechaInicioISO")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fechaFinISO">Fecha de fin</Label>
                      <Input id="fechaFinISO" type="date" {...register("fechaFinISO")} />
                    </div>
                  </div>

                  {/* nivelVerificacion */}
                  <div className="space-y-1.5">
                    <Label htmlFor="nivelVerificacion">Nivel de verificación (1-5)</Label>
                    <Controller
                      name="nivelVerificacion"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={String(field.value)}
                          onValueChange={v => field.onChange(Number(v))}
                        >
                          <SelectTrigger id="nivelVerificacion" className="w-full">
                            <SelectValue placeholder="Nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.nivelVerificacion && <p className="text-xs text-destructive">{errors.nivelVerificacion.message}</p>}
                  </div>

                  {/* fuenteInformacion */}
                  <div className="space-y-1.5">
                    <Label htmlFor="fuenteInformacion">Fuente de información</Label>
                    <Input id="fuenteInformacion" placeholder="URL o descripción de la fuente" {...register("fuenteInformacion")} />
                  </div>
                </div>

                {errorForm && (
                  <p className="text-sm text-destructive">{errorForm}</p>
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
                    {modoEdicion ? "Guardar cambios" : "Crear obra"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {obras.length} obra{obras.length !== 1 ? "s" : ""} registrada{obras.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : obras.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No hay obras registradas.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Editorial</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {obras.map(obra => (
                      <TableRow key={obra.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{obra.nombre}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {municipioLabel(obra.municipioSlug, ciudades)}
                        </TableCell>
                        <TableCell className="text-muted-foreground capitalize">
                          {TIPOS_OBRA.find(t => t.value === obra.tipo)?.label ?? obra.tipo}
                        </TableCell>
                        <TableCell>
                          <BadgeEstadoObra estado={obra.estado} />
                        </TableCell>
                        <TableCell>
                          <BadgeEditorial estado={obra.estadoEditorial} />
                        </TableCell>
                        <TableCell>
                          {obra.visibilidadPublica
                            ? <Eye className="h-4 w-4 text-green-600" />
                            : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar obra"
                              onClick={() => abrirDialogEditar(obra)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Toggle visibilidad */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title={obra.visibilidadPublica ? "Ocultar al público" : "Publicar al público"}
                              onClick={() => handleToggleVisibilidad(obra)}
                            >
                              {obra.visibilidadPublica
                                ? <EyeOff className="h-4 w-4 text-amber-600" />
                                : <Eye className="h-4 w-4 text-green-600" />}
                            </Button>

                            {/* Eliminar */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Eliminar obra">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar obra?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es irreversible. Se eliminará permanentemente{" "}
                                    <strong>{obra.nombre}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleEliminar(obra.id)}
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
    </div>
  )
}
