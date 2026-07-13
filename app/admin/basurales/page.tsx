"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Plus, Radar, Trash2 } from "lucide-react"

import { getIdToken, subscribeAuthState, type User } from "@/lib/firebase/auth-client"
import { CIUDADES_FALLBACK, getCiudadesActivas, type Ciudad } from "@/lib/firebase/ciudades"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  BASURAL_ESTADO_VERIFICACION_LABELS,
  BASURAL_FUENTE_LABELS,
  type Basural,
  type BasuralEstadoVerificacion,
  type BasuralFuente,
} from "@/types/basurales"

type BasuralAdmin = Basural

interface BasuralForm {
  ciudadSlug: string
  nombre: string
  ubicacionTexto: string
  areaM2: string
  fechaDeteccionISO: string
  estadoVerificacion: BasuralEstadoVerificacion
  fuente: BasuralFuente
  evidenciaUrl: string
  fotoUrl: string
  observaciones: string
  publico: boolean
}

interface DeteccionForm {
  ciudadSlug: string
  fechaDesde: string
  fechaHasta: string
  lonMin: string
  latMin: string
  lonMax: string
  latMax: string
}

const today = new Date().toISOString().slice(0, 10)
const desdeDefault = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

const DEFAULT_FORM: BasuralForm = {
  ciudadSlug: "charata",
  nombre: "",
  ubicacionTexto: "",
  areaM2: "0",
  fechaDeteccionISO: today,
  estadoVerificacion: "candidato",
  fuente: "observatorio",
  evidenciaUrl: "",
  fotoUrl: "",
  observaciones: "",
  publico: false,
}

const DEFAULT_DETECCION: DeteccionForm = {
  ciudadSlug: "charata",
  fechaDesde: desdeDefault,
  fechaHasta: today,
  lonMin: "-61.24",
  latMin: "-27.24",
  lonMax: "-61.16",
  latMax: "-27.18",
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }
}

function ciudadBySlug(slug: string, ciudades: Ciudad[]): Ciudad | undefined {
  return ciudades.find((ciudad) => ciudad.slug === slug)
}

function numberFrom(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function estadoBadge(estado: BasuralEstadoVerificacion) {
  if (estado === "candidato") return <Badge className="bg-amber-100 text-amber-800">Candidato</Badge>
  if (estado === "erradicado") return <Badge className="bg-emerald-100 text-emerald-800">Erradicado</Badge>
  if (estado === "descartado") return <Badge variant="secondary">Descartado</Badge>
  return <Badge className="bg-red-100 text-red-800">{BASURAL_ESTADO_VERIFICACION_LABELS[estado]}</Badge>
}

export default function AdminBasuralesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [basurales, setBasurales] = useState<BasuralAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<BasuralForm>(DEFAULT_FORM)
  const [deteccion, setDeteccion] = useState<DeteccionForm>(DEFAULT_DETECCION)
  const [guardando, setGuardando] = useState(false)
  const [detectando, setDetectando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = subscribeAuthState((u) => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  const cargarBasurales = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/basurales", { headers: await authHeaders() })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error cargando basurales")
        return
      }
      setBasurales(data.basurales ?? [])
    } catch {
      setError("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarBasurales()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarBasurales])

  const resumen = useMemo(() => ({
    total: basurales.length,
    candidatos: basurales.filter((item) => item.estadoVerificacion === "candidato").length,
    verificados: basurales.filter((item) => item.estadoVerificacion === "verificado_foto" || item.estadoVerificacion === "verificado_campo").length,
    publicos: basurales.filter((item) => item.publico).length,
  }), [basurales])

  function setValue<K extends keyof BasuralForm>(key: K, value: BasuralForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setDeteccionValue<K extends keyof DeteccionForm>(key: K, value: DeteccionForm[K]) {
    setDeteccion((prev) => ({ ...prev, [key]: value }))
  }

  async function crearManual() {
    const ciudad = ciudadBySlug(form.ciudadSlug, ciudades)
    if (!ciudad) {
      setError("Selecciona una ciudad valida")
      return
    }

    setGuardando(true)
    setError(null)
    try {
      const payload = {
        ciudadSlug: ciudad.slug,
        ciudadNombre: ciudad.nombre,
        departamento: ciudad.departamento,
        provincia: ciudad.provincia,
        nombre: form.nombre || undefined,
        ubicacionTexto: form.ubicacionTexto || undefined,
        areaM2: numberFrom(form.areaM2),
        fechaDeteccionISO: form.fechaDeteccionISO,
        estadoVerificacion: form.estadoVerificacion,
        fuente: form.fuente,
        evidenciaUrl: form.evidenciaUrl || undefined,
        fotoUrl: form.fotoUrl || undefined,
        observaciones: form.observaciones || undefined,
        publico: form.publico,
      }
      const res = await fetch("/api/admin/basurales", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error guardando basural")
        return
      }
      setDialogOpen(false)
      setForm(DEFAULT_FORM)
      setMensaje("Basural creado")
      await cargarBasurales()
    } catch {
      setError("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  async function patchBasural(id: string, payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/basurales/${id}`, {
      method: "PATCH",
      headers: await authHeaders(),
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Error actualizando")
  }

  async function cambiarEstado(basural: BasuralAdmin, estadoVerificacion: BasuralEstadoVerificacion) {
    try {
      await patchBasural(basural.id, { estadoVerificacion })
      setBasurales((prev) => prev.map((item) => item.id === basural.id ? { ...item, estadoVerificacion } : item))
    } catch {
      setError("Error actualizando estado")
    }
  }

  async function togglePublico(basural: BasuralAdmin) {
    const publico = !basural.publico
    try {
      await patchBasural(basural.id, { publico })
      setBasurales((prev) => prev.map((item) => item.id === basural.id ? { ...item, publico } : item))
    } catch {
      setError("Error actualizando visibilidad")
    }
  }

  async function eliminar(id: string) {
    try {
      await fetch(`/api/admin/basurales/${id}`, { method: "DELETE", headers: await authHeaders() })
      setBasurales((prev) => prev.filter((item) => item.id !== id))
    } catch {
      setError("Error eliminando basural")
    }
  }

  async function ejecutarDeteccion() {
    const ciudad = ciudadBySlug(deteccion.ciudadSlug, ciudades)
    if (!ciudad) {
      setError("Selecciona una ciudad valida")
      return
    }

    setDetectando(true)
    setError(null)
    setMensaje(null)
    try {
      const payload = {
        ciudadSlug: ciudad.slug,
        ciudadNombre: ciudad.nombre,
        departamento: ciudad.departamento,
        provincia: ciudad.provincia,
        fechaDesde: deteccion.fechaDesde,
        fechaHasta: deteccion.fechaHasta,
        bbox: {
          lonMin: numberFrom(deteccion.lonMin),
          latMin: numberFrom(deteccion.latMin),
          lonMax: numberFrom(deteccion.lonMax),
          latMax: numberFrom(deteccion.latMax),
        },
      }
      const res = await fetch("/api/admin/deteccion/basurales", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Error ejecutando deteccion")
        return
      }
      setMensaje(`Deteccion lista: ${data.candidatosCreados ?? 0} candidatos nuevos, ${data.duplicados ?? 0} duplicados.`)
      await cargarBasurales()
    } catch {
      setError("Error de red")
    } finally {
      setDetectando(false)
    }
  }

  if (authChecking) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  if (!user) return null

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Basurales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Candidatos satelitales, verificacion humana y publicacion controlada.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nuevo manual</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader><DialogTitle>Nuevo basural</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Select value={form.ciudadSlug} onValueChange={(value) => setValue("ciudadSlug", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ciudades.map((ciudad) => <SelectItem key={ciudad.slug} value={ciudad.slug}>{ciudad.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setValue("nombre", e.target.value)} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Ubicacion</Label><Input value={form.ubicacionTexto} onChange={(e) => setValue("ubicacionTexto", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Area m2</Label><Input type="number" value={form.areaM2} onChange={(e) => setValue("areaM2", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Fecha deteccion</Label><Input type="date" value={form.fechaDeteccionISO} onChange={(e) => setValue("fechaDeteccionISO", e.target.value)} /></div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.estadoVerificacion} onValueChange={(value) => setValue("estadoVerificacion", value as BasuralEstadoVerificacion)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(BASURAL_ESTADO_VERIFICACION_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fuente</Label>
                <Select value={form.fuente} onValueChange={(value) => setValue("fuente", value as BasuralFuente)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(BASURAL_FUENTE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>URL evidencia</Label><Input value={form.evidenciaUrl} onChange={(e) => setValue("evidenciaUrl", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>URL foto</Label><Input value={form.fotoUrl} onChange={(e) => setValue("fotoUrl", e.target.value)} /></div>
              <div className="space-y-1.5 md:col-span-2"><Label>Observaciones</Label><Textarea rows={3} value={form.observaciones} onChange={(e) => setValue("observaciones", e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" checked={form.publico} onChange={(e) => setValue("publico", e.target.checked)} />
                Visible al publico
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={guardando}>Cancelar</Button>
              <Button onClick={crearManual} disabled={guardando}>{guardando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Crear</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}
      {mensaje ? <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">{mensaje}</div> : null}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-black">{resumen.total}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-black text-amber-700">{resumen.candidatos}</p><p className="text-sm text-muted-foreground">Candidatos</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-black text-red-700">{resumen.verificados}</p><p className="text-sm text-muted-foreground">Verificados</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-black text-emerald-700">{resumen.publicos}</p><p className="text-sm text-muted-foreground">Publicos</p></CardContent></Card>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Radar className="h-5 w-5" /> Deteccion satelital</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Ciudad</Label>
            <Select value={deteccion.ciudadSlug} onValueChange={(value) => setDeteccionValue("ciudadSlug", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ciudades.map((ciudad) => <SelectItem key={ciudad.slug} value={ciudad.slug}>{ciudad.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Desde</Label><Input type="date" value={deteccion.fechaDesde} onChange={(e) => setDeteccionValue("fechaDesde", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hasta</Label><Input type="date" value={deteccion.fechaHasta} onChange={(e) => setDeteccionValue("fechaHasta", e.target.value)} /></div>
          <div className="flex items-end"><Button onClick={ejecutarDeteccion} disabled={detectando}>{detectando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Radar className="mr-2 h-4 w-4" />}Ejecutar</Button></div>
          <div className="space-y-1.5"><Label>Lon min</Label><Input value={deteccion.lonMin} onChange={(e) => setDeteccionValue("lonMin", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Lat min</Label><Input value={deteccion.latMin} onChange={(e) => setDeteccionValue("latMin", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Lon max</Label><Input value={deteccion.lonMax} onChange={(e) => setDeteccionValue("lonMax", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Lat max</Label><Input value={deteccion.latMax} onChange={(e) => setDeteccionValue("latMax", e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Sitio</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Publico</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
            ) : basurales.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No hay basurales cargados.</TableCell></TableRow>
            ) : basurales.map((basural) => (
              <TableRow key={basural.id}>
                <TableCell>{basural.fechaDeteccionISO}</TableCell>
                <TableCell className="font-medium">{basural.nombre || basural.ubicacionTexto || "Sin nombre"}</TableCell>
                <TableCell>{basural.ciudadNombre}</TableCell>
                <TableCell>{Math.round(Number(basural.areaM2 ?? 0)).toLocaleString("es-AR")} m2</TableCell>
                <TableCell>{BASURAL_FUENTE_LABELS[basural.fuente]}</TableCell>
                <TableCell>{estadoBadge(basural.estadoVerificacion)}</TableCell>
                <TableCell>{basural.publico ? "Si" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {basural.estadoVerificacion === "candidato" ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => cambiarEstado(basural, "verificado_foto")}>Verificar</Button>
                        <Button variant="outline" size="sm" onClick={() => cambiarEstado(basural, "descartado")}>Descartar</Button>
                      </>
                    ) : null}
                    <Button variant="ghost" size="sm" onClick={() => togglePublico(basural)}>
                      {basural.publico ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => eliminar(basural.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
