import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"


const actualizarObraSchema = z.object({
  municipio: z.string().min(2).max(60).optional(),
  municipioSlug: z.string().min(2).max(60).optional(),
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
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
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
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  try {
    await getAdminDb().collection("obras_publicas").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando obra:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
