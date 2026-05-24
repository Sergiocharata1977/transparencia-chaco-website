import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearPublicacionSchema = z.object({
  titulo: z.string().min(5).max(200),
  extracto: z.string().min(10).max(400),
  contenido: z.string().min(20).max(10000),
  categoria: z.enum(["obras","transparencia","reportes","salud","seguridad","general"]).default("general"),
  municipio: z.string().min(2).max(60),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena","todos"]),
  autor: z.string().max(100).optional(),
  imagen: z.string().url().optional().or(z.literal("")),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
})

export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("publicaciones").orderBy("createdAt", "desc").limit(100).get()
    const publicaciones = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ publicaciones })
  } catch (error) {
    console.error("Error listando publicaciones:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearPublicacionSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const extra: Record<string, unknown> = {
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }
    if (result.data.estadoEditorial === "published") {
      extra.publishedAt = FieldValue.serverTimestamp()
    }
    const ref = await getAdminDb().collection("publicaciones").add({ ...result.data, ...extra })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando publicación:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
