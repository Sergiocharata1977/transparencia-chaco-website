import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const coordinateSchema = z.tuple([z.number(), z.number()])

const actualizarBasuralSchema = z.object({
  ciudadSlug: z.string().min(2).max(60).optional(),
  ciudadNombre: z.string().min(2).max(100).optional(),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  nombre: z.string().max(150).optional(),
  descripcion: z.string().max(2000).optional(),
  ubicacionTexto: z.string().max(200).optional(),
  barrio: z.string().max(120).optional(),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(coordinateSchema).min(4)).min(1),
  }).optional(),
  areaM2: z.number().min(0).optional(),
  confianza: z.number().min(0).max(1).optional(),
  ndviPromedio: z.number().optional(),
  bsiPromedio: z.number().optional(),
  fechaDeteccionISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  escenaId: z.string().max(200).optional(),
  estadoVerificacion: z.enum(["candidato", "verificado_foto", "verificado_campo", "descartado", "erradicado"]).optional(),
  gravedad: z.enum(["baja", "media", "alta"]).optional(),
  fuente: z.enum(["modelo_espectral", "imagen_satelital", "reporte_ciudadano", "municipio", "observatorio"]).optional(),
  evidenciaUrl: z.string().url().optional().or(z.literal("")),
  fotoUrl: z.string().url().optional().or(z.literal("")),
  observaciones: z.string().max(1000).optional(),
  reclamoId: z.string().max(120).optional(),
  publico: z.boolean().optional(),
})

function cleanUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as Partial<T>
}

function shouldAppendHistorial(data: z.infer<typeof actualizarBasuralSchema>): boolean {
  return [
    "estadoVerificacion",
    "areaM2",
    "fuente",
    "escenaId",
    "fechaDeteccionISO",
    "observaciones",
  ].some((key) => key in data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    const body = await req.json()
    const result = actualizarBasuralSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const ref = getAdminDb().collection("basurales").doc(id)
    const currentSnap = await ref.get()
    if (!currentSnap.exists) {
      return NextResponse.json({ error: "Basural no encontrado" }, { status: 404 })
    }

    const current = currentSnap.data() ?? {}
    const updatePayload: Record<string, unknown> = {
      ...cleanUndefined(data),
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (shouldAppendHistorial(data)) {
      updatePayload.historial = FieldValue.arrayUnion(cleanUndefined({
        fechaISO: data.fechaDeteccionISO ?? current.fechaDeteccionISO ?? new Date().toISOString().slice(0, 10),
        areaM2: data.areaM2 ?? current.areaM2 ?? 0,
        estadoVerificacion: data.estadoVerificacion ?? current.estadoVerificacion ?? "candidato",
        fuente: data.fuente ?? current.fuente ?? "observatorio",
        escenaId: data.escenaId ?? current.escenaId,
        observaciones: data.observaciones || undefined,
      }))
    }

    await ref.update(updatePayload)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando basural:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    await getAdminDb().collection("basurales").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando basural:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
