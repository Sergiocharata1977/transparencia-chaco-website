import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarReclamoSchema = z.object({
  ciudadSlug: z.string().min(2).max(60).optional(),
  ciudadNombre: z.string().min(2).max(100).optional(),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  enteResponsable: z.enum(["municipio", "hospital", "seguridad", "escuela", "servicios_publicos", "concejo", "otro"]).optional(),
  tipo: z.enum(["denuncia", "reclamo", "sugerencia", "alerta"]).optional(),
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(10).max(2000).optional(),
  ubicacionTexto: z.string().max(200).optional(),
  estado: z.enum(["pendiente", "en_revision", "publicado", "derivado", "respondido", "rechazado"]).optional(),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).optional(),
  publico: z.boolean().optional(),
  respuestaOficial: z.string().max(2000).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarReclamoSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("reclamos").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando reclamo:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("reclamos").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando reclamo:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
