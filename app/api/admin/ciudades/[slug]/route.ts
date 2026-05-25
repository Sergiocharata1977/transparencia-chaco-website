import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarCiudadSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  provincia: z.string().min(2).max(60).optional(),
  activa: z.boolean().optional(),
  descripcion: z.string().max(500).optional(),
  poblacion: z.number().int().min(0).optional(),
})

// PATCH /api/admin/ciudades/[slug] — actualizar ciudad
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { slug } = await params
  try {
    const body = await req.json()
    const result = actualizarCiudadSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("ciudades").doc(slug).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando ciudad:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE /api/admin/ciudades/[slug] — eliminar ciudad
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { slug } = await params
  try {
    await getAdminDb().collection("ciudades").doc(slug).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando ciudad:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
