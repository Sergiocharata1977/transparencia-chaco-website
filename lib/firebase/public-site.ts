import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import {
  fallbackMunicipios,
  fallbackPublicaciones,
  getFallbackMunicipioBySlug,
  getFallbackPublicacionBySlug,
} from "@/lib/site-content"
import type { DenunciaPayload, Municipio, Publicacion, VoluntarioPayload } from "@/types/site"

function normalizeMunicipio(docId: string, data: Record<string, unknown>): Municipio {
  return {
    id: docId,
    slug: String(data.slug ?? docId),
    nombre: String(data.nombre ?? ""),
    estado: (data.estado as Municipio["estado"]) ?? "parcial",
    region: String(data.region ?? ""),
    provincia: String(data.provincia ?? "Chaco"),
    intendente: String(data.intendente ?? ""),
    poblacion: String(data.poblacion ?? ""),
    ultimaActualizacion: String(data.ultimaActualizacion ?? ""),
    descripcion: String(data.descripcion ?? ""),
    indicadores: Array.isArray(data.indicadores) ? (data.indicadores as Municipio["indicadores"]) : undefined,
    ordenanzas: Array.isArray(data.ordenanzas) ? (data.ordenanzas as Municipio["ordenanzas"]) : undefined,
    publicaciones: Array.isArray(data.publicaciones) ? (data.publicaciones as Municipio["publicaciones"]) : undefined,
  }
}

function normalizePublicacion(docId: string, data: Record<string, unknown>): Publicacion {
  return {
    id: docId,
    slug: String(data.slug ?? docId),
    titulo: String(data.titulo ?? ""),
    extracto: String(data.extracto ?? ""),
    fecha: String(data.fecha ?? ""),
    categoria: String(data.categoria ?? ""),
    municipio: String(data.municipio ?? ""),
    autor: String(data.autor ?? ""),
    imagen: String(data.imagen ?? "/placeholder.svg"),
    contenido: String(data.contenido ?? "<p>Contenido no disponible.</p>"),
    relacionadas: Array.isArray(data.relacionadas) ? (data.relacionadas as Publicacion["relacionadas"]) : undefined,
  }
}

export async function getMunicipios() {
  if (!hasFirebaseClientConfig) {
    return fallbackMunicipios
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackMunicipios
    }

    const snapshot = await getDocs(query(collection(db, "municipios"), orderBy("nombre"), limit(50)))
    const municipios = snapshot.docs.map((item) => normalizeMunicipio(item.id, item.data()))
    return municipios.length > 0 ? municipios : fallbackMunicipios
  } catch {
    return fallbackMunicipios
  }
}

export async function getMunicipioBySlug(slug: string) {
  if (!hasFirebaseClientConfig) {
    return getFallbackMunicipioBySlug(slug)
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return getFallbackMunicipioBySlug(slug)
    }

    const snapshot = await getDoc(doc(db, "municipios", slug))
    return snapshot.exists() ? normalizeMunicipio(snapshot.id, snapshot.data()) : getFallbackMunicipioBySlug(slug)
  } catch {
    return getFallbackMunicipioBySlug(slug)
  }
}

export async function getPublicaciones() {
  if (!hasFirebaseClientConfig) {
    return fallbackPublicaciones
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return fallbackPublicaciones
    }

    const snapshot = await getDocs(query(collection(db, "publicaciones"), orderBy("fecha", "desc"), limit(50)))
    const publicaciones = snapshot.docs.map((item) => normalizePublicacion(item.id, item.data()))
    return publicaciones.length > 0 ? publicaciones : fallbackPublicaciones
  } catch {
    return fallbackPublicaciones
  }
}

export async function getPublicacionBySlug(slug: string) {
  if (!hasFirebaseClientConfig) {
    return getFallbackPublicacionBySlug(slug)
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return getFallbackPublicacionBySlug(slug)
    }

    const snapshot = await getDoc(doc(db, "publicaciones", slug))
    return snapshot.exists() ? normalizePublicacion(snapshot.id, snapshot.data()) : getFallbackPublicacionBySlug(slug)
  } catch {
    return getFallbackPublicacionBySlug(slug)
  }
}

export async function submitDenuncia(payload: DenunciaPayload) {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error("Firebase no está configurado todavía.")
  }

  await addDoc(collection(db, "denuncias"), {
    ...payload,
    createdAt: serverTimestamp(),
    estado: "pendiente",
    origen: "web",
  })
}

export async function submitVoluntario(payload: VoluntarioPayload) {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error("Firebase no está configurado todavía.")
  }

  await addDoc(collection(db, "voluntarios"), {
    ...payload,
    createdAt: serverTimestamp(),
    estado: "nuevo",
    origen: "web",
  })
}
