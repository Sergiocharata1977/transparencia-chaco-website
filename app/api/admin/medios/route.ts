import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearMedioSchema = z.object({
  nombre: z.string().min(2).max(100),
  ciudadPrincipal: z.string().min(2).max(60),
  ciudadSlug: z.string().min(2).max(60),
  tipo: z.enum(["radio","portal-web","canal-tv","streaming","grafica","red-social","otro"]),
  sitioWeb: z.string().url().optional().or(z.literal("")),
  descripcion: z.string().max(500).optional(),
  estado: z.enum(["activo","inactivo","sin-verificar"]).default("sin-verificar"),
  recibePautaOficial: z.boolean().optional(),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})

export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("medios").orderBy("createdAt", "desc").limit(100).get()
    const medios = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ medios })
  } catch (error) {
    console.error("Error listando medios:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearMedioSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("medios").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando medio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
