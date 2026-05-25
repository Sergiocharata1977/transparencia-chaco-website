import { collection, getDocs, orderBy, query, where, doc, getDoc } from "firebase/firestore"
import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"

export interface Ciudad {
  id: string
  slug: string
  nombre: string
  provincia: string
  activa: boolean
  descripcion?: string
  poblacion?: number
  createdAt?: string
  updatedAt?: string
}

export const CIUDADES_FALLBACK: Ciudad[] = [
  { id: "charata", slug: "charata", nombre: "Charata", provincia: "Chaco", activa: true },
  { id: "las-brenas", slug: "las-brenas", nombre: "Las Breñas", provincia: "Chaco", activa: true },
  { id: "corzuela", slug: "corzuela", nombre: "Corzuela", provincia: "Chaco", activa: true },
  { id: "presidencia-roque-saenz-pena", slug: "presidencia-roque-saenz-pena", nombre: "Presidencia Roque Sáenz Peña", provincia: "Chaco", activa: true },
]

function normalizeCity(docId: string, data: Record<string, unknown>): Ciudad {
  return {
    id: docId,
    slug: String(data.slug ?? docId),
    nombre: String(data.nombre ?? docId),
    provincia: String(data.provincia ?? "Chaco"),
    activa: Boolean(data.activa ?? true),
    descripcion: data.descripcion != null ? String(data.descripcion) : undefined,
    poblacion: data.poblacion != null ? Number(data.poblacion) : undefined,
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
    updatedAt: data.updatedAt != null ? String(data.updatedAt) : undefined,
  }
}

export async function getCiudades(): Promise<Ciudad[]> {
  if (!hasFirebaseClientConfig) return CIUDADES_FALLBACK
  try {
    const db = getFirebaseDb()
    if (!db) return CIUDADES_FALLBACK
    const snap = await getDocs(query(collection(db, "ciudades"), orderBy("nombre", "asc")))
    const result = snap.docs.map(d => normalizeCity(d.id, d.data()))
    return result.length > 0 ? result : CIUDADES_FALLBACK
  } catch {
    return CIUDADES_FALLBACK
  }
}

export async function getCiudadesActivas(): Promise<Ciudad[]> {
  if (!hasFirebaseClientConfig) return CIUDADES_FALLBACK.filter(c => c.activa)
  try {
    const db = getFirebaseDb()
    if (!db) return CIUDADES_FALLBACK.filter(c => c.activa)
    const snap = await getDocs(
      query(collection(db, "ciudades"), where("activa", "==", true), orderBy("nombre", "asc"))
    )
    const result = snap.docs.map(d => normalizeCity(d.id, d.data()))
    return result.length > 0 ? result : CIUDADES_FALLBACK.filter(c => c.activa)
  } catch {
    return CIUDADES_FALLBACK.filter(c => c.activa)
  }
}

export async function getCiudadBySlug(slug: string): Promise<Ciudad | null> {
  if (!hasFirebaseClientConfig) return CIUDADES_FALLBACK.find(c => c.slug === slug) ?? null
  try {
    const db = getFirebaseDb()
    if (!db) return CIUDADES_FALLBACK.find(c => c.slug === slug) ?? null
    const snap = await getDoc(doc(db, "ciudades", slug))
    return snap.exists() ? normalizeCity(snap.id, snap.data()) : null
  } catch {
    return null
  }
}
