import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarPautaSchema = z.object({
  medioId: z.string().min(1).optional(),
  medioNombre: z.string().min(2).max(100).optional(),
  organismo: z.string().min(2).max(150).optional(),
  municipio: z.string().min(2).max(60).optional(),
  municipioSlug: z.string().min(2).max(60).optional(),
  periodo: z.string().min(3).max(50).optional(),
  monto: z.string().max(50).optional(),
  concepto: z.string().max(300).optional(),
  numeroDocumento: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoVerificacion: z.enum(["sin-verificar","con-documento","confirmado","observado"]).optional(),
  visibilidadPublica: z.boolean().optional(),
  estadoEditorial: z.enum(["draft","review","published","archived"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarPautaSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("pauta_oficial").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando pauta:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("pauta_oficial").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando pauta:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
