import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import type { CalleFiltros, CalleGeometry, CalleMunicipio, CallesMetricas } from "@/types/calles"

function normalizeGeometry(data: unknown): CalleGeometry | undefined {
  if (!data || typeof data !== "object") return undefined
  const value = data as Record<string, unknown>
  if (value.type !== "LineString" || !Array.isArray(value.coordinates)) return undefined

  const coordinates = value.coordinates.filter((item): item is [number, number] => (
    Array.isArray(item) &&
    item.length === 2 &&
    typeof item[0] === "number" &&
    typeof item[1] === "number"
  ))

  return coordinates.length >= 2 ? { type: "LineString", coordinates } : undefined
}

function normalizeCalle(docId: string, data: Record<string, unknown>): CalleMunicipio {
  return {
    id: docId,
    ciudadSlug: String(data.ciudadSlug ?? ""),
    ciudadNombre: String(data.ciudadNombre ?? ""),
    departamento: data.departamento != null ? String(data.departamento) : undefined,
    provincia: String(data.provincia ?? "Chaco"),
    nombreCalle: String(data.nombreCalle ?? ""),
    desde: String(data.desde ?? ""),
    hasta: String(data.hasta ?? ""),
    barrio: data.barrio != null ? String(data.barrio) : undefined,
    orientacion: data.orientacion != null ? String(data.orientacion) : undefined,
    cuadras100: Number(data.cuadras100 ?? 0),
    cuadras50: Number(data.cuadras50 ?? 0),
    cuadrasAsfaltadas: Number(data.cuadrasAsfaltadas ?? 0),
    cuadrasTierra: Number(data.cuadrasTierra ?? 0),
    estadoSuperficie: (data.estadoSuperficie as CalleMunicipio["estadoSuperficie"]) ?? "sin_dato",
    estadoObra: (data.estadoObra as CalleMunicipio["estadoObra"]) ?? "sin_obra",
    anioRelevamiento: Number(data.anioRelevamiento ?? new Date().getFullYear()),
    fechaRelevamientoISO: data.fechaRelevamientoISO != null ? String(data.fechaRelevamientoISO) : undefined,
    longitudMetros: Number(data.longitudMetros ?? 0),
    geometry: normalizeGeometry(data.geometry),
    fuente: (data.fuente as CalleMunicipio["fuente"]) ?? "observatorio",
    evidenciaUrl: data.evidenciaUrl != null ? String(data.evidenciaUrl) : undefined,
    fotoUrl: data.fotoUrl != null ? String(data.fotoUrl) : undefined,
    observaciones: data.observaciones != null ? String(data.observaciones) : undefined,
    obraPublicaId: data.obraPublicaId != null ? String(data.obraPublicaId) : undefined,
    obraNombre: data.obraNombre != null ? String(data.obraNombre) : undefined,
    sugerenciaSuperficie: data.sugerenciaSuperficie != null
      ? (String(data.sugerenciaSuperficie) as CalleMunicipio["sugerenciaSuperficie"])
      : undefined,
    sugerenciaConfianza: data.sugerenciaConfianza != null ? Number(data.sugerenciaConfianza) : undefined,
    sugerenciaFechaISO: data.sugerenciaFechaISO != null ? String(data.sugerenciaFechaISO) : undefined,
    sugerenciaDetalle: data.sugerenciaDetalle != null ? String(data.sugerenciaDetalle) : undefined,
    publico: Boolean(data.publico ?? false),
    historial: Array.isArray(data.historial) ? (data.historial as CalleMunicipio["historial"]) : undefined,
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt != null ? String(data.updatedAt) : undefined,
  }
}

export async function getCallesMunicipio(filtros?: CalleFiltros): Promise<CalleMunicipio[]> {
  if (!hasFirebaseClientConfig) return []

  try {
    const db = getFirebaseDb()
    if (!db) return []

    const snap = await getDocs(query(collection(db, "calles_municipio"), orderBy("createdAt", "desc"), limit(500)))
    return snap.docs
      .map((item) => normalizeCalle(item.id, item.data()))
      .filter((calle) => calle.publico)
      .filter((calle) => !filtros?.ciudadSlug || calle.ciudadSlug === filtros.ciudadSlug)
      .filter((calle) => !filtros?.anio || calle.anioRelevamiento === filtros.anio)
      .filter((calle) => !filtros?.estadoSuperficie || calle.estadoSuperficie === filtros.estadoSuperficie)
  } catch {
    return []
  }
}

export function calcularMetricasCalles(calles: CalleMunicipio[]): CallesMetricas {
  const metricas = calles.reduce<CallesMetricas>(
    (acc, calle) => {
      const metros = Number.isFinite(calle.longitudMetros) ? calle.longitudMetros : 0
      acc.totalTramos += 1
      acc.metrosRelevados += metros

      if (calle.estadoSuperficie === "asfaltada" || calle.estadoSuperficie === "adoquin") {
        acc.asfaltadas += 1
        acc.metrosAsfaltados += metros
      } else if (calle.estadoSuperficie === "en_obra") {
        acc.enObra += 1
        acc.metrosEnObra += metros
      } else if (calle.estadoSuperficie === "sin_dato") {
        acc.sinDato += 1
      } else {
        acc.noAsfaltadas += 1
        acc.metrosNoAsfaltados += metros
      }

      return acc
    },
    {
      totalTramos: 0,
      asfaltadas: 0,
      noAsfaltadas: 0,
      enObra: 0,
      sinDato: 0,
      metrosRelevados: 0,
      metrosAsfaltados: 0,
      metrosNoAsfaltados: 0,
      metrosEnObra: 0,
      porcentajeAsfaltado: 0,
    },
  )

  metricas.porcentajeAsfaltado = metricas.metrosRelevados > 0
    ? Math.round((metricas.metrosAsfaltados / metricas.metrosRelevados) * 100)
    : 0

  return metricas
}
