"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, LogOut, Pencil, Plus, Trash2 } from "lucide-react"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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

// ─── tipos locales ────────────────────────────────────────────────────────────

interface ProveedorAdmin {
  id: string
  nombre: string
  rubro: string
  ciudad: string
  ciudadSlug: string
  organismoContratante: string
  tipoContratacion: string
  estadoCumplimiento: string
  estadoEditorial: string
  visibilidadPublica: boolean
  objeto?: string
  monto?: string
  periodo?: string
  fuenteDocumental?: string
  semaforo?: string
}

// ─── schema ───────────────────────────────────────────────────────────────────

const proveedorFormSchema = z.object({
  nombre: z.string().min(2).max(150),
  rubro: z.string().min(2).max(100),
  ciudadSlug: z.enum(["charata", "las-brenas", "corzuela", "presidencia-roque-saenz-pena"]),
  organismoContratante: z.string().min(2).max(150),
  tipoContratacion: z.enum(["licitacion", "contratacion-directa", "concurso", "convenio", "desconocido"]),
  estadoCumplimiento: z.enum(["sin-evaluar", "en-ejecucion", "cumplido", "observado"]).default("sin-evaluar"),
  estadoEditorial: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
  objeto: z.string().max(500).optional(),
  monto: z.string().max(50).optional(),
  periodo: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  semaforo: z.enum(["verde", "amarillo", "rojo", "gris"]).optional(),
})

type ProveedorFormValues = z.infer<typeof proveedorFormSchema>

// ─── constantes ──────────────────────────────────────────────────────────────

const MUNICIPIOS = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
]

const TIPOS_CONTRATACION: { value: string; label: string }[] = [
  { value: "licitacion", label: "Licitación" },
  { value: "contratacion-directa", label: "Contratación directa" },
  { value: "concurso", label: "Concurso" },
  { value: "convenio", label: "Convenio" },
  { value: "desconocido", label: "Desconocido" },
]

const ESTADOS_CUMPLIMIENTO: { value: string; label: string }[] = [
  { value: "sin-evaluar", label: "Sin evaluar" },
  { value: "en-ejecucion", label: "En ejecución" },
  { value: "cumplido", label: "Cumplido" },
  { value: "observado", label: "Observado" },
]

const ESTADOS_EDITORIAL: { value: string; label: string }[] = [
  { value: "draft", label: "Borrador" },
  { value: "review", label: "En revisión" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Archivado" },
]

const SEMAFOROS: { value: string; label: string }[] = [
  { value: "verde", label: "Verde" },
  { value: "amarillo", label: "Amarillo" },
  { value: "rojo", label: "Rojo" },
  { value: "gris", label: "Gris" },
]

// ─── helpers de auth ─────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

// ─── helpers de badge ────────────────────────────────────────────────────────

function BadgeCumplimiento({ estado }: { estado: string }) {
  const map: Record<string, { label: string; className: string }> = {
    cumplido: { label: "Cumplido", className: "bg-green-100 text-green-800 border-green-200" },
    "en-ejecucion": { label: "En ejecución", className: "bg-blue-100 text-blue-800 border-blue-200" },
    observado: { label: "Observado", className: "bg-red-100 text-red-800 border-red-200" },
    "sin-evaluar": { label: "Sin evaluar", className: "bg-gray-100 text-gray-700 border-gray-200" },
  }
  const cfg = map[estado] ?? { label: estado, className: "bg-gray-100 text-gray-700 border-gray-200" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function BadgeSemaforo({ semaforo }: { semaforo?: string }) {
  if (!semaforo) return <span className="text-muted-foreground text-xs">—</span>
  const map: Record<string, { label: string; className: string }> = {
    verde: { label: "Verde", className: "bg-green-100 text-green-800 border-green-200" },
    amarillo: { label: "Amarillo", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    rojo: { label: "Rojo", className: "bg-red-100 text-red-800 border-red-200" },
    gris: { label: "Gris", className: "bg-gray-100 text-gray-700 border-gray-200" },
  }
  const cfg = map[semaforo] ?? { label: semaforo, className: "bg-gray-100 text-gray-700 border-gray-200" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function ciudadLabel(slug: string): string {
  return MUNICIPIOS.find(m => m.slug === slug)?.label ?? slug
}

// ─── componente principal ─────────────────────────────────────────────────────

export default function AdminProveedoresPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [proveedores, setProveedores] = useState<ProveedorAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  // dialog crear/editar
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editando, setEditando] = useState<ProveedorAdmin | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  const router = useRouter()

  const form = useForm<ProveedorFormValues>({
    resolver: zodResolver(proveedorFormSchema),
    defaultValues: {
      nombre: "",
      rubro: "",
      ciudadSlug: "charata",
      organismoContratante: "",
      tipoContratacion: "desconocido",
      estadoCumplimiento: "sin-evaluar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      objeto: "",
      monto: "",
      periodo: "",
      fuenteDocumental: "",
      semaforo: undefined,
    },
  })

  // ── auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ── cargar proveedores ────────────────────────────────────────────────────

  const cargarProveedores = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/proveedores", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando proveedores"); return }
      const data = await res.json()
      setProveedores(data.proveedores ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) cargarProveedores()
  }, [user, cargarProveedores])

  // ── abrir dialog ──────────────────────────────────────────────────────────

  function abrirCrear() {
    setEditando(null)
    setErrorForm(null)
    form.reset({
      nombre: "",
      rubro: "",
      ciudadSlug: "charata",
      organismoContratante: "",
      tipoContratacion: "desconocido",
      estadoCumplimiento: "sin-evaluar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      objeto: "",
      monto: "",
      periodo: "",
      fuenteDocumental: "",
      semaforo: undefined,
    })
    setDialogOpen(true)
  }

  function abrirEditar(p: ProveedorAdmin) {
    setEditando(p)
    setErrorForm(null)
    form.reset({
      nombre: p.nombre,
      rubro: p.rubro,
      ciudadSlug: p.ciudadSlug as ProveedorFormValues["ciudadSlug"],
      organismoContratante: p.organismoContratante,
      tipoContratacion: p.tipoContratacion as ProveedorFormValues["tipoContratacion"],
      estadoCumplimiento: p.estadoCumplimiento as ProveedorFormValues["estadoCumplimiento"],
      estadoEditorial: p.estadoEditorial as ProveedorFormValues["estadoEditorial"],
      visibilidadPublica: p.visibilidadPublica,
      objeto: p.objeto ?? "",
      monto: p.monto ?? "",
      periodo: p.periodo ?? "",
      fuenteDocumental: p.fuenteDocumental ?? "",
      semaforo: (p.semaforo as ProveedorFormValues["semaforo"]) ?? undefined,
    })
    setDialogOpen(true)
  }

  // ── guardar (crear o editar) ───────────────────────────────────────────────

  async function handleGuardar(values: ProveedorFormValues) {
    setErrorForm(null)
    setGuardando(true)
    try {
      const headers = await authHeaders()
      const ciudad = ciudadLabel(values.ciudadSlug)
      const payload = { ...values, ciudad }

      const res = editando
        ? await fetch(`/api/admin/proveedores/${editando.id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/proveedores", {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          })

      const data = await res.json()
      if (!res.ok) {
        setErrorForm(data.error ?? "Error guardando proveedor")
        return
      }

      setDialogOpen(false)
      await cargarProveedores()
    } catch {
      setErrorForm("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  // ── eliminar ──────────────────────────────────────────────────────────────

  async function handleEliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/proveedores/${id}`, { method: "DELETE", headers })
      setProveedores(prev => prev.filter(p => p.id !== id))
    } catch {
      setErrorGlobal("Error eliminando proveedor")
    }
  }

  // ── logout ────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  // ── render guards ─────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20">
      {/* header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Proveedores del Estado</span>
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
          <h1 className="text-2xl font-bold">Gestión de proveedores</h1>

          {/* dialog crear/editar */}
          <Dialog open={dialogOpen} onOpenChange={open => { if (!open) setDialogOpen(false) }}>
            <DialogTrigger asChild>
              <Button onClick={abrirCrear}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editando ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
                <DialogDescription>
                  {editando
                    ? "Modificá los datos del proveedor y guardá los cambios."
                    : "Completá los datos del proveedor del Estado."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleGuardar)} className="space-y-4 py-2">

                  {/* nombre */}
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre / Razón social</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Constructora del Norte S.A." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* rubro */}
                  <FormField
                    control={form.control}
                    name="rubro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rubro</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Construcción, Tecnología, Salud…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ciudadSlug */}
                  <FormField
                    control={form.control}
                    name="ciudadSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipio</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccioná un municipio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MUNICIPIOS.map(m => (
                              <SelectItem key={m.slug} value={m.slug}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* organismoContratante */}
                  <FormField
                    control={form.control}
                    name="organismoContratante"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organismo contratante</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Municipalidad de Charata" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* tipoContratacion */}
                  <FormField
                    control={form.control}
                    name="tipoContratacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de contratación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccioná el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIPOS_CONTRATACION.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* estadoCumplimiento */}
                  <FormField
                    control={form.control}
                    name="estadoCumplimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de cumplimiento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccioná el estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ESTADOS_CUMPLIMIENTO.map(e => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* estadoEditorial */}
                  <FormField
                    control={form.control}
                    name="estadoEditorial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado editorial</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccioná el estado editorial" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ESTADOS_EDITORIAL.map(e => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* visibilidadPublica */}
                  <FormField
                    control={form.control}
                    name="visibilidadPublica"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer font-normal">
                          Visible en el sitio público
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {/* objeto */}
                  <FormField
                    control={form.control}
                    name="objeto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objeto del contrato <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descripción breve de la obra, servicio o suministro contratado…"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* monto */}
                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: $12.500.000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* periodo */}
                  <FormField
                    control={form.control}
                    name="periodo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: 2024-01 / 2024-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* fuenteDocumental */}
                  <FormField
                    control={form.control}
                    name="fuenteDocumental"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente documental <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Resolución 123/2024, Portal de compras…" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* semaforo */}
                  <FormField
                    control={form.control}
                    name="semaforo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semáforo <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sin asignar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SEMAFOROS.map(s => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      {editando ? "Guardar cambios" : "Crear proveedor"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* error global */}
        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        {/* tabla */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-muted-foreground font-normal">
              {proveedores.length} proveedor{proveedores.length !== 1 ? "es" : ""} registrado{proveedores.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : proveedores.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No hay proveedores registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Organismo</TableHead>
                      <TableHead>Tipo contratación</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Cumplimiento</TableHead>
                      <TableHead>Semáforo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proveedores.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {ciudadLabel(p.ciudadSlug)}
                        </TableCell>
                        <TableCell className="text-sm">{p.organismoContratante}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {TIPOS_CONTRATACION.find(t => t.value === p.tipoContratacion)?.label ?? p.tipoContratacion}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.monto ?? "—"}
                        </TableCell>
                        <TableCell>
                          <BadgeCumplimiento estado={p.estadoCumplimiento} />
                        </TableCell>
                        <TableCell>
                          <BadgeSemaforo semaforo={p.semaforo} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* editar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Editar proveedor"
                              onClick={() => abrirEditar(p)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>

                            {/* eliminar */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Eliminar proveedor">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es irreversible. Se eliminará el registro de{" "}
                                    <strong>{p.nombre}</strong>.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => handleEliminar(p.id)}
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
