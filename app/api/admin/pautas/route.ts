import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"


const crearPautaSchema = z.object({
  medioId: z.string().min(1),
  medioNombre: z.string().min(2).max(100),
  organismo: z.string().min(2).max(150),
  municipio: z.string().min(2).max(60),
  municipioSlug: z.string().min(2).max(60),
  periodo: z.string().min(3).max(50),
  monto: z.string().max(50).optional(),
  concepto: z.string().max(300).optional(),
  numeroDocumento: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoVerificacion: z.enum(["sin-verificar","con-documento","confirmado","observado"]).default("sin-verificar"),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const snap = await getAdminDb().collection("pauta_oficial").orderBy("createdAt", "desc").limit(100).get()
    const pautas = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ pautas })
  } catch (error) {
    console.error("Error listando pautas:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const body = await req.json()
    const result = crearPautaSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("pauta_oficial").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando pauta:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
