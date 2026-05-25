import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearPedidoSchema = z.object({
  municipio: z.string().min(2).max(60),
  municipioSlug: z.string().min(2).max(60),
  organismo: z.string().min(3).max(150),
  tema: z.string().min(5).max(200),
  textoPedido: z.string().max(2000).optional(),
  fechaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estado: z.enum(["en-plazo","respondido-completo","respondido-parcial","sin-respuesta","vencido"]),
  fechaRespuestaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  respuestaResumen: z.string().max(1000).optional(),
  nivelVerificacion: z.number().int().min(1).max(5).default(1),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})

export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("pedidos_informacion").orderBy("createdAt", "desc").limit(100).get()
    const pedidos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ pedidos })
  } catch (error) {
    console.error("Error listando pedidos:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearPedidoSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("pedidos_informacion").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando pedido:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
