import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarObraSchema = z.object({
  municipio: z.string().min(2).max(60).optional(),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]).optional(),
  nombre: z.string().min(3).max(150).optional(),
  descripcion: z.string().min(10).max(1000).optional(),
  ubicacionTexto: z.string().max(200).optional(),
  tipo: z.enum(["pavimento","ripio","iluminacion","cloacas","edificio-publico","obra-hidraulica","plaza","parque","otro"]).optional(),
  origenFondos: z.enum(["municipal","provincial","nacional","mixto","desconocido"]).optional(),
  ejecucion: z.enum(["administracion-propia","empresa-contratista","ejecucion-provincial","ejecucion-nacional","desconocido"]).optional(),
  estado: z.enum(["anunciada","iniciada","en-ejecucion","paralizada","finalizada","sin-informacion"]).optional(),
  avancePorcentaje: z.number().min(0).max(100).optional(),
  responsableInformado: z.string().max(100).optional(),
  contratista: z.string().max(100).optional(),
  presupuestoInformado: z.string().max(50).optional(),
  fechaInicioISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFinISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fuenteInformacion: z.string().max(200).optional(),
  nivelVerificacion: z.number().int().min(1).max(5).optional(),
  visibilidadPublica: z.boolean().optional(),
  estadoEditorial: z.enum(["draft","review","published","archived"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarObraSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("obras_publicas").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando obra:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("obras_publicas").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando obra:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
