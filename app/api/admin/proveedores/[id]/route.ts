import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

const actualizarProveedorSchema = z.object({
  nombre: z.string().min(2).max(150).optional(),
  rubro: z.string().min(2).max(100).optional(),
  ciudad: z.string().min(2).max(60).optional(),
  ciudadSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]).optional(),
  organismoContratante: z.string().min(2).max(150).optional(),
  tipoContratacion: z.enum(["licitacion","contratacion-directa","concurso","convenio","desconocido"]).optional(),
  objeto: z.string().max(500).optional(),
  monto: z.string().max(50).optional(),
  periodo: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoCumplimiento: z.enum(["sin-evaluar","en-ejecucion","cumplido","observado"]).optional(),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().optional(),
  estadoEditorial: z.enum(["draft","review","published","archived"]).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarProveedorSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("proveedores_estado").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando proveedor:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  try {
    await getAdminDb().collection("proveedores_estado").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando proveedor:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
