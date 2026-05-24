"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, LogOut, Save } from "lucide-react"
import { logoutAdmin, subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { calcularPuntajeRanking } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface CriteriosEditing {
  publicaListadoObras: boolean
  publicaPresupuesto: boolean
  publicaContratistas: boolean
  publicaAvanceFisico: boolean
  publicaFechas: boolean
  respondePedidos: boolean
  publicaDocumentos: boolean
}

interface RankingEditing {
  municipio: string
  municipioSlug: string
  criterios: CriteriosEditing
  obrasRegistradas: number
  obrasParalizadas: number
  accidentesReportados: number
  reclamosSalud: number
  pedidosSinRespuesta: number
  puntajeTotal: number
  guardando: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MUNICIPIOS_SLUGS = [
  { slug: "charata", label: "Charata" },
  { slug: "las-brenas", label: "Las Breñas" },
  { slug: "corzuela", label: "Corzuela" },
  { slug: "presidencia-roque-saenz-pena", label: "Presidencia Roque Sáenz Peña" },
] as const

const CRITERIOS_CONFIG = [
  { campo: "publicaListadoObras", label: "Publica listado de obras", pts: 20 },
  { campo: "publicaPresupuesto", label: "Publica presupuesto", pts: 20 },
  { campo: "publicaContratistas", label: "Publica contratistas", pts: 15 },
  { campo: "publicaAvanceFisico", label: "Publica avance físico", pts: 15 },
  { campo: "publicaFechas", label: "Publica fechas", pts: 10 },
  { campo: "publicaDocumentos", label: "Publica documentos", pts: 10 },
  { campo: "respondePedidos", label: "Responde pedidos", pts: 10 },
] as const

const ESTADISTICAS_CONFIG = [
  { campo: "obrasRegistradas", label: "Obras registradas" },
  { campo: "obrasParalizadas", label: "Obras paralizadas" },
  { campo: "accidentesReportados", label: "Accidentes" },
  { campo: "reclamosSalud", label: "Reclamos salud" },
  { campo: "pedidosSinRespuesta", label: "Pedidos sin respuesta" },
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rankingVacio(slug: string, label: string): RankingEditing {
  return {
    municipio: label,
    municipioSlug: slug,
    criterios: {
      publicaListadoObras: false,
      publicaPresupuesto: false,
      publicaContratistas: false,
      publicaAvanceFisico: false,
      publicaFechas: false,
      respondePedidos: false,
      publicaDocumentos: false,
    },
    obrasRegistradas: 0,
    obrasParalizadas: 0,
    accidentesReportados: 0,
    reclamosSalud: 0,
    pedidosSinRespuesta: 0,
    puntajeTotal: 0,
    guardando: false,
  }
}

function puntajeColor(puntaje: number): string {
  if (puntaje >= 70) return "text-green-600"
  if (puntaje >= 40) return "text-yellow-600"
  return "text-red-600"
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function AdminRankingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [rankings, setRankings] = useState<RankingEditing[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const router = useRouter()

  // Auth guard
  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  // Load rankings once authenticated
  useEffect(() => {
    if (!user) return
    async function cargarRankings() {
      setCargando(true)
      setErrorGlobal(null)
      try {
        const token = await getIdToken()
        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {}
        const res = await fetch("/api/admin/ranking", { headers })
        if (!res.ok) {
          setErrorGlobal("Error cargando rankings")
          // Still populate with empty data so the editor is usable
          setRankings(
            MUNICIPIOS_SLUGS.map(m => rankingVacio(m.slug, m.label))
          )
          return
        }
        const data = await res.json()
        const items: RankingEditing[] = MUNICIPIOS_SLUGS.map(m => {
          const found = (data.rankings ?? data ?? []).find(
            (r: { municipioSlug: string }) => r.municipioSlug === m.slug
          )
          if (!found) return rankingVacio(m.slug, m.label)
          return {
            municipio: found.municipio ?? m.label,
            municipioSlug: m.slug,
            criterios: { ...rankingVacio(m.slug, m.label).criterios, ...found.criterios },
            obrasRegistradas: found.obrasRegistradas ?? 0,
            obrasParalizadas: found.obrasParalizadas ?? 0,
            accidentesReportados: found.accidentesReportados ?? 0,
            reclamosSalud: found.reclamosSalud ?? 0,
            pedidosSinRespuesta: found.pedidosSinRespuesta ?? 0,
            puntajeTotal: found.puntajeTotal ?? calcularPuntajeRanking(found.criterios ?? {}),
            guardando: false,
          }
        })
        setRankings(items)
      } catch {
        setErrorGlobal("Error de red")
        setRankings(MUNICIPIOS_SLUGS.map(m => rankingVacio(m.slug, m.label)))
      } finally {
        setCargando(false)
      }
    }
    cargarRankings()
  }, [user])

  // ---------------------------------------------------------------------------
  // Local state update functions (no API call)
  // ---------------------------------------------------------------------------

  function toggleCriterio(slug: string, campo: keyof CriteriosEditing) {
    setRankings(prev =>
      prev.map(r => {
        if (r.municipioSlug !== slug) return r
        const newCriterios = { ...r.criterios, [campo]: !r.criterios[campo] }
        return {
          ...r,
          criterios: newCriterios,
          puntajeTotal: calcularPuntajeRanking(newCriterios),
        }
      })
    )
  }

  function updateNumerico(
    slug: string,
    campo: keyof Omit<RankingEditing, "municipio" | "municipioSlug" | "criterios" | "puntajeTotal" | "guardando">,
    valor: number
  ) {
    setRankings(prev =>
      prev.map(r => (r.municipioSlug === slug ? { ...r, [campo]: valor } : r))
    )
  }

  // ---------------------------------------------------------------------------
  // Save handler
  // ---------------------------------------------------------------------------

  async function handleGuardar(slug: string) {
    const ranking = rankings.find(r => r.municipioSlug === slug)
    if (!ranking) return
    setRankings(prev =>
      prev.map(r => (r.municipioSlug === slug ? { ...r, guardando: true } : r))
    )
    try {
      const token = await getIdToken()
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      }
      const res = await fetch(`/api/admin/ranking/${slug}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          municipio: ranking.municipio,
          criterios: ranking.criterios,
          obrasRegistradas: ranking.obrasRegistradas,
          obrasParalizadas: ranking.obrasParalizadas,
          accidentesReportados: ranking.accidentesReportados,
          reclamosSalud: ranking.reclamosSalud,
          pedidosSinRespuesta: ranking.pedidosSinRespuesta,
        }),
      })
      if (!res.ok) setErrorGlobal("Error guardando ranking")
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setRankings(prev =>
        prev.map(r => (r.municipioSlug === slug ? { ...r, guardando: false } : r))
      )
    }
  }

  // ---------------------------------------------------------------------------
  // Auth loading state
  // ---------------------------------------------------------------------------

  async function handleLogout() {
    await logoutAdmin()
    router.replace("/admin")
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-base">Ranking de Transparencia</span>
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
          <h1 className="text-2xl font-bold">Editor de ranking por municipio</h1>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {errorGlobal}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {rankings.map(r => (
              <Card key={r.municipioSlug}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{r.municipio}</CardTitle>
                    <span className={`text-3xl font-bold ${puntajeColor(r.puntajeTotal)}`}>
                      {r.puntajeTotal}/100
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Checkboxes de criterios */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Criterios de transparencia
                    </p>
                    {CRITERIOS_CONFIG.map(({ campo, label, pts }) => (
                      <div key={campo} className="flex items-center gap-2">
                        <Checkbox
                          id={`${r.municipioSlug}-${campo}`}
                          checked={r.criterios[campo as keyof CriteriosEditing]}
                          onCheckedChange={() =>
                            toggleCriterio(r.municipioSlug, campo as keyof CriteriosEditing)
                          }
                        />
                        <Label
                          htmlFor={`${r.municipioSlug}-${campo}`}
                          className="cursor-pointer flex-1"
                        >
                          {label}
                        </Label>
                        <span className="text-xs text-muted-foreground">{pts} pts</span>
                      </div>
                    ))}
                  </div>

                  {/* Campos numéricos */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <p className="col-span-2 text-sm font-medium text-muted-foreground">
                      Estadísticas
                    </p>
                    {ESTADISTICAS_CONFIG.map(({ campo, label }) => (
                      <div key={campo} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          type="number"
                          min={0}
                          value={r[campo as keyof typeof r] as number}
                          onChange={e =>
                            updateNumerico(
                              r.municipioSlug,
                              campo as keyof Omit<
                                RankingEditing,
                                "municipio" | "municipioSlug" | "criterios" | "puntajeTotal" | "guardando"
                              >,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="h-8"
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleGuardar(r.municipioSlug)}
                    disabled={r.guardando}
                    className="w-full"
                  >
                    {r.guardando ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar cambios
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
