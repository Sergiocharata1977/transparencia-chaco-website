"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Tipos locales ─────────────────────────────────────────────────────────────

interface MedioAdmin {
  id: string
  nombre: string
  ciudadPrincipal: string
  ciudadSlug: string
  tipo: string
  estado: string
  estadoEditorial: string
  visibilidadPublica: boolean
  sitioWeb?: string
  descripcion?: string
  recibePautaOficial?: boolean
  semaforo?: string
}

interface PautaAdmin {
  id: string
  medioId: string
  medioNombre: string
  organismo: string
  municipio: string
  municipioSlug: string
  periodo: string
  estadoVerificacion: string
  estadoEditorial: string
  visibilidadPublica: boolean
  monto?: string
  concepto?: string
  numeroDocumento?: string
  fuenteDocumental?: string
}

// ─── Schemas Zod ───────────────────────────────────────────────────────────────

const medioFormSchema = z.object({
  nombre: z.string().min(2).max(100),
  ciudadSlug: z.string().min(1, "Seleccioná una ciudad"),
  tipo: z.enum(["radio", "portal-web", "canal-tv", "streaming", "grafica", "red-social", "otro"]),
  estado: z.enum(["activo", "inactivo", "sin-verificar"]).default("sin-verificar"),
  estadoEditorial: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
  sitioWeb: z.string().optional(),
  descripcion: z.string().max(500).optional(),
  recibePautaOficial: z.boolean().optional(),
  semaforo: z.enum(["verde", "amarillo", "rojo", "gris"]).optional(),
})

const pautaFormSchema = z.object({
  medioId: z.string().min(1, "Requerido"),
  medioNombre: z.string().min(2).max(100),
  organismo: z.string().min(2).max(150),
  municipioSlug: z.string().min(1, "Seleccioná un municipio"),
  periodo: z.string().min(3).max(50),
  estadoVerificacion: z
    .enum(["sin-verificar", "con-documento", "confirmado", "observado"])
    .default("sin-verificar"),
  estadoEditorial: z.enum(["draft", "review", "published", "archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
  monto: z.string().max(50).optional(),
  concepto: z.string().max(300).optional(),
  numeroDocumento: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
})

type MedioFormValues = z.infer<typeof medioFormSchema>
type PautaFormValues = z.infer<typeof pautaFormSchema>

// ─── Constantes ────────────────────────────────────────────────────────────────


// ─── Auth helper ───────────────────────────────────────────────────────────────

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

// ─── Badge semáforo ────────────────────────────────────────────────────────────

function SemaforoBadge({ semaforo }: { semaforo?: string }) {
  if (!semaforo) return <span className="text-muted-foreground text-xs">—</span>
  const variant =
    semaforo === "verde"
      ? "default"
      : semaforo === "amarillo"
      ? "outline"
      : semaforo === "rojo"
      ? "destructive"
      : "secondary"
  const label =
    semaforo === "verde"
      ? "Verde"
      : semaforo === "amarillo"
      ? "Amarillo"
      : semaforo === "rojo"
      ? "Rojo"
      : "Gris"
  const extraClass =
    semaforo === "verde"
      ? "bg-green-600 hover:bg-green-600 text-white border-green-600"
      : semaforo === "amarillo"
      ? "border-yellow-500 text-yellow-700"
      : ""
  return (
    <Badge variant={variant} className={extraClass}>
      {label}
    </Badge>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function AdminMediosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  // Estado medios
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [medios, setMedios] = useState<MedioAdmin[]>([])
  const [cargandoMedios, setCargandoMedios] = useState(false)
  const [dialogMedioOpen, setDialogMedioOpen] = useState(false)
  const [modoEdicionMedio, setModoEdicionMedio] = useState<MedioAdmin | null>(null)
  const [guardandoMedio, setGuardandoMedio] = useState(false)
  const [errorMedio, setErrorMedio] = useState<string | null>(null)

  // Estado pautas
  const [pautas, setPautas] = useState<PautaAdmin[]>([])
  const [cargandoPautas, setCargandoPautas] = useState(false)
  const [dialogPautaOpen, setDialogPautaOpen] = useState(false)
  const [modoEdicionPauta, setModoEdicionPauta] = useState<PautaAdmin | null>(null)
  const [guardandoPauta, setGuardandoPauta] = useState(false)
  const [errorPauta, setErrorPauta] = useState<string | null>(null)

  const router = useRouter()

  // ─── Formularios ──────────────────────────────────────────────────────────────

  const medioForm = useForm<MedioFormValues>({
    resolver: zodResolver(medioFormSchema),
    defaultValues: {
      nombre: "",
      ciudadSlug: "charata",
      tipo: "radio",
      estado: "sin-verificar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      sitioWeb: "",
      descripcion: "",
      recibePautaOficial: false,
      semaforo: "gris",
    },
  })

  const pautaForm = useForm<PautaFormValues>({
    resolver: zodResolver(pautaFormSchema),
    defaultValues: {
      medioId: "",
      medioNombre: "",
      organismo: "",
      municipioSlug: "charata",
      periodo: "",
      estadoVerificacion: "sin-verificar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      monto: "",
      concepto: "",
      numeroDocumento: "",
      fuenteDocumental: "",
    },
  })

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // ─── Carga de datos ───────────────────────────────────────────────────────────

  const cargarMedios = useCallback(async () => {
    setCargandoMedios(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/medios", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando medios"); return }
      const data = await res.json()
      setMedios(data.medios ?? data ?? [])
    } catch {
      setErrorGlobal("Error de red al cargar medios")
    } finally {
      setCargandoMedios(false)
    }
  }, [])

  const cargarPautas = useCallback(async () => {
    setCargandoPautas(true)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/pautas", { headers })
      if (!res.ok) return
      const data = await res.json()
      setPautas(data.pautas ?? data ?? [])
    } catch {
      // no bloquear UI
    } finally {
      setCargandoPautas(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarMedios()
      cargarPautas()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarMedios, cargarPautas])

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  // ─── CRUD Medios ──────────────────────────────────────────────────────────────

  function abrirNuevoMedio() {
    setModoEdicionMedio(null)
    medioForm.reset({
      nombre: "",
      ciudadSlug: "charata",
      tipo: "radio",
      estado: "sin-verificar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      sitioWeb: "",
      descripcion: "",
      recibePautaOficial: false,
      semaforo: "gris",
    })
    setErrorMedio(null)
    setDialogMedioOpen(true)
  }

  function abrirEditarMedio(medio: MedioAdmin) {
    setModoEdicionMedio(medio)
    medioForm.reset({
      nombre: medio.nombre,
      ciudadSlug: medio.ciudadSlug as MedioFormValues["ciudadSlug"],
      tipo: medio.tipo as MedioFormValues["tipo"],
      estado: medio.estado as MedioFormValues["estado"],
      estadoEditorial: medio.estadoEditorial as MedioFormValues["estadoEditorial"],
      visibilidadPublica: medio.visibilidadPublica,
      sitioWeb: medio.sitioWeb ?? "",
      descripcion: medio.descripcion ?? "",
      recibePautaOficial: medio.recibePautaOficial ?? false,
      semaforo: (medio.semaforo as MedioFormValues["semaforo"]) ?? "gris",
    })
    setErrorMedio(null)
    setDialogMedioOpen(true)
  }

  async function handleGuardarMedio(values: MedioFormValues) {
    setGuardandoMedio(true)
    setErrorMedio(null)
    try {
      const headers = await authHeaders()
      let res: Response
      if (modoEdicionMedio) {
        res = await fetch(`/api/admin/medios/${modoEdicionMedio.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(values),
        })
      } else {
        res = await fetch("/api/admin/medios", {
          method: "POST",
          headers,
          body: JSON.stringify(values),
        })
      }
      const data = await res.json()
      if (!res.ok) {
        setErrorMedio(data.error ?? "Error guardando medio")
        return
      }
      setDialogMedioOpen(false)
      await cargarMedios()
    } catch {
      setErrorMedio("Error de red")
    } finally {
      setGuardandoMedio(false)
    }
  }

  async function handleToggleVisibilidadMedio(id: string, actual: boolean) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/medios/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibilidadPublica: !actual }),
      })
      setMedios(prev => prev.map(m => m.id === id ? { ...m, visibilidadPublica: !actual } : m))
    } catch {
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  async function handleEliminarMedio(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/medios/${id}`, { method: "DELETE", headers })
      setMedios(prev => prev.filter(m => m.id !== id))
    } catch {
      setErrorGlobal("Error eliminando medio")
    }
  }

  // ─── CRUD Pautas ──────────────────────────────────────────────────────────────

  function abrirNuevaPauta() {
    setModoEdicionPauta(null)
    pautaForm.reset({
      medioId: "",
      medioNombre: "",
      organismo: "",
      municipioSlug: "charata",
      periodo: "",
      estadoVerificacion: "sin-verificar",
      estadoEditorial: "draft",
      visibilidadPublica: false,
      monto: "",
      concepto: "",
      numeroDocumento: "",
      fuenteDocumental: "",
    })
    setErrorPauta(null)
    setDialogPautaOpen(true)
  }

  function abrirEditarPauta(pauta: PautaAdmin) {
    setModoEdicionPauta(pauta)
    pautaForm.reset({
      medioId: pauta.medioId,
      medioNombre: pauta.medioNombre,
      organismo: pauta.organismo,
      municipioSlug: pauta.municipioSlug as PautaFormValues["municipioSlug"],
      periodo: pauta.periodo,
      estadoVerificacion: pauta.estadoVerificacion as PautaFormValues["estadoVerificacion"],
      estadoEditorial: pauta.estadoEditorial as PautaFormValues["estadoEditorial"],
      visibilidadPublica: pauta.visibilidadPublica,
      monto: pauta.monto ?? "",
      concepto: pauta.concepto ?? "",
      numeroDocumento: pauta.numeroDocumento ?? "",
      fuenteDocumental: pauta.fuenteDocumental ?? "",
    })
    setErrorPauta(null)
    setDialogPautaOpen(true)
  }

  async function handleGuardarPauta(values: PautaFormValues) {
    setGuardandoPauta(true)
    setErrorPauta(null)
    try {
      const headers = await authHeaders()
      let res: Response
      if (modoEdicionPauta) {
        res = await fetch(`/api/admin/pautas/${modoEdicionPauta.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(values),
        })
      } else {
        res = await fetch("/api/admin/pautas", {
          method: "POST",
          headers,
          body: JSON.stringify(values),
        })
      }
      const data = await res.json()
      if (!res.ok) {
        setErrorPauta(data.error ?? "Error guardando pauta")
        return
      }
      setDialogPautaOpen(false)
      await cargarPautas()
    } catch {
      setErrorPauta("Error de red")
    } finally {
      setGuardandoPauta(false)
    }
  }

  async function handleToggleVisibilidadPauta(id: string, actual: boolean) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/pautas/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ visibilidadPublica: !actual }),
      })
      setPautas(prev => prev.map(p => p.id === id ? { ...p, visibilidadPublica: !actual } : p))
    } catch {
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  async function handleEliminarPauta(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/pautas/${id}`, { method: "DELETE", headers })
      setPautas(prev => prev.filter(p => p.id !== id))
    } catch {
      setErrorGlobal("Error eliminando pauta")
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  function labelMunicipio(slug: string) {
    return ciudades.find(c => c.slug === slug)?.nombre ?? slug
  }

  // ─── Loading / guard ──────────────────────────────────────────────────────────

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Medios y Pautas</span>
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
        <h1 className="text-2xl font-bold mb-6">Medios de comunicación y Pautas oficiales</h1>

        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        <Tabs defaultValue="medios">
          <TabsList className="mb-6">
            <TabsTrigger value="medios">Medios</TabsTrigger>
            <TabsTrigger value="pautas">Pautas Oficiales</TabsTrigger>
          </TabsList>

          {/* ── Tab Medios ─────────────────────────────────────────────────── */}
          <TabsContent value="medios">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Medios registrados</h2>
              <Button onClick={abrirNuevoMedio}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo medio
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-muted-foreground font-normal">
                  {medios.length} medio{medios.length !== 1 ? "s" : ""} registrado{medios.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cargandoMedios ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : medios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No hay medios registrados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Ciudad</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Semáforo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Editorial</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medios.map(medio => (
                          <TableRow key={medio.id}>
                            <TableCell className="font-medium">{medio.nombre}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {labelMunicipio(medio.ciudadSlug)}
                            </TableCell>
                            <TableCell className="text-muted-foreground capitalize">
                              {medio.tipo}
                            </TableCell>
                            <TableCell>
                              <SemaforoBadge semaforo={medio.semaforo} />
                            </TableCell>
                            <TableCell>
                              <Badge variant={medio.estado === "activo" ? "default" : "secondary"}>
                                {medio.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{medio.estadoEditorial}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Editar medio"
                                  onClick={() => abrirEditarMedio(medio)}
                                >
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={medio.visibilidadPublica ? "Ocultar al público" : "Publicar"}
                                  onClick={() => handleToggleVisibilidadMedio(medio.id, medio.visibilidadPublica)}
                                >
                                  {medio.visibilidadPublica
                                    ? <Eye className="h-4 w-4 text-blue-600" />
                                    : <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  }
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Eliminar medio">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar medio?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción es irreversible. Se eliminará{" "}
                                        <strong>{medio.nombre}</strong> y todos sus datos asociados.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleEliminarMedio(medio.id)}
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
          </TabsContent>

          {/* ── Tab Pautas ─────────────────────────────────────────────────── */}
          <TabsContent value="pautas">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pautas oficiales</h2>
              <Button onClick={abrirNuevaPauta}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva pauta
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-muted-foreground font-normal">
                  {pautas.length} pauta{pautas.length !== 1 ? "s" : ""} registrada{pautas.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cargandoPautas ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : pautas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No hay pautas registradas.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Medio</TableHead>
                          <TableHead>Organismo</TableHead>
                          <TableHead>Municipio</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Verificación</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pautas.map(pauta => (
                          <TableRow key={pauta.id}>
                            <TableCell className="font-medium">{pauta.medioNombre}</TableCell>
                            <TableCell className="text-muted-foreground">{pauta.organismo}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {labelMunicipio(pauta.municipioSlug)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{pauta.periodo}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {pauta.monto ?? "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  pauta.estadoVerificacion === "confirmado"
                                    ? "default"
                                    : pauta.estadoVerificacion === "observado"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {pauta.estadoVerificacion}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Editar pauta"
                                  onClick={() => abrirEditarPauta(pauta)}
                                >
                                  <Pencil className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={pauta.visibilidadPublica ? "Ocultar al público" : "Publicar"}
                                  onClick={() => handleToggleVisibilidadPauta(pauta.id, pauta.visibilidadPublica)}
                                >
                                  {pauta.visibilidadPublica
                                    ? <Eye className="h-4 w-4 text-blue-600" />
                                    : <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  }
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Eliminar pauta">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Eliminar pauta?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción es irreversible. Se eliminará la pauta de{" "}
                                        <strong>{pauta.medioNombre}</strong> ({pauta.periodo}).
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => handleEliminarPauta(pauta.id)}
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
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Dialog Medio ─────────────────────────────────────────────────────── */}
      <Dialog open={dialogMedioOpen} onOpenChange={setDialogMedioOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoEdicionMedio ? "Editar medio" : "Nuevo medio"}
            </DialogTitle>
            <DialogDescription>
              {modoEdicionMedio
                ? `Editando: ${modoEdicionMedio.nombre}`
                : "Completá los datos del nuevo medio de comunicación."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={medioForm.handleSubmit(handleGuardarMedio)} className="space-y-4 py-2">
            {/* Nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="medio-nombre">Nombre *</Label>
              <Input
                id="medio-nombre"
                placeholder="Ej: Radio Municipal"
                {...medioForm.register("nombre")}
              />
              {medioForm.formState.errors.nombre && (
                <p className="text-xs text-destructive">{medioForm.formState.errors.nombre.message}</p>
              )}
            </div>

            {/* Ciudad */}
            <div className="space-y-1.5">
              <Label>Ciudad *</Label>
              <Select
                value={medioForm.watch("ciudadSlug")}
                onValueChange={v => medioForm.setValue("ciudadSlug", v as MedioFormValues["ciudadSlug"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select
                value={medioForm.watch("tipo")}
                onValueChange={v => medioForm.setValue("tipo", v as MedioFormValues["tipo"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de medio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="portal-web">Portal web</SelectItem>
                  <SelectItem value="canal-tv">Canal TV</SelectItem>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="grafica">Gráfica</SelectItem>
                  <SelectItem value="red-social">Red social</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select
                value={medioForm.watch("estado")}
                onValueChange={v => medioForm.setValue("estado", v as MedioFormValues["estado"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                  <SelectItem value="sin-verificar">Sin verificar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado editorial */}
            <div className="space-y-1.5">
              <Label>Estado editorial</Label>
              <Select
                value={medioForm.watch("estadoEditorial")}
                onValueChange={v => medioForm.setValue("estadoEditorial", v as MedioFormValues["estadoEditorial"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="review">En revisión</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Semáforo */}
            <div className="space-y-1.5">
              <Label>Semáforo</Label>
              <Select
                value={medioForm.watch("semaforo") ?? "gris"}
                onValueChange={v => medioForm.setValue("semaforo", v as MedioFormValues["semaforo"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verde">Verde</SelectItem>
                  <SelectItem value="amarillo">Amarillo</SelectItem>
                  <SelectItem value="rojo">Rojo</SelectItem>
                  <SelectItem value="gris">Gris</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sitio web */}
            <div className="space-y-1.5">
              <Label htmlFor="medio-sitioweb">Sitio web</Label>
              <Input
                id="medio-sitioweb"
                placeholder="https://..."
                {...medioForm.register("sitioWeb")}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="medio-descripcion">Descripción</Label>
              <Input
                id="medio-descripcion"
                placeholder="Breve descripción del medio"
                {...medioForm.register("descripcion")}
              />
            </div>

            {/* Recibe pauta */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="medio-recibePauta" className="cursor-pointer">
                Recibe pauta oficial
              </Label>
              <Switch
                id="medio-recibePauta"
                checked={medioForm.watch("recibePautaOficial") ?? false}
                onCheckedChange={v => medioForm.setValue("recibePautaOficial", v)}
              />
            </div>

            {/* Visibilidad pública */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="medio-visibilidad" className="cursor-pointer">
                Visibilidad pública
              </Label>
              <Switch
                id="medio-visibilidad"
                checked={medioForm.watch("visibilidadPublica")}
                onCheckedChange={v => medioForm.setValue("visibilidadPublica", v)}
              />
            </div>

            {errorMedio && (
              <p className="text-sm text-destructive">{errorMedio}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogMedioOpen(false)}
                disabled={guardandoMedio}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoMedio}>
                {guardandoMedio && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {modoEdicionMedio ? "Guardar cambios" : "Crear medio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Pauta ─────────────────────────────────────────────────────── */}
      <Dialog open={dialogPautaOpen} onOpenChange={setDialogPautaOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modoEdicionPauta ? "Editar pauta" : "Nueva pauta oficial"}
            </DialogTitle>
            <DialogDescription>
              {modoEdicionPauta
                ? `Editando pauta de ${modoEdicionPauta.medioNombre}`
                : "Registrá una nueva pauta de publicidad oficial."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={pautaForm.handleSubmit(handleGuardarPauta)} className="space-y-4 py-2">
            {/* Medio ID */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-medioid">ID del medio *</Label>
              <Input
                id="pauta-medioid"
                placeholder="ID del medio (Firestore)"
                {...pautaForm.register("medioId")}
              />
              {pautaForm.formState.errors.medioId && (
                <p className="text-xs text-destructive">{pautaForm.formState.errors.medioId.message}</p>
              )}
            </div>

            {/* Medio nombre */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-medionombre">Nombre del medio *</Label>
              <Input
                id="pauta-medionombre"
                placeholder="Ej: Radio Municipal"
                {...pautaForm.register("medioNombre")}
              />
              {pautaForm.formState.errors.medioNombre && (
                <p className="text-xs text-destructive">{pautaForm.formState.errors.medioNombre.message}</p>
              )}
            </div>

            {/* Organismo */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-organismo">Organismo *</Label>
              <Input
                id="pauta-organismo"
                placeholder="Ej: Municipalidad de Charata"
                {...pautaForm.register("organismo")}
              />
              {pautaForm.formState.errors.organismo && (
                <p className="text-xs text-destructive">{pautaForm.formState.errors.organismo.message}</p>
              )}
            </div>

            {/* Municipio */}
            <div className="space-y-1.5">
              <Label>Municipio *</Label>
              <Select
                value={pautaForm.watch("municipioSlug")}
                onValueChange={v => pautaForm.setValue("municipioSlug", v as PautaFormValues["municipioSlug"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná municipio" />
                </SelectTrigger>
                <SelectContent>
                  {ciudades.map(c => (
                    <SelectItem key={c.slug} value={c.slug}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-periodo">Período *</Label>
              <Input
                id="pauta-periodo"
                placeholder="Ej: Enero 2024"
                {...pautaForm.register("periodo")}
              />
              {pautaForm.formState.errors.periodo && (
                <p className="text-xs text-destructive">{pautaForm.formState.errors.periodo.message}</p>
              )}
            </div>

            {/* Monto */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-monto">Monto</Label>
              <Input
                id="pauta-monto"
                placeholder="Ej: $150.000"
                {...pautaForm.register("monto")}
              />
            </div>

            {/* Concepto */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-concepto">Concepto</Label>
              <Input
                id="pauta-concepto"
                placeholder="Descripción del servicio contratado"
                {...pautaForm.register("concepto")}
              />
            </div>

            {/* Número de documento */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-nrodoc">Número de documento</Label>
              <Input
                id="pauta-nrodoc"
                placeholder="Ej: Res. 123/2024"
                {...pautaForm.register("numeroDocumento")}
              />
            </div>

            {/* Fuente documental */}
            <div className="space-y-1.5">
              <Label htmlFor="pauta-fuente">Fuente documental</Label>
              <Input
                id="pauta-fuente"
                placeholder="URL o descripción de la fuente"
                {...pautaForm.register("fuenteDocumental")}
              />
            </div>

            {/* Estado verificación */}
            <div className="space-y-1.5">
              <Label>Estado de verificación</Label>
              <Select
                value={pautaForm.watch("estadoVerificacion")}
                onValueChange={v => pautaForm.setValue("estadoVerificacion", v as PautaFormValues["estadoVerificacion"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-verificar">Sin verificar</SelectItem>
                  <SelectItem value="con-documento">Con documento</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="observado">Observado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado editorial */}
            <div className="space-y-1.5">
              <Label>Estado editorial</Label>
              <Select
                value={pautaForm.watch("estadoEditorial")}
                onValueChange={v => pautaForm.setValue("estadoEditorial", v as PautaFormValues["estadoEditorial"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="review">En revisión</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibilidad pública */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="pauta-visibilidad" className="cursor-pointer">
                Visibilidad pública
              </Label>
              <Switch
                id="pauta-visibilidad"
                checked={pautaForm.watch("visibilidadPublica")}
                onCheckedChange={v => pautaForm.setValue("visibilidadPublica", v)}
              />
            </div>

            {errorPauta && (
              <p className="text-sm text-destructive">{errorPauta}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogPautaOpen(false)}
                disabled={guardandoPauta}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={guardandoPauta}>
                {guardandoPauta && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {modoEdicionPauta ? "Guardar cambios" : "Crear pauta"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
