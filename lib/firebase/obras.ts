import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import { fallbackObras } from "@/lib/fallback/obras-fallback"
import type { ObraFiltros, ObraPublica, ObraResumen } from "@/types/obras"

function normalizeObra(docId: string, data: Record<string, unknown>): ObraPublica {
  return {
    id: docId,
    municipio: String(data.municipio ?? ""),
    municipioSlug: String(data.municipioSlug ?? ""),
    nombre: String(data.nombre ?? ""),
    descripcion: String(data.descripcion ?? ""),
    ubicacionTexto: String(data.ubicacionTexto ?? ""),
    coordenadas:
      data.coordenadas &&
      typeof (data.coordenadas as Record<string, unknown>).lat === "number" &&
      typeof (data.coordenadas as Record<string, unknown>).lng === "number"
        ? {
            lat: Number((data.coordenadas as Record<string, unknown>).lat),
            lng: Number((data.coordenadas as Record<string, unknown>).lng),
          }
        : undefined,
    tipo: (data.tipo as ObraPublica["tipo"]) ?? "otro",
    origenFondos: (data.origenFondos as ObraPublica["origenFondos"]) ?? "desconocido",
    ejecucion: (data.ejecucion as ObraPublica["ejecucion"]) ?? "desconocido",
    responsableInformado: data.responsableInformado != null ? String(data.responsableInformado) : undefined,
    contratista: data.contratista != null ? String(data.contratista) : undefined,
    presupuestoInformado: data.presupuestoInformado != null ? String(data.presupuestoInformado) : undefined,
    fechaAnuncioISO: data.fechaAnuncioISO != null ? String(data.fechaAnuncioISO) : undefined,
    fechaInicioISO: data.fechaInicioISO != null ? String(data.fechaInicioISO) : undefined,
    fechaFinISO: data.fechaFinISO != null ? String(data.fechaFinISO) : undefined,
    estado: (data.estado as ObraPublica["estado"]) ?? "sin-informacion",
    avancePorcentaje: data.avancePorcentaje != null ? Number(data.avancePorcentaje) : undefined,
    fotos: Array.isArray(data.fotos) ? (data.fotos as string[]) : undefined,
    documentos: Array.isArray(data.documentos) ? (data.documentos as string[]) : undefined,
    fuenteInformacion: data.fuenteInformacion != null ? String(data.fuenteInformacion) : undefined,
    nivelVerificacion: (data.nivelVerificacion as ObraPublica["nivelVerificacion"]) ?? 1,
    pedidoInformeAsociado:
      data.pedidoInformeAsociado != null ? Boolean(data.pedidoInformeAsociado) : undefined,
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    estadoEditorial: (data.estadoEditorial as ObraPublica["estadoEditorial"]) ?? "published",
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt != null ? String(data.updatedAt) : undefined,
  }
}

export async function getObrasPublicas(filtros?: ObraFiltros): Promise<ObraPublica[]> {
  if (!hasFirebaseClientConfig) {
    const obras = fallbackObras.filter(
      (o) => o.visibilidadPublica && o.estadoEditorial === "published",
    )
    return filtros?.municipioSlug
      ? obras.filter((o) => o.municipioSlug === filtros.municipioSlug)
      : obras
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      const obras = fallbackObras.filter(
        (o) => o.visibilidadPublica && o.estadoEditorial === "published",
      )
      return filtros?.municipioSlug
        ? obras.filter((o) => o.municipioSlug === filtros.municipioSlug)
        : obras
    }

    const baseQuery = filtros?.municipioSlug
      ? query(
          collection(db, "obras_publicas"),
          where("visibilidadPublica", "==", true),
          where("estadoEditorial", "==", "published"),
          where("municipioSlug", "==", filtros.municipioSlug),
          orderBy("createdAt", "desc"),
          limit(100),
        )
      : query(
          collection(db, "obras_publicas"),
          where("visibilidadPublica", "==", true),
          where("estadoEditorial", "==", "published"),
          orderBy("createdAt", "desc"),
          limit(100),
        )

    const snapshot = await getDocs(baseQuery)
    const obras = snapshot.docs.map((item) => normalizeObra(item.id, item.data()))
    return obras.length > 0
      ? obras
      : fallbackObras.filter((o) => o.visibilidadPublica && o.estadoEditorial === "published")
  } catch {
    const obras = fallbackObras.filter(
      (o) => o.visibilidadPublica && o.estadoEditorial === "published",
    )
    return filtros?.municipioSlug
      ? obras.filter((o) => o.municipioSlug === filtros.municipioSlug)
      : obras
  }
}

export async function getObraById(id: string): Promise<ObraPublica | null> {
  if (!hasFirebaseClientConfig) {
    return fallbackObras.find((o) => o.id === id) ?? null
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackObras.find((o) => o.id === id) ?? null
    }

    const snapshot = await getDoc(doc(db, "obras_publicas", id))
    return snapshot.exists()
      ? normalizeObra(snapshot.id, snapshot.data())
      : (fallbackObras.find((o) => o.id === id) ?? null)
  } catch {
    return fallbackObras.find((o) => o.id === id) ?? null
  }
}

export function getResumenPorMunicipio(obras: ObraPublica[]): ObraResumen[] {
  const mapa = obras.reduce<Record<string, ObraResumen>>((acc, obra) => {
    if (!acc[obra.municipioSlug]) {
      acc[obra.municipioSlug] = {
        municipio: obra.municipio,
        municipioSlug: obra.municipioSlug,
        total: 0,
        finalizadas: 0,
        enEjecucion: 0,
        paralizadas: 0,
        sinInfo: 0,
      }
    }

    const resumen = acc[obra.municipioSlug]
    resumen.total += 1
    if (obra.estado === "finalizada") resumen.finalizadas += 1
    if (obra.estado === "en-ejecucion" || obra.estado === "iniciada") resumen.enEjecucion += 1
    if (obra.estado === "paralizada") resumen.paralizadas += 1
    if (obra.estado === "sin-informacion") resumen.sinInfo += 1

    return acc
  }, {})

  return Object.values(mapa)
}
