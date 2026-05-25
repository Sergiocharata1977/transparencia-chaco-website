import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearCiudadSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  nombre: z.string().min(2).max(100),
  provincia: z.string().min(2).max(60).default("Chaco"),
  activa: z.boolean().default(true),
  descripcion: z.string().max(500).optional(),
  poblacion: z.number().int().min(0).optional(),
})

// GET /api/admin/ciudades — listar todas las ciudades
export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("ciudades").orderBy("nombre", "asc").get()
    const ciudades = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ ciudades })
  } catch (error) {
    console.error("Error listando ciudades:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/admin/ciudades — crear ciudad (ID = slug)
export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearCiudadSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })

    const { slug, ...resto } = result.data
    const docRef = getAdminDb().collection("ciudades").doc(slug)
    const existing = await docRef.get()
    if (existing.exists) return NextResponse.json({ error: "Ya existe una ciudad con ese slug" }, { status: 409 })

    await docRef.set({ slug, ...resto, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: slug, slug, ...resto }, { status: 201 })
  } catch (error) {
    console.error("Error creando ciudad:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
