import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const coordinateSchema = z.tuple([z.number(), z.number()])

const actualizarCalleSchema = z.object({
  ciudadSlug: z.string().min(2).max(60).optional(),
  ciudadNombre: z.string().min(2).max(100).optional(),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).optional(),
  nombreCalle: z.string().min(2).max(120).optional(),
  desde: z.string().min(1).max(120).optional(),
  hasta: z.string().min(1).max(120).optional(),
  barrio: z.string().max(120).optional(),
  estadoSuperficie: z.enum(["asfaltada", "no_asfaltada", "ripio", "tierra", "adoquin", "en_obra", "sin_dato"]).optional(),
  estadoObra: z.enum(["sin_obra", "proyectada", "anunciada", "en_ejecucion", "finalizada", "paralizada"]).optional(),
  anioRelevamiento: z.number().int().min(2000).max(2100).optional(),
  fechaRelevamientoISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  longitudMetros: z.number().min(0).optional(),
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(coordinateSchema).min(2),
  }).optional(),
  fuente: z.enum(["relevamiento_ciudadano", "municipio", "provincia", "observatorio", "imagen_satelital"]).optional(),
  evidenciaUrl: z.string().url().optional().or(z.literal("")),
  fotoUrl: z.string().url().optional().or(z.literal("")),
  observaciones: z.string().max(1000).optional(),
  obraPublicaId: z.string().max(120).optional(),
  obraNombre: z.string().max(200).optional(),
  publico: z.boolean().optional(),
})

function cleanUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

function shouldAppendHistorial(data: z.infer<typeof actualizarCalleSchema>): boolean {
  return [
    "estadoSuperficie",
    "estadoObra",
    "anioRelevamiento",
    "fechaRelevamientoISO",
    "fuente",
    "observaciones",
  ].some((key) => key in data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    const body = await req.json()
    const result = actualizarCalleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const ref = getAdminDb().collection("calles_municipio").doc(id)
    const currentSnap = await ref.get()
    if (!currentSnap.exists) {
      return NextResponse.json({ error: "Calle no encontrada" }, { status: 404 })
    }

    const current = currentSnap.data() ?? {}
    const updatePayload: Record<string, unknown> = {
      ...cleanUndefined(data),
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (shouldAppendHistorial(data)) {
      updatePayload.historial = FieldValue.arrayUnion(cleanUndefined({
        anio: data.anioRelevamiento ?? Number(current.anioRelevamiento ?? new Date().getFullYear()),
        estadoSuperficie: data.estadoSuperficie ?? current.estadoSuperficie ?? "sin_dato",
        estadoObra: data.estadoObra ?? current.estadoObra ?? "sin_obra",
        fechaRelevamientoISO: data.fechaRelevamientoISO || undefined,
        fuente: data.fuente ?? current.fuente ?? "observatorio",
        observaciones: data.observaciones || undefined,
      }))
    }

    await ref.update(updatePayload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando calle:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    await getAdminDb().collection("calles_municipio").doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando calle:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
