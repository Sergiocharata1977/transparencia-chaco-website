import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const rankingSchema = z.object({
  municipio: z.string().min(2).max(60),
  criterios: z.object({
    publicaListadoObras: z.boolean(),
    publicaPresupuesto: z.boolean(),
    publicaContratistas: z.boolean(),
    publicaAvanceFisico: z.boolean(),
    publicaFechas: z.boolean(),
    respondePedidos: z.boolean(),
    publicaDocumentos: z.boolean(),
  }),
  obrasRegistradas: z.number().int().min(0).default(0),
  obrasParalizadas: z.number().int().min(0).default(0),
  accidentesReportados: z.number().int().min(0).default(0),
  reclamosSalud: z.number().int().min(0).default(0),
  pedidosSinRespuesta: z.number().int().min(0).default(0),
})

const PESOS = {
  publicaListadoObras: 20,
  publicaPresupuesto: 20,
  publicaContratistas: 15,
  publicaAvanceFisico: 15,
  publicaFechas: 10,
  publicaDocumentos: 10,
  respondePedidos: 10,
} as const

// PUT /api/admin/ranking/[municipioSlug] — upsert ranking de un municipio
export async function PUT(req: NextRequest, { params }: { params: Promise<{ municipioSlug: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { municipioSlug } = await params
  try {
    const body = await req.json()
    const result = rankingSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const puntajeTotal = (Object.entries(result.data.criterios) as [keyof typeof PESOS, boolean][])
      .reduce((sum, [k, v]) => sum + (v ? PESOS[k] : 0), 0)
    await getAdminDb().collection("ranking_municipios").doc(municipioSlug).set(
      { municipioSlug, ...result.data, puntajeTotal, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )
    return NextResponse.json({ success: true, puntajeTotal })
  } catch (error) {
    console.error("Error actualizando ranking:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
