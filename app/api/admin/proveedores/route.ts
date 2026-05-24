import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const crearProveedorSchema = z.object({
  nombre: z.string().min(2).max(150),
  rubro: z.string().min(2).max(100),
  ciudad: z.string().min(2).max(60),
  ciudadSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  organismoContratante: z.string().min(2).max(150),
  tipoContratacion: z.enum(["licitacion","contratacion-directa","concurso","convenio","desconocido"]),
  objeto: z.string().max(500).optional(),
  monto: z.string().max(50).optional(),
  periodo: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoCumplimiento: z.enum(["sin-evaluar","en-ejecucion","cumplido","observado"]).default("sin-evaluar"),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})

export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("proveedores_estado").orderBy("createdAt", "desc").limit(100).get()
    const proveedores = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ proveedores })
  } catch (error) {
    console.error("Error listando proveedores:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const body = await req.json()
    const result = crearProveedorSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    const ref = await getAdminDb().collection("proveedores_estado").add({ ...result.data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ id: ref.id, ...result.data }, { status: 201 })
  } catch (error) {
    console.error("Error creando proveedor:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
