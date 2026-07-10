import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const crearReclamoSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  ciudadNombre: z.string().min(2).max(100),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  enteResponsable: z.enum(["municipio", "hospital", "seguridad", "escuela", "servicios_publicos", "concejo", "otro"]),
  tipo: z.enum(["denuncia", "reclamo", "sugerencia", "alerta"]),
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(10).max(2000),
  ubicacionTexto: z.string().max(200).optional(),
  estado: z.enum(["pendiente", "en_revision", "publicado", "derivado", "respondido", "rechazado"]).default("pendiente"),
  prioridad: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
  publico: z.boolean().default(false),
  respuestaOficial: z.string().max(2000).optional(),
})

// GET /api/admin/reclamos — listar reclamos por ente
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const snap = await getAdminDb().collection("reclamos").orderBy("createdAt", "desc").limit(100).get()
    const reclamos = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ reclamos })
  } catch (error) {
    console.error("Error listando reclamos:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/admin/reclamos — crear reclamo
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const result = crearReclamoSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("reclamos").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando reclamo:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
