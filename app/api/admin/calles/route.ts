import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const coordinateSchema = z.tuple([z.number(), z.number()])

const crearCalleSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  ciudadNombre: z.string().min(2).max(100),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).default("Chaco"),
  nombreCalle: z.string().min(2).max(120),
  desde: z.string().min(1).max(120),
  hasta: z.string().min(1).max(120),
  barrio: z.string().max(120).optional(),
  orientacion: z.string().max(60).optional(),
  cuadras100: z.number().min(0).default(0),
  cuadras50: z.number().min(0).default(0),
  cuadrasAsfaltadas: z.number().min(0).default(0),
  cuadrasTierra: z.number().min(0).default(0),
  estadoSuperficie: z.enum(["asfaltada", "no_asfaltada", "ripio", "tierra", "adoquin", "en_obra", "sin_dato"]),
  estadoObra: z.enum(["sin_obra", "proyectada", "anunciada", "en_ejecucion", "finalizada", "paralizada"]).default("sin_obra"),
  anioRelevamiento: z.number().int().min(2000).max(2100),
  fechaRelevamientoISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  longitudMetros: z.number().min(0).default(0),
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z.array(coordinateSchema).min(2),
  }).optional(),
  fuente: z.enum(["relevamiento_ciudadano", "municipio", "provincia", "observatorio", "imagen_satelital"]).default("observatorio"),
  evidenciaUrl: z.string().url().optional().or(z.literal("")),
  fotoUrl: z.string().url().optional().or(z.literal("")),
  observaciones: z.string().max(1000).optional(),
  obraPublicaId: z.string().max(120).optional(),
  obraNombre: z.string().max(200).optional(),
  publico: z.boolean().default(false),
})

function cleanUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const snap = await getAdminDb().collection("calles_municipio").orderBy("createdAt", "desc").limit(500).get()
    const calles = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ calles })
  } catch (error) {
    console.error("Error listando calles:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const result = crearCalleSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const ref = await getAdminDb().collection("calles_municipio").add({
      ...cleanUndefined(data),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      historial: [
        cleanUndefined({
          anio: data.anioRelevamiento,
          estadoSuperficie: data.estadoSuperficie,
          estadoObra: data.estadoObra,
          longitudMetros: data.longitudMetros,
          cuadrasAsfaltadas: data.cuadrasAsfaltadas,
          cuadrasTierra: data.cuadrasTierra,
          fechaRelevamientoISO: data.fechaRelevamientoISO || undefined,
          fuente: data.fuente,
          observaciones: data.observaciones || undefined,
        }),
      ],
    })

    return NextResponse.json({ id: ref.id, ...data }, { status: 201 })
  } catch (error) {
    console.error("Error creando calle:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
