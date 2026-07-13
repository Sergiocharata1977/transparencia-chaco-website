import { NextRequest, NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"
import { buscarEscenas, obtenerMascaraBasural } from "@/lib/satelital/copernicus"
import { agruparPixeles, areaAnilloM2, clusterAPoligono } from "@/lib/satelital/geo"
import { parseTiff } from "@/lib/satelital/tiff"

export const maxDuration = 60

const detectarBasuralesSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  ciudadNombre: z.string().min(2).max(100),
  departamento: z.string().max(60).optional(),
  provincia: z.string().max(60).default("Chaco"),
  bbox: z.object({
    lonMin: z.number(),
    latMin: z.number(),
    lonMax: z.number(),
    latMax: z.number(),
  }),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  width: z.number().int().min(50).max(1200).default(500),
  height: z.number().int().min(50).max(1200).default(500),
  minPixeles: z.number().int().min(3).max(1000).default(25),
})

function cleanUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as Partial<T>
}

function polygonKey(anillo: [number, number][]): string {
  return anillo
    .slice(0, 3)
    .map(([lon, lat]) => `${lon.toFixed(4)},${lat.toFixed(4)}`)
    .join("|")
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const result = detectarBasuralesSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const escenas = await buscarEscenas(data.bbox, data.fechaDesde, data.fechaHasta, 30, 1)
    const escena = escenas[0]
    if (!escena) {
      return NextResponse.json({ error: "No se encontraron escenas Sentinel-2 con baja nubosidad" }, { status: 404 })
    }

    const buffer = await obtenerMascaraBasural(data.bbox, data.fechaDesde, data.fechaHasta, data.width, data.height)
    const raster = parseTiff(buffer)
    const clusters = agruparPixeles(raster.width, raster.height, (x, y) => raster.get(x, y, 0) > 0, data.minPixeles)

    const existingSnap = await getAdminDb()
      .collection("basurales")
      .where("ciudadSlug", "==", data.ciudadSlug)
      .limit(300)
      .get()

    const existingKeys = new Set(
      existingSnap.docs
        .filter((doc) => doc.data().escenaId === escena.id)
        .map((doc) => doc.data().geometry)
        .filter((geometry) => geometry?.type === "Polygon" && Array.isArray(geometry.coordinates?.[0]))
        .map((geometry) => polygonKey(geometry.coordinates[0] as [number, number][])),
    )

    let candidatosCreados = 0
    let duplicados = 0
    const batch = getAdminDb().batch()
    const hoy = new Date().toISOString().slice(0, 10)

    for (const cluster of clusters) {
      const anillo = clusterAPoligono(cluster, raster.width, raster.height, data.bbox)
      const key = polygonKey(anillo)
      if (existingKeys.has(key)) {
        duplicados += 1
        continue
      }

      const areaM2 = Math.round(areaAnilloM2(anillo))
      const confianza = Math.min(0.95, Math.max(0.35, cluster.count / Math.max(data.minPixeles, 1) / 10))
      const ref = getAdminDb().collection("basurales").doc()
      batch.set(ref, cleanUndefined({
        ciudadSlug: data.ciudadSlug,
        ciudadNombre: data.ciudadNombre,
        departamento: data.departamento,
        provincia: data.provincia,
        nombre: `Candidato satelital ${candidatosCreados + 1}`,
        geometry: { type: "Polygon", coordinates: [anillo] },
        areaM2,
        confianza,
        fechaDeteccionISO: escena.fecha || hoy,
        escenaId: escena.id,
        estadoVerificacion: "candidato",
        fuente: "modelo_espectral",
        publico: false,
        observaciones: "Candidato generado automaticamente por mascara espectral Sentinel-2. Requiere verificacion humana.",
        historial: [
          cleanUndefined({
            fechaISO: escena.fecha || hoy,
            areaM2,
            estadoVerificacion: "candidato",
            fuente: "modelo_espectral",
            escenaId: escena.id,
            observaciones: "Alta automatica como candidato privado.",
          }),
        ],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }))
      existingKeys.add(key)
      candidatosCreados += 1
    }

    if (candidatosCreados > 0) await batch.commit()

    return NextResponse.json({
      escenaId: escena.id,
      fecha: escena.fecha,
      clustersDetectados: clusters.length,
      candidatosCreados,
      duplicados,
    })
  } catch (error) {
    console.error("Error detectando basurales:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 })
  }
}
