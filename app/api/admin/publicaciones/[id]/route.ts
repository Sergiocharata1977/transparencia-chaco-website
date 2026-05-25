import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarPublicacionSchema = z.object({
  titulo: z.string().min(5).max(200).optional(),
  extracto: z.string().min(10).max(400).optional(),
  contenido: z.string().min(20).max(10000).optional(),
  categoria: z.enum(["obras","transparencia","reportes","salud","seguridad","general"]).optional(),
  municipio: z.string().min(2).max(60).optional(),
  municipioSlug: z.string().min(2).max(60).optional(),
  autor: z.string().max(100).optional(),
  imagen: z.string().url().optional().or(z.literal("")),
  estadoEditorial: z.enum(["draft","review","published","archived"]).optional(),
  visibilidadPublica: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarPublicacionSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const updates: Record<string, unknown> = { ...result.data, updatedAt: FieldValue.serverTimestamp() }
    if (result.data.estadoEditorial === "published") {
      const existing = await getAdminDb().collection("publicaciones").doc(id).get()
      if (existing.data()?.estadoEditorial !== "published") {
        updates.publishedAt = FieldValue.serverTimestamp()
      }
    }
    await getAdminDb().collection("publicaciones").doc(id).update(updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando publicación:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("publicaciones").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando publicación:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
