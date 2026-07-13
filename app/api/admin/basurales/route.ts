import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const coordinateSchema = z.tuple([z.number(), z.number()])

const basuralSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  ciudadNombre: z.string().min(2).max(100),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).default("Chaco"),
  nombre: z.string().max(150).optional(),
  descripcion: z.string().max(2000).optional(),
  ubicacionTexto: z.string().max(200).optional(),
  barrio: z.string().max(120).optional(),
  geometry: z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(coordinateSchema).min(4)).min(1),
  }).optional(),
  areaM2: z.number().min(0).default(0),
  confianza: z.number().min(0).max(1).optional(),
  ndviPromedio: z.number().optional(),
  bsiPromedio: z.number().optional(),
  fechaDeteccionISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  escenaId: z.string().max(200).optional(),
  estadoVerificacion: z.enum(["candidato", "verificado_foto", "verificado_campo", "descartado", "erradicado"]).default("candidato"),
  gravedad: z.enum(["baja", "media", "alta"]).optional(),
  fuente: z.enum(["modelo_espectral", "imagen_satelital", "reporte_ciudadano", "municipio", "observatorio"]).default("observatorio"),
  evidenciaUrl: z.string().url().optional().or(z.literal("")),
  fotoUrl: z.string().url().optional().or(z.literal("")),
  observaciones: z.string().max(1000).optional(),
  reclamoId: z.string().max(120).optional(),
  publico: z.boolean().default(false),
})

function cleanUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as Partial<T>
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const snap = await getAdminDb().collection("basurales").orderBy("createdAt", "desc").limit(500).get()
    const basurales = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ basurales })
  } catch (error) {
    console.error("Error listando basurales:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const result = basuralSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const payload = cleanUndefined({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      historial: [
        cleanUndefined({
          fechaISO: data.fechaDeteccionISO,
          areaM2: data.areaM2,
          estadoVerificacion: data.estadoVerificacion,
          fuente: data.fuente,
          escenaId: data.escenaId,
          observaciones: data.observaciones,
        }),
      ],
    })

    const ref = await getAdminDb().collection("basurales").add(payload)
    return NextResponse.json({ id: ref.id, ...data }, { status: 201 })
  } catch (error) {
    console.error("Error creando basural:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
