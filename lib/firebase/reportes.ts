import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import { fallbackAccidentes, fallbackReportes, fallbackReportesSalud } from "@/lib/fallback/reportes-fallback"
import type { ReporteAccidente, ReporteCiudadano, ReporteSalud } from "@/types/reportes"

function normalizeReporte(docId: string, data: Record<string, unknown>): ReporteCiudadano {
  return {
    id: docId,
    municipio: String(data.municipio ?? ""),
    municipioSlug: (data.municipioSlug as ReporteCiudadano["municipioSlug"]) ?? "charata",
    tipo: (data.tipo as ReporteCiudadano["tipo"]) ?? "otro",
    titulo: String(data.titulo ?? ""),
    descripcion: String(data.descripcion ?? ""),
    fechaHechoISO: data.fechaHechoISO ? String(data.fechaHechoISO) : undefined,
    ubicacionTexto: data.ubicacionTexto ? String(data.ubicacionTexto) : undefined,
    coordenadas:
      data.coordenadas &&
      typeof (data.coordenadas as Record<string, unknown>).lat === "number" &&
      typeof (data.coordenadas as Record<string, unknown>).lng === "number"
        ? (data.coordenadas as { lat: number; lng: number })
        : undefined,
    fuente: data.fuente ? String(data.fuente) : undefined,
    anonimo: Boolean(data.anonimo ?? true),
    estadoInterno: (data.estadoInterno as ReporteCiudadano["estadoInterno"]) ?? "recibido",
    nivelVerificacion: (data.nivelVerificacion as ReporteCiudadano["nivelVerificacion"]) ?? 1,
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    createdAt: data.createdAt ? String(data.createdAt) : undefined,
    // NUNCA mapear campos de contacto (email, nombre, telefono)
  }
}

function normalizeAccidente(docId: string, data: Record<string, unknown>): ReporteAccidente {
  return {
    ...normalizeReporte(docId, data),
    subtipo: (data.subtipo as ReporteAccidente["subtipo"]) ?? "otro",
    gravedad: data.gravedad ? (data.gravedad as ReporteAccidente["gravedad"]) : undefined,
    huboDenunciaPolicial: data.huboDenunciaPolicial
      ? (data.huboDenunciaPolicial as ReporteAccidente["huboDenunciaPolicial"])
      : undefined,
    huboIntervencionMunicipal: data.huboIntervencionMunicipal
      ? (data.huboIntervencionMunicipal as ReporteAccidente["huboIntervencionMunicipal"])
      : undefined,
  }
}

function normalizeReporteSalud(docId: string, data: Record<string, unknown>): ReporteSalud {
  return {
    ...normalizeReporte(docId, data),
    hospital: data.hospital ? String(data.hospital) : undefined,
    tipoProblema: (data.tipoProblema as ReporteSalud["tipoProblema"]) ?? "otro",
    hizoReclamoFormal: data.hizoReclamoFormal !== undefined ? Boolean(data.hizoReclamoFormal) : undefined,
    recibioRespuesta: data.recibioRespuesta !== undefined ? Boolean(data.recibioRespuesta) : undefined,
  }
}

export async function getReportes(municipioSlug?: string): Promise<ReporteCiudadano[]> {
  if (!hasFirebaseClientConfig) {
    if (municipioSlug) {
      return fallbackReportes.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackReportes
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      if (municipioSlug) {
        return fallbackReportes.filter((r) => r.municipioSlug === municipioSlug)
      }
      return fallbackReportes
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoInterno", "==", "publicado"),
      orderBy("createdAt", "desc"),
      limit(50),
    ]

    if (municipioSlug) {
      constraints.unshift(where("municipioSlug", "==", municipioSlug))
    }

    const snapshot = await getDocs(query(collection(db, "reportes_ciudadanos"), ...constraints))
    const reportes = snapshot.docs.map((item) => normalizeReporte(item.id, item.data()))
    return reportes.length > 0
      ? reportes
      : municipioSlug
        ? fallbackReportes.filter((r) => r.municipioSlug === municipioSlug)
        : fallbackReportes
  } catch {
    if (municipioSlug) {
      return fallbackReportes.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackReportes
  }
}

export async function getAccidentes(municipioSlug?: string): Promise<ReporteAccidente[]> {
  if (!hasFirebaseClientConfig) {
    if (municipioSlug) {
      return fallbackAccidentes.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackAccidentes
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      if (municipioSlug) {
        return fallbackAccidentes.filter((r) => r.municipioSlug === municipioSlug)
      }
      return fallbackAccidentes
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoInterno", "==", "publicado"),
      orderBy("createdAt", "desc"),
      limit(50),
    ]

    if (municipioSlug) {
      constraints.unshift(where("municipioSlug", "==", municipioSlug))
    }

    const snapshot = await getDocs(query(collection(db, "accidentes"), ...constraints))
    const accidentes = snapshot.docs.map((item) => normalizeAccidente(item.id, item.data()))
    return accidentes.length > 0
      ? accidentes
      : municipioSlug
        ? fallbackAccidentes.filter((r) => r.municipioSlug === municipioSlug)
        : fallbackAccidentes
  } catch {
    if (municipioSlug) {
      return fallbackAccidentes.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackAccidentes
  }
}

export async function getReportesSalud(municipioSlug?: string): Promise<ReporteSalud[]> {
  if (!hasFirebaseClientConfig) {
    if (municipioSlug) {
      return fallbackReportesSalud.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackReportesSalud
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      if (municipioSlug) {
        return fallbackReportesSalud.filter((r) => r.municipioSlug === municipioSlug)
      }
      return fallbackReportesSalud
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoInterno", "==", "publicado"),
      orderBy("createdAt", "desc"),
      limit(50),
    ]

    if (municipioSlug) {
      constraints.unshift(where("municipioSlug", "==", municipioSlug))
    }

    const snapshot = await getDocs(query(collection(db, "reclamos_salud"), ...constraints))
    const reportesSalud = snapshot.docs.map((item) => normalizeReporteSalud(item.id, item.data()))
    return reportesSalud.length > 0
      ? reportesSalud
      : municipioSlug
        ? fallbackReportesSalud.filter((r) => r.municipioSlug === municipioSlug)
        : fallbackReportesSalud
  } catch {
    if (municipioSlug) {
      return fallbackReportesSalud.filter((r) => r.municipioSlug === municipioSlug)
    }
    return fallbackReportesSalud
  }
}
