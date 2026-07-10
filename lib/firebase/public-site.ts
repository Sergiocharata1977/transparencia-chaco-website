import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"
import { getCiudadBySlug, getCiudadesActivas, type Ciudad } from "@/lib/firebase/ciudades"
import {
  fallbackMunicipios,
  fallbackPublicaciones,
  getFallbackMunicipioBySlug,
  getFallbackPublicacionBySlug,
} from "@/lib/site-content"
import type { DenunciaPayload, Municipio, Publicacion, VoluntarioPayload } from "@/types/site"

function normalizeCiudadAsMunicipio(ciudad: Ciudad): Municipio {
  const departamento = ciudad.departamento ? `Departamento ${ciudad.departamento}` : "Chaco"

  return {
    id: ciudad.id,
    slug: ciudad.slug,
    nombre: ciudad.nombre,
    estado: "parcial",
    region: departamento,
    provincia: ciudad.provincia,
    intendente: "",
    poblacion: ciudad.poblacion != null ? String(ciudad.poblacion) : "",
    ultimaActualizacion: "",
    descripcion:
      ciudad.descripcion ??
      `Municipio cubierto por el observatorio ciudadano de transparencia en ${departamento}.`,
    indicadores: [],
    ordenanzas: [],
    publicaciones: [],
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
  try {
    const ciudades = await getCiudadesActivas()
    return ciudades.map(normalizeCiudadAsMunicipio)
  } catch {
    return fallbackMunicipios
  }
}

export async function getMunicipioBySlug(slug: string) {
  try {
    const ciudad = await getCiudadBySlug(slug)
    return ciudad ? normalizeCiudadAsMunicipio(ciudad) : getFallbackMunicipioBySlug(slug)
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
