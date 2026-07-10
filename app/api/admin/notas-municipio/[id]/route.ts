import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const actualizarNotaSchema = z.object({
  ciudadSlug: z.string().min(2).max(60).optional(),
  ciudadNombre: z.string().min(2).max(100).optional(),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  tipo: z.enum(["pedido_informacion", "nota_administrativa", "solicitud_vecinal", "reclamo_formal"]).optional(),
  titulo: z.string().min(5).max(200).optional(),
  descripcion: z.string().min(10).max(2000).optional(),
  destinatario: z.string().min(2).max(150).optional(),
  fechaEnvioISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estado: z.enum(["borrador", "enviada", "respondida", "vencida", "archivada"]).optional(),
  respuesta: z.string().max(2000).optional(),
  fechaRespuestaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  archivoUrl: z.string().url().optional().or(z.literal("")),
  publico: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  try {
    const body = await req.json()
    const result = actualizarNotaSchema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    await getAdminDb().collection("notas_municipio").doc(id).update({ ...result.data, updatedAt: FieldValue.serverTimestamp() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando nota al municipio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  const { id } = await params
  try {
    await getAdminDb().collection("notas_municipio").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando nota al municipio:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
