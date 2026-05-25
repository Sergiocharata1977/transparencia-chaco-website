"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AlertCircle, CheckCircle, FileText, MapPin, Plus, Search, Shield, X } from "lucide-react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { submitDenuncia } from "@/lib/firebase/public-site"
import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore"

interface DenunciaPublica {
  id: string
  tipo: string
  municipio: string
  descripcion: string
  anonimo: boolean
  estado: string
  createdAt?: string
}

const TIPOS_DENUNCIA = [
  "Falta de publicación de presupuesto",
  "No publicación de ejecución presupuestaria",
  "Ausencia de nómina de personal",
  "Falta de información sobre licitaciones",
  "No publicación de ordenanzas",
  "Negativa a entregar información pública",
  "Información desactualizada",
  "Otro",
]

const MUNICIPIOS = [
  { value: "charata", label: "Charata" },
  { value: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
  { value: "las-brenas", label: "Las Breñas" },
  { value: "general-pinedo", label: "General Pinedo" },
  { value: "villa-angela", label: "Villa Ángela" },
  { value: "quitilipi", label: "Quitilipi" },
  { value: "otro", label: "Otro municipio" },
]

const ESTADO_LABELS: Record<string, string> = {
  recibido: "Recibida",
  "en-revision": "En revisión",
  publicado: "Publicada",
  respondido: "Respondida",
  cerrado: "Cerrada",
}

function estadoBadge(estado: string) {
  const label = ESTADO_LABELS[estado] ?? estado
  if (estado === "publicado" || estado === "respondido")
    return <Badge className="bg-green-100 text-green-800 border-green-200">{label}</Badge>
  if (estado === "en-revision")
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{label}</Badge>
  if (estado === "cerrado")
    return <Badge variant="secondary">{label}</Badge>
  return <Badge variant="outline">{label}</Badge>
}

export default function DenunciasPage() {
  const [denuncias, setDenuncias] = useState<DenunciaPublica[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [filtroMunicipio, setFiltroMunicipio] = useState("todos")

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Form fields (controlled because Select in shadcn requires it)
  const [formTipo, setFormTipo] = useState("")
  const [formMunicipio, setFormMunicipio] = useState("")
  const [formDescripcion, setFormDescripcion] = useState("")
  const [formAnonimo, setFormAnonimo] = useState(true)
  const [formNombre, setFormNombre] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formTelefono, setFormTelefono] = useState("")

  const cargarDenuncias = useCallback(async () => {
    setCargando(true)
    try {
      if (!hasFirebaseClientConfig) { setDenuncias([]); return }
      const db = getFirebaseDb()
      if (!db) { setDenuncias([]); return }
      const q = query(
        collection(db, "denuncias"),
        where("visibilidadPublica", "==", true),
        orderBy("createdAt", "desc"),
        limit(100)
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({
        id: d.id,
        tipo: String(d.data().tipo ?? ""),
        municipio: String(d.data().municipio ?? ""),
        descripcion: String(d.data().descripcion ?? ""),
        anonimo: Boolean(d.data().anonimo),
        estado: String(d.data().estadoInterno ?? d.data().estado ?? "recibido"),
        createdAt: d.data().createdAt?.toDate?.()?.toLocaleDateString("es-AR") ?? "",
      }))
      setDenuncias(data)
    } catch {
      setDenuncias([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarDenuncias() }, [cargarDenuncias])

  const stats = useMemo(() => {
    const total = denuncias.length
    const respondidas = denuncias.filter(d => d.estado === "respondido" || d.estado === "publicado").length
    const enRevision = denuncias.filter(d => d.estado === "en-revision").length
    const municipiosUnicos = new Set(denuncias.map(d => d.municipio)).size
    return { total, respondidas, enRevision, municipiosUnicos }
  }, [denuncias])

  const filtradas = useMemo(() => {
    return denuncias.filter(d => {
      const q = busqueda.toLowerCase()
      const matchSearch = !busqueda ||
        d.tipo.toLowerCase().includes(q) ||
        d.municipio.toLowerCase().includes(q) ||
        d.descripcion.toLowerCase().includes(q)
      const matchTipo = filtroTipo === "todos" || d.tipo === filtroTipo
      const matchMunicipio = filtroMunicipio === "todos" || d.municipio === filtroMunicipio
      return matchSearch && matchTipo && matchMunicipio
    })
  }, [denuncias, busqueda, filtroTipo, filtroMunicipio])

  function resetForm() {
    setFormTipo(""); setFormMunicipio(""); setFormDescripcion("")
    setFormAnonimo(true); setFormNombre(""); setFormEmail(""); setFormTelefono("")
    setError(null); setEnviado(false)
  }

  function handleOpenModal() { resetForm(); setModalOpen(true) }
  function handleCloseModal() { setModalOpen(false); resetForm() }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formTipo || !formMunicipio || !formDescripcion) {
      setError("Por favor completá los campos obligatorios.")
      return
    }
    setError(null)
    setEnviando(true)
    try {
      await submitDenuncia({
        tipo: formTipo,
        municipio: formMunicipio,
        descripcion: formDescripcion,
        anonimo: formAnonimo,
        nombre: formNombre || undefined,
        email: formEmail || undefined,
        telefono: formTelefono || undefined,
      })
      setEnviado(true)
    } catch {
      setError("No pudimos enviar la denuncia en este momento. Probá nuevamente.")
    } finally {
      setEnviando(false)
    }
  }

  const municipiosUnicos = useMemo(() => {
    return [...new Set(denuncias.map(d => d.municipio))].filter(Boolean)
  }, [denuncias])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header compacto */}
      <section className="bg-slate-900 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Denuncias Ciudadanas</h1>
              <p className="text-slate-300 mt-1 text-sm">
                Denunciar no es acusar, es pedir explicaciones. Tu voz construye transparencia.
              </p>
            </div>
            <Button
              onClick={handleOpenModal}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 shadow-sm"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Denuncia
            </Button>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total denuncias</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Publicadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Respondidas</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-green-600">{stats.respondidas}</p>
              <p className="text-xs text-muted-foreground mt-1">Con respuesta oficial</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">En revisión</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-yellow-600">{stats.enRevision}</p>
              <p className="text-xs text-muted-foreground mt-1">Siendo evaluadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Municipios</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-foreground">{stats.municipiosUnicos}</p>
              <p className="text-xs text-muted-foreground mt-1">Con denuncias activas</p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tipo, municipio o descripción..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {TIPOS_DENUNCIA.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroMunicipio} onValueChange={setFiltroMunicipio}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos los municipios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los municipios</SelectItem>
              {municipiosUnicos.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(busqueda || filtroTipo !== "todos" || filtroMunicipio !== "todos") && (
            <Button variant="ghost" size="icon" onClick={() => { setBusqueda(""); setFiltroTipo("todos"); setFiltroMunicipio("todos") }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Aviso info */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <Shield className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
          <span>Todas las denuncias son revisadas antes de publicarse. Podés denunciar de forma anónima. No publicamos datos personales sin tu consentimiento.</span>
        </div>

        {/* Tabla */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              {cargando ? "Cargando..." : `${filtradas.length} denuncia${filtradas.length !== 1 ? "s" : ""} encontrada${filtradas.length !== 1 ? "s" : ""}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {cargando ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
                Cargando denuncias...
              </div>
            ) : filtradas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">No hay denuncias publicadas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {busqueda || filtroTipo !== "todos" || filtroMunicipio !== "todos"
                      ? "Probá con otros filtros de búsqueda."
                      : "Sé el primero en enviar una denuncia."}
                  </p>
                </div>
                <Button onClick={handleOpenModal} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Denuncia
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Municipio</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtradas.map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium max-w-[160px]">
                          <span className="line-clamp-2 text-sm">{d.tipo}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{d.municipio}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <p className="text-sm text-muted-foreground line-clamp-2">{d.descripcion}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {d.createdAt || "—"}
                        </TableCell>
                        <TableCell>{estadoBadge(d.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacto alternativo */}
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="space-y-1">
            <p className="font-medium">¿Preferís contactarnos de otra manera?</p>
            <p className="text-muted-foreground">
              Email: <a href="mailto:denuncias@transparenciachaco.org" className="text-primary hover:underline">denuncias@transparenciachaco.org</a>
              {" · "}
              WhatsApp: <a href="https://wa.me/5493644000000" className="text-primary hover:underline">+54 9 364 4000000</a>
            </p>
          </div>
        </div>

      </main>

      <Footer />

      {/* Modal popup — formulario de denuncia */}
      <Dialog open={modalOpen} onOpenChange={open => { if (!open) handleCloseModal() }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Nueva Denuncia Ciudadana
            </DialogTitle>
            <DialogDescription>
              Tu denuncia será revisada por el equipo antes de publicarse. Podés hacerla de forma anónima.
            </DialogDescription>
          </DialogHeader>

          {enviado ? (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <div>
                <p className="text-lg font-semibold">Denuncia recibida</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu denuncia fue recibida correctamente. Nuestro equipo la revisará en los próximos días.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setEnviado(false); resetForm() }}>
                  Hacer otra denuncia
                </Button>
                <Button onClick={handleCloseModal}>Cerrar</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-1">

              <div className="space-y-2">
                <Label htmlFor="form-tipo">Tipo de denuncia <span className="text-destructive">*</span></Label>
                <Select value={formTipo} onValueChange={setFormTipo} required>
                  <SelectTrigger id="form-tipo">
                    <SelectValue placeholder="Seleccioná el tipo de incumplimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DENUNCIA.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-municipio">Municipio <span className="text-destructive">*</span></Label>
                <Select value={formMunicipio} onValueChange={setFormMunicipio} required>
                  <SelectTrigger id="form-municipio">
                    <SelectValue placeholder="Seleccioná el municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {MUNICIPIOS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-descripcion">
                  Descripción del incumplimiento <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="form-descripcion"
                  placeholder="Describí en detalle qué incumplimiento observaste."
                  rows={5}
                  value={formDescripcion}
                  onChange={e => setFormDescripcion(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="form-anonimo"
                    checked={formAnonimo}
                    onCheckedChange={v => setFormAnonimo(Boolean(v))}
                  />
                  <label htmlFor="form-anonimo" className="text-sm cursor-pointer">
                    Quiero hacer esta denuncia de manera anónima
                  </label>
                </div>
                {!formAnonimo && (
                  <p className="text-xs text-muted-foreground pl-6">
                    Tus datos de contacto nunca serán publicados sin tu consentimiento explícito.
                  </p>
                )}
              </div>

              {!formAnonimo && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Datos de contacto (opcional)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="form-nombre" className="text-xs">Nombre completo</Label>
                      <Input id="form-nombre" placeholder="Tu nombre" value={formNombre} onChange={e => setFormNombre(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="form-email" className="text-xs">Email</Label>
                      <Input id="form-email" type="email" placeholder="tu@email.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="form-telefono" className="text-xs">Teléfono</Label>
                    <Input id="form-telefono" type="tel" placeholder="Tu número" value={formTelefono} onChange={e => setFormTelefono(e.target.value)} />
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={enviando || !formTipo || !formMunicipio || !formDescripcion}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {enviando ? "Enviando..." : "Enviar Denuncia"}
                </Button>
              </div>

            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
