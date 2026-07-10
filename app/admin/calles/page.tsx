"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react"

import { subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { getCiudadesActivas, CIUDADES_FALLBACK, type Ciudad } from "@/lib/firebase/ciudades"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  CALLE_ESTADO_OBRA_LABELS,
  CALLE_ESTADO_SUPERFICIE_LABELS,
  CALLE_FUENTE_LABELS,
  type CalleEstadoObra,
  type CalleEstadoSuperficie,
  type CalleFuente,
  type CalleGeometry,
  type CalleMunicipio,
} from "@/types/calles"

type CalleAdmin = CalleMunicipio

interface CalleForm {
  ciudadSlug: string
  nombreCalle: string
  desde: string
  hasta: string
  barrio: string
  estadoSuperficie: CalleEstadoSuperficie
  estadoObra: CalleEstadoObra
  anioRelevamiento: string
  fechaRelevamientoISO: string
  longitudMetros: string
  latInicio: string
  lngInicio: string
  latFin: string
  lngFin: string
  fuente: CalleFuente
  evidenciaUrl: string
  fotoUrl: string
  observaciones: string
  obraPublicaId: string
  obraNombre: string
  publico: boolean
}

const CURRENT_YEAR = new Date().getFullYear()

const DEFAULT_FORM: CalleForm = {
  ciudadSlug: "charata",
  nombreCalle: "",
  desde: "",
  hasta: "",
  barrio: "",
  estadoSuperficie: "sin_dato",
  estadoObra: "sin_obra",
  anioRelevamiento: String(CURRENT_YEAR),
  fechaRelevamientoISO: "",
  longitudMetros: "",
  latInicio: "",
  lngInicio: "",
  latFin: "",
  lngFin: "",
  fuente: "observatorio",
  evidenciaUrl: "",
  fotoUrl: "",
  observaciones: "",
  obraPublicaId: "",
  obraNombre: "",
  publico: false,
}

const SUPERFICIES = Object.entries(CALLE_ESTADO_SUPERFICIE_LABELS) as [CalleEstadoSuperficie, string][]
const ESTADOS_OBRA = Object.entries(CALLE_ESTADO_OBRA_LABELS) as [CalleEstadoObra, string][]
const FUENTES = Object.entries(CALLE_FUENTE_LABELS) as [CalleFuente, string][]

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" }
}

function ciudadBySlug(slug: string, ciudades: Ciudad[]): Ciudad | undefined {
  return ciudades.find((ciudad) => ciudad.slug === slug)
}

function geometryToForm(geometry?: CalleGeometry) {
  const inicio = geometry?.coordinates?.[0]
  const fin = geometry?.coordinates?.[geometry.coordinates.length - 1]

  return {
    latInicio: inicio ? String(inicio[1]) : "",
    lngInicio: inicio ? String(inicio[0]) : "",
    latFin: fin ? String(fin[1]) : "",
    lngFin: fin ? String(fin[0]) : "",
  }
}

function buildGeometry(form: CalleForm): CalleGeometry | undefined {
  const latInicio = Number(form.latInicio)
  const lngInicio = Number(form.lngInicio)
  const latFin = Number(form.latFin)
  const lngFin = Number(form.lngFin)

  if ([latInicio, lngInicio, latFin, lngFin].every(Number.isFinite)) {
    return {
      type: "LineString",
      coordinates: [
        [lngInicio, latInicio],
        [lngFin, latFin],
      ],
    }
  }

  return undefined
}

function superficieBadge(estado: CalleEstadoSuperficie) {
  if (estado === "asfaltada") return <Badge className="bg-emerald-100 text-emerald-800">Asfaltada</Badge>
  if (estado === "en_obra") return <Badge className="bg-amber-100 text-amber-800">En obra</Badge>
  if (estado === "no_asfaltada" || estado === "ripio" || estado === "tierra") {
    return <Badge className="bg-slate-200 text-slate-800">{CALLE_ESTADO_SUPERFICIE_LABELS[estado]}</Badge>
  }
  return <Badge variant="secondary">{CALLE_ESTADO_SUPERFICIE_LABELS[estado]}</Badge>
}

export default function AdminCallesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [ciudades, setCiudades] = useState<Ciudad[]>(CIUDADES_FALLBACK)
  const [calles, setCalles] = useState<CalleAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [modoEdicion, setModoEdicion] = useState<CalleAdmin | null>(null)
  const [form, setForm] = useState<CalleForm>(DEFAULT_FORM)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsub = subscribeAuthState((u) => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  const cargarCalles = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/calles", { headers })
      if (!res.ok) {
        setErrorGlobal("Error cargando calles")
        return
      }
      const data = await res.json()
      setCalles(data.calles ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      cargarCalles()
      getCiudadesActivas().then(setCiudades).catch(() => {})
    }
  }, [user, cargarCalles])

  const resumen = useMemo(() => {
    const total = calles.length
    const asfaltadas = calles.filter((calle) => calle.estadoSuperficie === "asfaltada").length
    const noAsfaltadas = calles.filter((calle) => ["no_asfaltada", "ripio", "tierra"].includes(calle.estadoSuperficie)).length
    const enObra = calles.filter((calle) => calle.estadoSuperficie === "en_obra").length
    return { total, asfaltadas, noAsfaltadas, enObra }
  }, [calles])

  function setValue<K extends keyof CalleForm>(key: K, value: CalleForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function abrirNueva() {
    setModoEdicion(null)
    setForm(DEFAULT_FORM)
    setErrorForm(null)
    setDialogOpen(true)
  }

  function abrirEditar(calle: CalleAdmin) {
    setModoEdicion(calle)
    setForm({
      ciudadSlug: calle.ciudadSlug,
      nombreCalle: calle.nombreCalle,
      desde: calle.desde,
      hasta: calle.hasta,
      barrio: calle.barrio ?? "",
      estadoSuperficie: calle.estadoSuperficie,
      estadoObra: calle.estadoObra,
      anioRelevamiento: String(calle.anioRelevamiento),
      fechaRelevamientoISO: calle.fechaRelevamientoISO ?? "",
      longitudMetros: String(calle.longitudMetros ?? ""),
      ...geometryToForm(calle.geometry),
      fuente: calle.fuente,
      evidenciaUrl: calle.evidenciaUrl ?? "",
      fotoUrl: calle.fotoUrl ?? "",
      observaciones: calle.observaciones ?? "",
      obraPublicaId: calle.obraPublicaId ?? "",
      obraNombre: calle.obraNombre ?? "",
      publico: calle.publico,
    })
    setErrorForm(null)
    setDialogOpen(true)
  }

  async function guardar() {
    setErrorForm(null)
    if (!form.nombreCalle.trim() || !form.desde.trim() || !form.hasta.trim()) {
      setErrorForm("Calle, desde y hasta son obligatorios")
      return
    }

    const ciudad = ciudadBySlug(form.ciudadSlug, ciudades)
    if (!ciudad) {
      setErrorForm("Selecciona una ciudad valida")
      return
    }

    setGuardando(true)
    try {
      const payload = {
        ciudadSlug: ciudad.slug,
        ciudadNombre: ciudad.nombre,
        departamento: ciudad.departamento,
        provincia: ciudad.provincia,
        nombreCalle: form.nombreCalle.trim(),
        desde: form.desde.trim(),
        hasta: form.hasta.trim(),
        barrio: form.barrio.trim() || undefined,
        estadoSuperficie: form.estadoSuperficie,
        estadoObra: form.estadoObra,
        anioRelevamiento: Number(form.anioRelevamiento),
        fechaRelevamientoISO: form.fechaRelevamientoISO || undefined,
        longitudMetros: Number(form.longitudMetros || 0),
        geometry: buildGeometry(form),
        fuente: form.fuente,
        evidenciaUrl: form.evidenciaUrl || undefined,
        fotoUrl: form.fotoUrl || undefined,
        observaciones: form.observaciones || undefined,
        obraPublicaId: form.obraPublicaId || undefined,
        obraNombre: form.obraNombre || undefined,
        publico: form.publico,
      }

      const headers = await authHeaders()
      const res = await fetch(modoEdicion ? `/api/admin/calles/${modoEdicion.id}` : "/api/admin/calles", {
        method: modoEdicion ? "PATCH" : "POST",
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorForm(data.error ?? "Error guardando calle")
        return
      }

      setDialogOpen(false)
      setModoEdicion(null)
      setForm(DEFAULT_FORM)
      await cargarCalles()
    } catch {
      setErrorForm("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/calles/${id}`, { method: "DELETE", headers })
      setCalles((prev) => prev.filter((calle) => calle.id !== id))
    } catch {
      setErrorGlobal("Error eliminando calle")
    }
  }

  async function togglePublico(calle: CalleAdmin) {
    const next = !calle.publico
    setCalles((prev) => prev.map((item) => item.id === calle.id ? { ...item, publico: next } : item))
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/calles/${calle.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ publico: next }),
      })
    } catch {
      setCalles((prev) => prev.map((item) => item.id === calle.id ? { ...item, publico: !next } : item))
      setErrorGlobal("Error actualizando visibilidad")
    }
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calles y Pavimento</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro calle por calle para controlar avance de asfalto, ripio, tierra y obras.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={abrirNueva}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tramo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{modoEdicion ? "Editar tramo" : "Nuevo tramo de calle"}</DialogTitle>
              <DialogDescription>
                Carga el tramo, estado de superficie, año de relevamiento y coordenadas para el mapa.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Ciudad</Label>
                <Select value={form.ciudadSlug} onValueChange={(value) => setValue("ciudadSlug", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ciudades.map((ciudad) => (
                      <SelectItem key={ciudad.slug} value={ciudad.slug}>{ciudad.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Calle *</Label>
                <Input value={form.nombreCalle} onChange={(e) => setValue("nombreCalle", e.target.value)} placeholder="Ej: Laprida" />
              </div>
              <div className="space-y-1.5">
                <Label>Desde *</Label>
                <Input value={form.desde} onChange={(e) => setValue("desde", e.target.value)} placeholder="Ej: Av. Belgrano" />
              </div>
              <div className="space-y-1.5">
                <Label>Hasta *</Label>
                <Input value={form.hasta} onChange={(e) => setValue("hasta", e.target.value)} placeholder="Ej: Guemes" />
              </div>
              <div className="space-y-1.5">
                <Label>Barrio</Label>
                <Input value={form.barrio} onChange={(e) => setValue("barrio", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Metros del tramo</Label>
                <Input type="number" min="0" value={form.longitudMetros} onChange={(e) => setValue("longitudMetros", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Superficie</Label>
                <Select value={form.estadoSuperficie} onValueChange={(value) => setValue("estadoSuperficie", value as CalleEstadoSuperficie)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPERFICIES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado de obra</Label>
                <Select value={form.estadoObra} onValueChange={(value) => setValue("estadoObra", value as CalleEstadoObra)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_OBRA.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Año de relevamiento</Label>
                <Input type="number" min="2000" max="2100" value={form.anioRelevamiento} onChange={(e) => setValue("anioRelevamiento", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Fecha de relevamiento</Label>
                <Input type="date" value={form.fechaRelevamientoISO} onChange={(e) => setValue("fechaRelevamientoISO", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Lat inicio</Label>
                <Input value={form.latInicio} onChange={(e) => setValue("latInicio", e.target.value)} placeholder="-27.433" />
              </div>
              <div className="space-y-1.5">
                <Label>Lng inicio</Label>
                <Input value={form.lngInicio} onChange={(e) => setValue("lngInicio", e.target.value)} placeholder="-61.183" />
              </div>
              <div className="space-y-1.5">
                <Label>Lat fin</Label>
                <Input value={form.latFin} onChange={(e) => setValue("latFin", e.target.value)} placeholder="-27.434" />
              </div>
              <div className="space-y-1.5">
                <Label>Lng fin</Label>
                <Input value={form.lngFin} onChange={(e) => setValue("lngFin", e.target.value)} placeholder="-61.184" />
              </div>
              <div className="space-y-1.5">
                <Label>Fuente</Label>
                <Select value={form.fuente} onValueChange={(value) => setValue("fuente", value as CalleFuente)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUENTES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Obra relacionada</Label>
                <Input value={form.obraNombre} onChange={(e) => setValue("obraNombre", e.target.value)} placeholder="Nombre de obra publica" />
              </div>
              <div className="space-y-1.5">
                <Label>ID obra relacionada</Label>
                <Input value={form.obraPublicaId} onChange={(e) => setValue("obraPublicaId", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL evidencia</Label>
                <Input value={form.evidenciaUrl} onChange={(e) => setValue("evidenciaUrl", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>URL foto</Label>
                <Input value={form.fotoUrl} onChange={(e) => setValue("fotoUrl", e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>Observaciones</Label>
                <Textarea value={form.observaciones} onChange={(e) => setValue("observaciones", e.target.value)} rows={3} />
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input type="checkbox" checked={form.publico} onChange={(e) => setValue("publico", e.target.checked)} />
                Visible al publico
              </label>
            </div>

            {errorForm ? <p className="text-sm text-destructive">{errorForm}</p> : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={guardando}>Cancelar</Button>
              <Button onClick={guardar} disabled={guardando}>
                {guardando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {modoEdicion ? "Guardar cambios" : "Crear tramo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {errorGlobal ? (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorGlobal}</div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-2xl font-black">{resumen.total}</p>
          <p className="text-sm text-muted-foreground">Tramos</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-2xl font-black text-emerald-700">{resumen.asfaltadas}</p>
          <p className="text-sm text-muted-foreground">Asfaltadas</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-2xl font-black text-slate-700">{resumen.noAsfaltadas}</p>
          <p className="text-sm text-muted-foreground">No asfaltadas</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-2xl font-black text-amber-700">{resumen.enObra}</p>
          <p className="text-sm text-muted-foreground">En obra</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Calle</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Tramo</TableHead>
              <TableHead>Superficie</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Metros</TableHead>
              <TableHead>Mapa</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
            ) : calles.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">No hay calles cargadas.</TableCell></TableRow>
            ) : calles.map((calle) => (
              <TableRow key={calle.id}>
                <TableCell className="font-medium">{calle.nombreCalle}</TableCell>
                <TableCell>{calle.ciudadNombre}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{calle.desde} - {calle.hasta}</TableCell>
                <TableCell>{superficieBadge(calle.estadoSuperficie)}</TableCell>
                <TableCell>{calle.anioRelevamiento}</TableCell>
                <TableCell>{calle.longitudMetros} m</TableCell>
                <TableCell>{calle.geometry ? "Si" : "No"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(calle)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => togglePublico(calle)}>
                      {calle.publico ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Eliminar tramo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminara {calle.nombreCalle} entre {calle.desde} y {calle.hasta}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => eliminar(calle.id)}>
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
    </main>
  )
}
