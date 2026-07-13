import { NextRequest, NextResponse } from "next/server"
import { FieldValue, type DocumentReference } from "firebase-admin/firestore"
import { z } from "zod"

import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"
import { buscarEscenas, obtenerBandasCalles } from "@/lib/satelital/copernicus"
import { bboxDeCoordenadas, lonLatAPixel, muestrearLineString } from "@/lib/satelital/geo"
import { parseTiff } from "@/lib/satelital/tiff"

export const maxDuration = 60

// Sentinel-2 10 m/px: una calle equivale aproximadamente a 1 pixel.
// La clasificacion es una sugerencia a verificar por el admin; no distingue ripio de tierra.

const detectarCallesSchema = z.object({
  ciudadSlug: z.string().min(2).max(60),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

type SugerenciaSuperficie = "asfaltada" | "no_asfaltada" | "sin_dato"

interface ResultadoTramo {
  sugerenciaSuperficie: SugerenciaSuperficie
  sugerenciaConfianza: number
  sugerenciaDetalle: string
}

function normalizeLineString(data: unknown): [number, number][] | null {
  if (!data || typeof data !== "object") return null
  const geometry = data as Record<string, unknown>
  if (geometry.type !== "LineString" || !Array.isArray(geometry.coordinates)) return null

  const coords = geometry.coordinates.filter((item): item is [number, number] => (
    Array.isArray(item) &&
    item.length === 2 &&
    typeof item[0] === "number" &&
    typeof item[1] === "number"
  ))

  return coords.length >= 2 ? coords : null
}

function clasificarTramo(coordinates: [number, number][], raster: ReturnType<typeof parseTiff>, bbox: Parameters<typeof lonLatAPixel>[4]): ResultadoTramo {
  const puntos = muestrearLineString(coordinates, 15)
  let asfalto = 0
  let suelo = 0
  let definidos = 0

  for (const punto of puntos) {
    const pixel = lonLatAPixel(punto[0], punto[1], raster.width, raster.height, bbox)
    const b02 = raster.get(pixel.x, pixel.y, 0)
    const b03 = raster.get(pixel.x, pixel.y, 1)
    const b04 = raster.get(pixel.x, pixel.y, 2)
    const b08 = raster.get(pixel.x, pixel.y, 3)
    const brillo = (b02 + b03 + b04) / 3
    const ndvi = (b08 - b04) / (b08 + b04 + 1e-10)

    if (brillo < 0.11 && ndvi < 0.3) {
      asfalto += 1
      definidos += 1
    } else if (brillo >= 0.17 && b04 > b02) {
      suelo += 1
      definidos += 1
    }
  }

  if (definidos < 3) {
    return {
      sugerenciaSuperficie: "sin_dato",
      sugerenciaConfianza: 0,
      sugerenciaDetalle: `${definidos}/${puntos.length} puntos definidos; sin evidencia suficiente`,
    }
  }

  const proporcionAsfalto = asfalto / definidos
  const proporcionSuelo = suelo / definidos
  if (proporcionAsfalto >= 0.6) {
    return {
      sugerenciaSuperficie: "asfaltada",
      sugerenciaConfianza: Number(proporcionAsfalto.toFixed(2)),
      sugerenciaDetalle: `${asfalto}/${definidos} puntos oscuros no vegetados (asfalto probable)`,
    }
  }

  if (proporcionSuelo >= 0.6) {
    return {
      sugerenciaSuperficie: "no_asfaltada",
      sugerenciaConfianza: Number(proporcionSuelo.toFixed(2)),
      sugerenciaDetalle: `${suelo}/${definidos} puntos brillantes rojizos (tierra/ripio probable)`,
    }
  }

  return {
    sugerenciaSuperficie: "sin_dato",
    sugerenciaConfianza: Number(Math.max(proporcionAsfalto, proporcionSuelo).toFixed(2)),
    sugerenciaDetalle: `${asfalto}/${definidos} asfalto probable y ${suelo}/${definidos} suelo probable; sin mayoria`,
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response

  try {
    const body = await req.json()
    const result = detectarCallesSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos invalidos", details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data
    const snap = await getAdminDb()
      .collection("calles_municipio")
      .where("ciudadSlug", "==", data.ciudadSlug)
      .limit(500)
      .get()

    const tramos = snap.docs
      .map((doc) => ({ id: doc.id, ref: doc.ref, coordinates: normalizeLineString(doc.data().geometry) }))
      .filter((tramo): tramo is { id: string; ref: DocumentReference; coordinates: [number, number][] } => Boolean(tramo.coordinates))

    if (tramos.length === 0) {
      return NextResponse.json({ escenaId: null, fecha: null, tramosAnalizados: 0, sugerenciasAsfaltada: 0, sugerenciasNoAsfaltada: 0, sinDato: 0 })
    }

    const bbox = bboxDeCoordenadas(tramos.flatMap((tramo) => tramo.coordinates), 0.01)
    const escenas = await buscarEscenas(bbox, data.fechaDesde, data.fechaHasta, 30, 1)
    const escena = escenas[0]
    if (!escena) {
      return NextResponse.json({ error: "No se encontraron escenas Sentinel-2 con baja nubosidad" }, { status: 404 })
    }

    const buffer = await obtenerBandasCalles(bbox, data.fechaDesde, data.fechaHasta, 600, 600)
    const raster = parseTiff(buffer)
    const batch = getAdminDb().batch()
    const hoy = new Date().toISOString().slice(0, 10)

    let sugerenciasAsfaltada = 0
    let sugerenciasNoAsfaltada = 0
    let sinDato = 0

    for (const tramo of tramos) {
      const sugerencia = clasificarTramo(tramo.coordinates, raster, bbox)
      if (sugerencia.sugerenciaSuperficie === "asfaltada") sugerenciasAsfaltada += 1
      if (sugerencia.sugerenciaSuperficie === "no_asfaltada") sugerenciasNoAsfaltada += 1
      if (sugerencia.sugerenciaSuperficie === "sin_dato") sinDato += 1

      batch.update(tramo.ref, {
        sugerenciaSuperficie: sugerencia.sugerenciaSuperficie,
        sugerenciaConfianza: sugerencia.sugerenciaConfianza,
        sugerenciaFechaISO: hoy,
        sugerenciaDetalle: sugerencia.sugerenciaDetalle,
        updatedAt: FieldValue.serverTimestamp(),
      })
    }

    await batch.commit()

    return NextResponse.json({
      escenaId: escena.id,
      fecha: escena.fecha,
      tramosAnalizados: tramos.length,
      sugerenciasAsfaltada,
      sugerenciasNoAsfaltada,
      sinDato,
    })
  } catch (error) {
    console.error("Error clasificando calles:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 })
  }
}
