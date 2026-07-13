import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import type { Basural, BasuralFiltros, BasuralGeometry, BasuralesMetricas } from "@/types/basurales"

function normalizeGeometry(data: unknown): BasuralGeometry | undefined {
  if (!data || typeof data !== "object") return undefined
  const value = data as Record<string, unknown>
  if (value.type !== "Polygon" || !Array.isArray(value.coordinates)) return undefined

  const coordinates = value.coordinates
    .filter(Array.isArray)
    .map((ring) => ring.filter((item): item is [number, number] => (
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === "number" &&
      typeof item[1] === "number"
    )))
    .filter((ring) => ring.length >= 4)

  return coordinates.length > 0 ? { type: "Polygon", coordinates } : undefined
}

function normalizeBasural(docId: string, data: Record<string, unknown>): Basural {
  return {
    id: docId,
    ciudadSlug: String(data.ciudadSlug ?? ""),
    ciudadNombre: String(data.ciudadNombre ?? ""),
    departamento: data.departamento != null ? String(data.departamento) : undefined,
    provincia: String(data.provincia ?? "Chaco"),
    nombre: data.nombre != null ? String(data.nombre) : undefined,
    descripcion: data.descripcion != null ? String(data.descripcion) : undefined,
    ubicacionTexto: data.ubicacionTexto != null ? String(data.ubicacionTexto) : undefined,
    barrio: data.barrio != null ? String(data.barrio) : undefined,
    geometry: normalizeGeometry(data.geometry),
    areaM2: Number(data.areaM2 ?? 0),
    confianza: data.confianza != null ? Number(data.confianza) : undefined,
    ndviPromedio: data.ndviPromedio != null ? Number(data.ndviPromedio) : undefined,
    bsiPromedio: data.bsiPromedio != null ? Number(data.bsiPromedio) : undefined,
    fechaDeteccionISO: String(data.fechaDeteccionISO ?? ""),
    escenaId: data.escenaId != null ? String(data.escenaId) : undefined,
    estadoVerificacion: (data.estadoVerificacion as Basural["estadoVerificacion"]) ?? "candidato",
    gravedad: data.gravedad != null ? (String(data.gravedad) as Basural["gravedad"]) : undefined,
    fuente: (data.fuente as Basural["fuente"]) ?? "observatorio",
    evidenciaUrl: data.evidenciaUrl != null ? String(data.evidenciaUrl) : undefined,
    fotoUrl: data.fotoUrl != null ? String(data.fotoUrl) : undefined,
    observaciones: data.observaciones != null ? String(data.observaciones) : undefined,
    reclamoId: data.reclamoId != null ? String(data.reclamoId) : undefined,
    publico: Boolean(data.publico ?? false),
    historial: Array.isArray(data.historial) ? (data.historial as Basural["historial"]) : undefined,
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt != null ? String(data.updatedAt) : undefined,
  }
}

export async function getBasurales(filtros?: BasuralFiltros): Promise<Basural[]> {
  if (!hasFirebaseClientConfig) return []

  try {
    const db = getFirebaseDb()
    if (!db) return []

    const snap = await getDocs(query(collection(db, "basurales"), orderBy("createdAt", "desc"), limit(500)))
    return snap.docs
      .map((item) => normalizeBasural(item.id, item.data()))
      .filter((basural) => basural.publico)
      .filter((basural) => !filtros?.ciudadSlug || basural.ciudadSlug === filtros.ciudadSlug)
      .filter((basural) => !filtros?.estadoVerificacion || basural.estadoVerificacion === filtros.estadoVerificacion)
      .filter((basural) => !filtros?.anio || Number(basural.fechaDeteccionISO.slice(0, 4)) === filtros.anio)
  } catch {
    return []
  }
}

export function calcularMetricasBasurales(basurales: Basural[]): BasuralesMetricas {
  return basurales.reduce<BasuralesMetricas>(
    (acc, basural) => {
      const area = Number.isFinite(basural.areaM2) ? basural.areaM2 : 0
      const verificado = basural.estadoVerificacion === "verificado_foto" || basural.estadoVerificacion === "verificado_campo"

      acc.total += 1
      acc.areaTotalM2 += area
      if (basural.estadoVerificacion === "candidato") acc.candidatos += 1
      if (verificado) {
        acc.verificados += 1
        acc.areaVerificadaM2 += area
      }
      if (basural.estadoVerificacion === "erradicado") acc.erradicados += 1
      if (basural.estadoVerificacion === "descartado") acc.descartados += 1
      if (basural.reclamoId) acc.conReclamo += 1

      return acc
    },
    {
      total: 0,
      candidatos: 0,
      verificados: 0,
      erradicados: 0,
      descartados: 0,
      areaTotalM2: 0,
      areaVerificadaM2: 0,
      conReclamo: 0,
    },
  )
}
