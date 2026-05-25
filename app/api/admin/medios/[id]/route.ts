import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarMedioSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  ciudadPrincipal: z.string().min(2).max(60).optional(),
  ciudadSlug: z.string().min(2).max(60).optional(),
  tipo: z.enum(["radio","portal-web","canal-tv","streaming","grafica","red-social","otro"]).optional(),
  sitioWeb: z.string().url().optional().or(z.literal("")),
  descripcion: z.string().max(500).optional(),
  estado: z.enum(["activo","inactivo","sin-verificar"]).optional(),
  recibePautaOficial: z.boolean().optional(),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().optional(),
  estadoEditorial: z.enum(["draft","review","published","archived"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarMedioSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("medios").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando medio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("medios").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando medio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
