import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearObraSchema = z.object({
  municipio: z.string().min(2).max(60),
  municipioSlug: z.string().min(2).max(60),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().min(10).max(1000),
  ubicacionTexto: z.string().max(200).optional(),
  tipo: z.enum(["pavimento","ripio","iluminacion","cloacas","edificio-publico","obra-hidraulica","plaza","parque","otro"]),
  origenFondos: z.enum(["municipal","provincial","nacional","mixto","desconocido"]),
  ejecucion: z.enum(["administracion-propia","empresa-contratista","ejecucion-provincial","ejecucion-nacional","desconocido"]),
  estado: z.enum(["anunciada","iniciada","en-ejecucion","paralizada","finalizada","sin-informacion"]),
  avancePorcentaje: z.number().min(0).max(100).optional(),
  responsableInformado: z.string().max(100).optional(),
  contratista: z.string().max(100).optional(),
  presupuestoInformado: z.string().max(50).optional(),
  fechaInicioISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFinISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fuenteInformacion: z.string().max(200).optional(),
  nivelVerificacion: z.number().int().min(1).max(5).default(1),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})

// GET /api/admin/obras — listar todas las obras
export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("obras_publicas").orderBy("createdAt", "desc").limit(100).get()
    const obras = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ obras })
  } catch (error) {
    console.error("Error listando obras:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// POST /api/admin/obras — crear obra
export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearObraSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("obras_publicas").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando obra:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
