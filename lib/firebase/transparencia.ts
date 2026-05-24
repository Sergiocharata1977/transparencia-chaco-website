import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import {
  fallbackMedios,
  fallbackPautas,
  fallbackPedidos,
  fallbackProveedores,
  fallbackRanking,
} from "@/lib/fallback/transparencia-fallback"
import type { Medio, PautaOficial, PedidoInformacion, ProveedorEstado, RankingMunicipio } from "@/types/transparencia"

// ---------------------------------------------------------------------------
// Normalize helpers
// ---------------------------------------------------------------------------

function normalizePedido(docId: string, data: Record<string, unknown>): PedidoInformacion {
  return {
    id: docId,
    fechaISO: String(data.fechaISO ?? ""),
    organismo: String(data.organismo ?? ""),
    municipio: String(data.municipio ?? ""),
    municipioSlug: String(data.municipioSlug ?? ""),
    tema: String(data.tema ?? ""),
    textoPedido: data.textoPedido !== undefined ? String(data.textoPedido) : undefined,
    archivoAdjunto: data.archivoAdjunto !== undefined ? String(data.archivoAdjunto) : undefined,
    estado: (data.estado as PedidoInformacion["estado"]) ?? "sin-respuesta",
    fechaRespuestaISO: data.fechaRespuestaISO !== undefined ? String(data.fechaRespuestaISO) : undefined,
    respuestaResumen: data.respuestaResumen !== undefined ? String(data.respuestaResumen) : undefined,
    documentosPublicos: Array.isArray(data.documentosPublicos)
      ? (data.documentosPublicos as string[])
      : undefined,
    nivelVerificacion: (data.nivelVerificacion as PedidoInformacion["nivelVerificacion"]) ?? 1,
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    estadoEditorial: (data.estadoEditorial as PedidoInformacion["estadoEditorial"]) ?? "draft",
    createdAt: data.createdAt !== undefined ? String(data.createdAt) : undefined,
  }
}

function normalizeMedio(docId: string, data: Record<string, unknown>): Medio {
  return {
    id: docId,
    nombre: String(data.nombre ?? ""),
    ciudadPrincipal: String(data.ciudadPrincipal ?? ""),
    ciudadSlug: String(data.ciudadSlug ?? ""),
    tipo: (data.tipo as Medio["tipo"]) ?? "otro",
    sitioWeb: data.sitioWeb !== undefined ? String(data.sitioWeb) : undefined,
    redesSociales: Array.isArray(data.redesSociales) ? (data.redesSociales as string[]) : undefined,
    responsableInformado:
      data.responsableInformado !== undefined ? String(data.responsableInformado) : undefined,
    razonSocial: data.razonSocial !== undefined ? String(data.razonSocial) : undefined,
    contactoPublico: data.contactoPublico !== undefined ? String(data.contactoPublico) : undefined,
    descripcion: data.descripcion !== undefined ? String(data.descripcion) : undefined,
    estado: (data.estado as Medio["estado"]) ?? "sin-verificar",
    recibePautaOficial:
      data.recibePautaOficial !== undefined ? Boolean(data.recibePautaOficial) : undefined,
    indiceTransparencia:
      data.indiceTransparencia !== undefined ? Number(data.indiceTransparencia) : undefined,
    semaforo: data.semaforo !== undefined ? (data.semaforo as Medio["semaforo"]) : undefined,
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    estadoEditorial: (data.estadoEditorial as Medio["estadoEditorial"]) ?? "draft",
    createdAt: data.createdAt !== undefined ? String(data.createdAt) : undefined,
  }
}

function normalizePauta(docId: string, data: Record<string, unknown>): PautaOficial {
  return {
    id: docId,
    medioId: String(data.medioId ?? ""),
    medioNombre: String(data.medioNombre ?? ""),
    organismo: String(data.organismo ?? ""),
    municipio: String(data.municipio ?? ""),
    municipioSlug: String(data.municipioSlug ?? ""),
    periodo: String(data.periodo ?? ""),
    monto: data.monto !== undefined ? String(data.monto) : undefined,
    concepto: data.concepto !== undefined ? String(data.concepto) : undefined,
    numeroDocumento: data.numeroDocumento !== undefined ? String(data.numeroDocumento) : undefined,
    fuenteDocumental: data.fuenteDocumental !== undefined ? String(data.fuenteDocumental) : undefined,
    archivoAdjunto: data.archivoAdjunto !== undefined ? String(data.archivoAdjunto) : undefined,
    estadoVerificacion:
      (data.estadoVerificacion as PautaOficial["estadoVerificacion"]) ?? "sin-verificar",
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    estadoEditorial: (data.estadoEditorial as PautaOficial["estadoEditorial"]) ?? "draft",
    createdAt: data.createdAt !== undefined ? String(data.createdAt) : undefined,
  }
}

function normalizeProveedor(docId: string, data: Record<string, unknown>): ProveedorEstado {
  return {
    id: docId,
    nombre: String(data.nombre ?? ""),
    rubro: String(data.rubro ?? ""),
    ciudad: String(data.ciudad ?? ""),
    ciudadSlug: String(data.ciudadSlug ?? ""),
    organismoContratante: String(data.organismoContratante ?? ""),
    tipoContratacion: (data.tipoContratacion as ProveedorEstado["tipoContratacion"]) ?? "desconocido",
    objeto: data.objeto !== undefined ? String(data.objeto) : undefined,
    monto: data.monto !== undefined ? String(data.monto) : undefined,
    periodo: data.periodo !== undefined ? String(data.periodo) : undefined,
    fuenteDocumental: data.fuenteDocumental !== undefined ? String(data.fuenteDocumental) : undefined,
    archivoAdjunto: data.archivoAdjunto !== undefined ? String(data.archivoAdjunto) : undefined,
    estadoCumplimiento:
      (data.estadoCumplimiento as ProveedorEstado["estadoCumplimiento"]) ?? "sin-evaluar",
    semaforo: data.semaforo !== undefined ? (data.semaforo as ProveedorEstado["semaforo"]) : undefined,
    visibilidadPublica: Boolean(data.visibilidadPublica ?? false),
    estadoEditorial: (data.estadoEditorial as ProveedorEstado["estadoEditorial"]) ?? "draft",
    createdAt: data.createdAt !== undefined ? String(data.createdAt) : undefined,
  }
}

function normalizeRanking(docId: string, data: Record<string, unknown>): RankingMunicipio {
  const criterios = (data.criterios as RankingMunicipio["criterios"]) ?? {
    publicaListadoObras: false,
    publicaPresupuesto: false,
    publicaContratistas: false,
    publicaAvanceFisico: false,
    publicaFechas: false,
    respondePedidos: false,
    publicaDocumentos: false,
  }

  return {
    municipio: String(data.municipio ?? docId),
    municipioSlug: String(data.municipioSlug ?? docId),
    puntajeTotal: Number(data.puntajeTotal ?? 0),
    criterios,
    obrasRegistradas: Number(data.obrasRegistradas ?? 0),
    obrasParalizadas: Number(data.obrasParalizadas ?? 0),
    accidentesReportados: Number(data.accidentesReportados ?? 0),
    reclamosSalud: Number(data.reclamosSalud ?? 0),
    pedidosSinRespuesta: Number(data.pedidosSinRespuesta ?? 0),
    updatedAt: data.updatedAt !== undefined ? String(data.updatedAt) : undefined,
  }
}

// ---------------------------------------------------------------------------
// Public queries
// ---------------------------------------------------------------------------

export async function getPedidosInformacion(municipioSlug?: string): Promise<PedidoInformacion[]> {
  if (!hasFirebaseClientConfig) {
    return municipioSlug
      ? fallbackPedidos.filter((p) => p.municipioSlug === municipioSlug)
      : fallbackPedidos
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return municipioSlug
        ? fallbackPedidos.filter((p) => p.municipioSlug === municipioSlug)
        : fallbackPedidos
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoEditorial", "==", "published"),
      ...(municipioSlug ? [where("municipioSlug", "==", municipioSlug)] : []),
      orderBy("fechaISO", "desc"),
      limit(50),
    ]

    const snapshot = await getDocs(query(collection(db, "pedidos_informacion"), ...constraints))
    const pedidos = snapshot.docs.map((item) => normalizePedido(item.id, item.data()))
    return pedidos.length > 0
      ? pedidos
      : municipioSlug
        ? fallbackPedidos.filter((p) => p.municipioSlug === municipioSlug)
        : fallbackPedidos
  } catch {
    return municipioSlug
      ? fallbackPedidos.filter((p) => p.municipioSlug === municipioSlug)
      : fallbackPedidos
  }
}

export async function getMedios(ciudadSlug?: string): Promise<Medio[]> {
  if (!hasFirebaseClientConfig) {
    return ciudadSlug ? fallbackMedios.filter((m) => m.ciudadSlug === ciudadSlug) : fallbackMedios
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return ciudadSlug ? fallbackMedios.filter((m) => m.ciudadSlug === ciudadSlug) : fallbackMedios
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoEditorial", "==", "published"),
      ...(ciudadSlug ? [where("ciudadSlug", "==", ciudadSlug)] : []),
      orderBy("nombre"),
      limit(50),
    ]

    const snapshot = await getDocs(query(collection(db, "medios"), ...constraints))
    const medios = snapshot.docs.map((item) => normalizeMedio(item.id, item.data()))
    return medios.length > 0
      ? medios
      : ciudadSlug
        ? fallbackMedios.filter((m) => m.ciudadSlug === ciudadSlug)
        : fallbackMedios
  } catch {
    return ciudadSlug ? fallbackMedios.filter((m) => m.ciudadSlug === ciudadSlug) : fallbackMedios
  }
}

export async function getMedioById(id: string): Promise<Medio | null> {
  if (!hasFirebaseClientConfig) {
    return fallbackMedios.find((m) => m.id === id) ?? null
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackMedios.find((m) => m.id === id) ?? null
    }

    const snapshot = await getDoc(doc(db, "medios", id))
    return snapshot.exists()
      ? normalizeMedio(snapshot.id, snapshot.data())
      : (fallbackMedios.find((m) => m.id === id) ?? null)
  } catch {
    return fallbackMedios.find((m) => m.id === id) ?? null
  }
}

export async function getPautasByMedio(medioId: string): Promise<PautaOficial[]> {
  if (!hasFirebaseClientConfig) {
    return fallbackPautas.filter((p) => p.medioId === medioId)
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackPautas.filter((p) => p.medioId === medioId)
    }

    const snapshot = await getDocs(
      query(
        collection(db, "pauta_oficial"),
        where("medioId", "==", medioId),
        where("visibilidadPublica", "==", true),
        limit(50),
      ),
    )
    const pautas = snapshot.docs.map((item) => normalizePauta(item.id, item.data()))
    return pautas.length > 0 ? pautas : fallbackPautas.filter((p) => p.medioId === medioId)
  } catch {
    return fallbackPautas.filter((p) => p.medioId === medioId)
  }
}

export async function getProveedores(ciudadSlug?: string): Promise<ProveedorEstado[]> {
  if (!hasFirebaseClientConfig) {
    return ciudadSlug
      ? fallbackProveedores.filter((p) => p.ciudadSlug === ciudadSlug)
      : fallbackProveedores
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return ciudadSlug
        ? fallbackProveedores.filter((p) => p.ciudadSlug === ciudadSlug)
        : fallbackProveedores
    }

    const constraints = [
      where("visibilidadPublica", "==", true),
      where("estadoEditorial", "==", "published"),
      ...(ciudadSlug ? [where("ciudadSlug", "==", ciudadSlug)] : []),
      orderBy("createdAt", "desc"),
      limit(100),
    ]

    const snapshot = await getDocs(query(collection(db, "proveedores_estado"), ...constraints))
    const proveedores = snapshot.docs.map((item) => normalizeProveedor(item.id, item.data()))
    return proveedores.length > 0
      ? proveedores
      : ciudadSlug
        ? fallbackProveedores.filter((p) => p.ciudadSlug === ciudadSlug)
        : fallbackProveedores
  } catch {
    return ciudadSlug
      ? fallbackProveedores.filter((p) => p.ciudadSlug === ciudadSlug)
      : fallbackProveedores
  }
}

export async function getRankingMunicipios(): Promise<RankingMunicipio[]> {
  if (!hasFirebaseClientConfig) {
    return fallbackRanking
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackRanking
    }

    const snapshot = await getDocs(
      query(collection(db, "ranking_municipios"), orderBy("puntajeTotal", "desc"), limit(10)),
    )
    const ranking = snapshot.docs.map((item) => normalizeRanking(item.id, item.data()))
    return ranking.length > 0 ? ranking : fallbackRanking
  } catch {
    return fallbackRanking
  }
}
