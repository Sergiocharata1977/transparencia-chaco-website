import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore"

import { getFirebaseDb, hasFirebaseClientConfig } from "@/lib/firebase/config"

export interface Publicacion {
  id: string
  titulo: string
  extracto: string
  contenido: string
  categoria: string
  municipio: string
  municipioSlug: string
  autor?: string
  imagen?: string
  publishedAt?: string
  createdAt?: string
}

const FALLBACK_PUBLICACIONES: Publicacion[] = []

function normalizePublicacion(docId: string, data: Record<string, unknown>): Publicacion {
  return {
    id: docId,
    titulo: String(data.titulo ?? ""),
    extracto: String(data.extracto ?? ""),
    contenido: String(data.contenido ?? ""),
    categoria: String(data.categoria ?? "general"),
    municipio: String(data.municipio ?? ""),
    municipioSlug: String(data.municipioSlug ?? ""),
    autor: data.autor != null ? String(data.autor) : undefined,
    imagen: data.imagen != null ? String(data.imagen) : undefined,
    publishedAt: data.publishedAt != null ? String(data.publishedAt) : undefined,
    createdAt: data.createdAt != null ? String(data.createdAt) : undefined,
  }
}

export async function getPublicaciones(municipioSlug?: string): Promise<Publicacion[]> {
  if (!hasFirebaseClientConfig) {
    if (municipioSlug) {
      return FALLBACK_PUBLICACIONES.filter(
        (p) => p.municipioSlug === municipioSlug || p.municipioSlug === "todos",
      )
    }
    return FALLBACK_PUBLICACIONES
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      if (municipioSlug) {
        return FALLBACK_PUBLICACIONES.filter(
          (p) => p.municipioSlug === municipioSlug || p.municipioSlug === "todos",
        )
      }
      return FALLBACK_PUBLICACIONES
    }

    if (municipioSlug) {
      // Fetch publications for the specific municipality
      const municipioQuery = query(
        collection(db, "publicaciones"),
        where("estadoEditorial", "==", "published"),
        where("visibilidadPublica", "==", true),
        where("municipioSlug", "==", municipioSlug),
        orderBy("publishedAt", "desc"),
        limit(20),
      )

      // Also fetch publications marked for "todos"
      const todosQuery = query(
        collection(db, "publicaciones"),
        where("estadoEditorial", "==", "published"),
        where("visibilidadPublica", "==", true),
        where("municipioSlug", "==", "todos"),
        orderBy("publishedAt", "desc"),
        limit(20),
      )

      const [municipioSnap, todosSnap] = await Promise.all([
        getDocs(municipioQuery),
        getDocs(todosQuery),
      ])

      const seenIds = new Set<string>()
      const results: Publicacion[] = []

      for (const item of [...municipioSnap.docs, ...todosSnap.docs]) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id)
          results.push(normalizePublicacion(item.id, item.data()))
        }
      }

      // Sort merged results by publishedAt descending
      results.sort((a, b) => {
        const dateA = a.publishedAt ?? a.createdAt ?? ""
        const dateB = b.publishedAt ?? b.createdAt ?? ""
        return dateB.localeCompare(dateA)
      })

      return results.length > 0 ? results : FALLBACK_PUBLICACIONES
    }

    const baseQuery = query(
      collection(db, "publicaciones"),
      where("estadoEditorial", "==", "published"),
      where("visibilidadPublica", "==", true),
      orderBy("publishedAt", "desc"),
      limit(20),
    )

    const snapshot = await getDocs(baseQuery)
    const publicaciones = snapshot.docs.map((item) => normalizePublicacion(item.id, item.data()))
    return publicaciones.length > 0 ? publicaciones : FALLBACK_PUBLICACIONES
  } catch {
    if (municipioSlug) {
      return FALLBACK_PUBLICACIONES.filter(
        (p) => p.municipioSlug === municipioSlug || p.municipioSlug === "todos",
      )
    }
    return FALLBACK_PUBLICACIONES
  }
}

export async function getPublicacionById(id: string): Promise<Publicacion | null> {
  if (!hasFirebaseClientConfig) {
    return FALLBACK_PUBLICACIONES.find((p) => p.id === id) ?? null
  }

  try {
    const db = getFirebaseDb()
    if (!db) {
      return FALLBACK_PUBLICACIONES.find((p) => p.id === id) ?? null
    }

    const snapshot = await getDoc(doc(db, "publicaciones", id))
    return snapshot.exists()
      ? normalizePublicacion(snapshot.id, snapshot.data())
      : (FALLBACK_PUBLICACIONES.find((p) => p.id === id) ?? null)
  } catch {
    return FALLBACK_PUBLICACIONES.find((p) => p.id === id) ?? null
  }
}
