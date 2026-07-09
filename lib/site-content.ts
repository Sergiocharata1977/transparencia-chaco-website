// Sin datos hardcodeados: municipios y publicaciones se cargan desde Firestore.
// Estos arrays vacios evitan mostrar contenido inventado en el sitio publico.
import type { Municipio, Publicacion } from "@/types/site"

export const fallbackMunicipios: Municipio[] = []
export const fallbackPublicaciones: Publicacion[] = []

export function getFallbackMunicipioBySlug(slug: string) {
  return fallbackMunicipios.find((municipio) => municipio.slug === slug) ?? null
}

export function getFallbackPublicacionBySlug(slug: string) {
  return fallbackPublicaciones.find((publicacion) => publicacion.slug === slug) ?? null
}
