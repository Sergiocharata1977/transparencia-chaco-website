import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const crearNotaSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  ciudadNombre: z.string().min(2).max(100),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  tipo: z.enum(["pedido_informacion", "nota_administrativa", "solicitud_vecinal", "reclamo_formal"]),
  titulo: z.string().min(5).max(200),
  descripcion: z.string().min(10).max(2000),
  destinatario: z.string().min(2).max(150),
  fechaEnvioISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estado: z.enum(["borrador", "enviada", "respondida", "vencida", "archivada"]).default("borrador"),
  respuesta: z.string().max(2000).optional(),
  fechaRespuestaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  archivoUrl: z.string().url().optional().or(z.literal("")),
  publico: z.boolean().default(false),
})

// GET /api/admin/notas-municipio — listar notas enviadas al municipio
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const snap = await getAdminDb().collection("notas_municipio").orderBy("createdAt", "desc").limit(100).get()
    const notas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ notas })
  } catch (error) {
    console.error("Error listando notas al municipio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/admin/notas-municipio — crear nota
export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const result = crearNotaSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("notas_municipio").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando nota al municipio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
